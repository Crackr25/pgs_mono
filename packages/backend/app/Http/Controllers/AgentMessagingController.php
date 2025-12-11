<?php

namespace App\Http\Controllers;

use App\Models\AgentConversation;
use App\Models\AgentMessage;
use App\Models\User;
use App\Events\AgentMessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AgentMessagingController extends Controller
{
    /**
     * Get all agent conversations for the authenticated agent
     */
    public function getConversations(Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied. Only agents can access messaging.'], 403);
        }

        $conversations = AgentConversation::forAgent($user->id)
            ->recent()
            ->with(['agent1', 'agent2', 'company1', 'company2', 'lastMessage'])
            ->paginate($request->get('per_page', 20));

        // Transform conversations to include other agent info
        $conversations->getCollection()->transform(function ($conversation) use ($user) {
            $otherAgent = $conversation->getOtherAgent($user->id);
            $otherCompany = $conversation->getOtherCompany($user->id);
            
            return [
                'id' => $conversation->id,
                'other_agent' => [
                    'id' => $otherAgent->id,
                    'name' => $otherAgent->name,
                    'email' => $otherAgent->email,
                ],
                'other_company' => [
                    'id' => $otherCompany->id,
                    'name' => $otherCompany->name,
                ],
                'last_message' => $conversation->lastMessage,
                'last_message_at' => $conversation->last_message_at,
                'unread_count' => $conversation->getUnreadCount($user->id),
                'created_at' => $conversation->created_at,
            ];
        });

        return response()->json($conversations);
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages($conversationId, Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $conversation = AgentConversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->agent1_id !== $user->id && $conversation->agent2_id !== $user->id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $messages = $conversation->messages()
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->paginate($request->get('per_page', 50));

        // Mark messages as read
        $conversation->markAsRead($user->id);

        return response()->json($messages);
    }

    /**
     * Send a message to another agent
     */
    public function sendMessage(Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied. Only agents can send messages.'], 403);
        }

        $request->validate([
            'conversation_id' => 'nullable|exists:agent_conversations,id',
            'receiver_id' => 'nullable|exists:users,id',
            'message' => 'nullable|string|max:2000',
            'images.*' => 'nullable|image|max:10240',
            'videos.*' => 'nullable|mimes:mp4,mov,avi,wmv|max:51200',
            'files.*' => 'nullable|file|max:20480',
        ]);

        // Ensure either conversation_id or receiver_id is provided
        if (!$request->conversation_id && !$request->receiver_id) {
            return response()->json(['error' => 'Either conversation_id or receiver_id is required'], 422);
        }

        // Ensure either message or attachment is provided
        if (!$request->message && !$request->hasFile('images') && !$request->hasFile('videos') && !$request->hasFile('files')) {
            return response()->json(['error' => 'Either message or attachment is required'], 422);
        }

        // Find or create conversation
        if ($request->conversation_id) {
            $conversation = AgentConversation::findOrFail($request->conversation_id);
            // Get receiver from conversation
            $receiverId = $conversation->agent1_id === $user->id ? $conversation->agent2_id : $conversation->agent1_id;
        } else {
            // Verify receiver is an agent
            $receiver = User::findOrFail($request->receiver_id);
            if ($receiver->usertype !== 'agent') {
                return response()->json(['error' => 'You can only message other agents'], 400);
            }
            $receiverId = $request->receiver_id;
            $conversation = AgentConversation::findOrCreateConversation($user->id, $request->receiver_id);
        }

        $images = [];
        $videos = [];
        $files = [];
        $messageType = 'text';

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('agent-messages/images', $filename, 'public');
                $images[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $image->getClientOriginalName()
                ];
            }
            $messageType = 'image';
        }

        // Handle video uploads
        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = Str::uuid() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('agent-messages/videos', $filename, 'public');
                $videos[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $video->getClientOriginalName()
                ];
            }
            $messageType = !empty($images) ? 'mixed' : 'video';
        }

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('agent-messages/files', $filename, 'public');
                $files[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ];
            }
            if (empty($images) && empty($videos)) {
                $messageType = 'file';
            }
        }

        // Create message
        $message = AgentMessage::create([
            'agent_conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'message_type' => $messageType,
            'images' => !empty($images) ? $images : null,
            'videos' => !empty($videos) ? $videos : null,
            'files' => !empty($files) ? $files : null,
        ]);

        // Update conversation
        $conversation->last_message_at = now();
        $conversation->incrementUnread($receiverId);
        $conversation->save();

        $message->load('sender', 'receiver');

        // Broadcast the message via WebSocket
        broadcast(new AgentMessageSent($message, $conversation))->toOthers();

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead($conversationId)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $conversation = AgentConversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->agent1_id !== $user->id && $conversation->agent2_id !== $user->id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        // Mark all unread messages as read
        $conversation->messages()
            ->where('receiver_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        $conversation->markAsRead($user->id);

        return response()->json(['message' => 'Messages marked as read']);
    }

    /**
     * Get list of all agents (for starting new conversations)
     */
    public function getAgents(Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $query = User::where('usertype', 'agent')
            ->where('id', '!=', $user->id)
            ->with('companyAgent.company');

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $agents = $query->paginate($request->get('per_page', 20));

        // Transform to include company info
        $agents->getCollection()->transform(function ($agent) {
            return [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'company' => $agent->companyAgent ? [
                    'id' => $agent->companyAgent->company->id,
                    'name' => $agent->companyAgent->company->name,
                ] : null,
            ];
        });

        return response()->json($agents);
    }

    /**
     * Start a new conversation or get existing one
     */
    public function startConversation(Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);

        // Verify target is an agent
        $targetAgent = User::findOrFail($request->agent_id);
        if ($targetAgent->usertype !== 'agent') {
            return response()->json(['error' => 'Target user is not an agent'], 400);
        }

        $conversation = AgentConversation::findOrCreateConversation($user->id, $request->agent_id);
        $conversation->load(['agent1', 'agent2', 'company1', 'company2']);

        $otherAgent = $conversation->getOtherAgent($user->id);
        $otherCompany = $conversation->getOtherCompany($user->id);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'other_agent' => [
                    'id' => $otherAgent->id,
                    'name' => $otherAgent->name,
                    'email' => $otherAgent->email,
                ],
                'other_company' => [
                    'id' => $otherCompany->id,
                    'name' => $otherCompany->name,
                ],
                'created_at' => $conversation->created_at,
            ]
        ]);
    }

    /**
     * Delete a message (only by sender)
     */
    public function deleteMessage($messageId)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $message = AgentMessage::findOrFail($messageId);

        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'You can only delete your own messages'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}

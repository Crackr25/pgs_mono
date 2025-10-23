<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Conversation;
// use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatMessageController extends Controller
{
    /**
     * Send a message in a conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'nullable|string|max:1000',
            'attachment' => 'nullable|file|max:10240', // 10MB max
            'message_type' => 'sometimes|string|in:text,image,file'
        ]);

        // Ensure either message or attachment is provided
        if (!$request->message && !$request->hasFile('attachment')) {
            return response()->json([
                'success' => false,
                'message' => 'Either message or attachment is required'
            ], 422);
        }

        $user = Auth::user();
        
        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where(function ($query) use ($user) {
                $query->where('seller_id', $user->id)
                      ->orWhere('buyer_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        // Determine receiver
        $receiverId = $conversation->seller_id === $user->id 
            ? $conversation->buyer_id 
            : $conversation->seller_id;

        // Handle file attachment if present
        $attachmentData = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('chat-attachments', $filename, 'public');
            
            $attachmentData = [
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'url' => url('storage/' . $path),
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension()
            ];
        }

        // Determine message type
        $messageType = 'text';
        if ($attachmentData) {
            $messageType = str_starts_with($attachmentData['type'], 'image/') ? 'image' : 'file';
        }

        // Create message
        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'message_type' => $messageType,
            'attachments' => $attachmentData ? [$attachmentData] : null
        ]);

        // Update conversation's last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Load relationships for broadcasting
        $message->load('sender', 'receiver');

        // Broadcast the message
        // broadcast(new MessageSent($message));

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'message' => $message->message,
                'message_type' => $message->message_type,
                'attachments' => $message->attachments,
                'created_at' => $message->created_at->toISOString(),
                'read' => $message->read,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'email' => $message->sender->email
                ]
            ]
        ], 201);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message_ids' => 'sometimes|array',
            'message_ids.*' => 'exists:chat_messages,id'
        ]);

        $user = Auth::user();

        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where(function ($query) use ($user) {
                $query->where('seller_id', $user->id)
                      ->orWhere('buyer_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        $query = ChatMessage::where('conversation_id', $request->conversation_id)
            ->where('receiver_id', $user->id)
            ->where('read', false);

        // If specific message IDs provided, only mark those
        if ($request->has('message_ids')) {
            $query->whereIn('id', $request->message_ids);
        }

        $updatedCount = $query->update(['read' => true]);

        return response()->json([
            'success' => true,
            'updated_count' => $updatedCount
        ]);
    }

    /**
     * Get unread message count for authenticated user
     */
    public function getUnreadCount(Request $request)
    {
        $user = Auth::user();
        
        $unreadCount = ChatMessage::where('receiver_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount
        ]);
    }
}

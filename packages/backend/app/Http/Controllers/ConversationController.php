<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ChatMessage;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * Get all conversations for the authenticated seller
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $conversations = Conversation::forSeller($user->id)
            ->with(['buyer', 'latestMessage', 'order'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                return [
                    'id' => $conversation->id,
                    'buyer' => [
                        'id' => $conversation->buyer->id,
                        'name' => $conversation->buyer->name,
                        'email' => $conversation->buyer->email
                    ],
                    'order_id' => $conversation->order_id,
                    'status' => $conversation->status,
                    'last_message_at' => $conversation->last_message_at,
                    'unread_count' => $conversation->unreadMessagesCount($user->id),
                    'latest_message' => $conversation->latestMessage ? [
                        'message' => $conversation->latestMessage->message,
                        'sender_id' => $conversation->latestMessage->sender_id,
                        'created_at' => $conversation->latestMessage->created_at
                    ] : null
                ];
            });

        return response()->json([
            'success' => true,
            'conversations' => $conversations
        ]);
    }

    /**
     * Get messages for a specific conversation
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        $conversation = Conversation::with(['chatMessages.sender', 'buyer', 'seller'])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('seller_id', $user->id)
                      ->orWhere('buyer_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Mark messages as read for the current user
        $conversation->chatMessages()
            ->where('receiver_id', $user->id)
            ->where('read', false)
            ->update(['read' => true]);

        $messages = $conversation->chatMessages->map(function ($message) {
            return [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'message' => $message->message,
                'created_at' => $message->created_at->toISOString(),
                'read' => $message->read,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'email' => $message->sender->email
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'buyer' => [
                    'id' => $conversation->buyer->id,
                    'name' => $conversation->buyer->name,
                    'email' => $conversation->buyer->email
                ],
                'seller' => [
                    'id' => $conversation->seller->id,
                    'name' => $conversation->seller->name,
                    'email' => $conversation->seller->email
                ],
                'order_id' => $conversation->order_id,
                'status' => $conversation->status
            ],
            'messages' => $messages
        ]);
    }

    /**
     * Create a new conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'buyer_id' => 'required|exists:users,id',
            'order_id' => 'nullable|exists:orders,id',
            'initial_message' => 'required|string|max:1000'
        ]);

        $user = Auth::user();

        // Check if conversation already exists
        $existingConversation = Conversation::where('seller_id', $user->id)
            ->where('buyer_id', $request->buyer_id)
            ->first();

        if ($existingConversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation already exists',
                'conversation_id' => $existingConversation->id
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Create conversation
            $conversation = Conversation::create([
                'seller_id' => $user->id,
                'buyer_id' => $request->buyer_id,
                'order_id' => $request->order_id,
                'last_message_at' => now()
            ]);

            // Create initial message
            $message = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'receiver_id' => $request->buyer_id,
                'message' => $request->initial_message
            ]);

            // Load relationships for broadcasting
            $message->load('sender', 'receiver');

            // Broadcast the message
            broadcast(new MessageSent($message));

            DB::commit();

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => $message
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create conversation'
            ], 500);
        }
    }
}

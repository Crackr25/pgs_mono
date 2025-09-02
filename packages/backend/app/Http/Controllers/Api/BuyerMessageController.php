<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\Company;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BuyerMessageController extends Controller
{
    /**
     * Get all conversations for the authenticated buyer
     */
    public function getConversations(Request $request)
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('buyer_id', $user->id)
            ->with(['seller', 'latestMessage', 'order'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                return [
                    'id' => $conversation->id,
                    'seller' => [
                        'id' => $conversation->seller->id,
                        'name' => $conversation->seller->name,
                        'email' => $conversation->seller->email,
                        'company' => $conversation->seller->company ? [
                            'id' => $conversation->seller->company->id,
                            'name' => $conversation->seller->company->name,
                            'location' => $conversation->seller->company->location,
                            'verified' => $conversation->seller->company->verified
                        ] : null
                    ],
                    'order_id' => $conversation->order_id,
                    'status' => $conversation->status,
                    'last_message_at' => $conversation->last_message_at,
                    'unread_count' => $conversation->unreadMessagesCount($user->id),
                    'latest_message' => $conversation->latestMessage ? [
                        'message' => $conversation->latestMessage->message,
                        'sender_id' => $conversation->latestMessage->sender_id,
                        'message_type' => $conversation->latestMessage->message_type,
                        'product_id' => $conversation->latestMessage->product_id,
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
     * Get messages for a specific conversation (buyer view)
     */
    public function getConversationMessages(Request $request, $id)
    {
        $user = Auth::user();
        
        $conversation = Conversation::with(['chatMessages.sender', 'seller'])
            ->where('id', $id)
            ->where('buyer_id', $user->id) // Only buyer's conversations
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Mark messages as read for the buyer
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
                'message_type' => $message->message_type,
                'product_id' => $message->product_id,
                'attachments' => $message->attachments,
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
                'seller' => [
                    'id' => $conversation->seller->id,
                    'name' => $conversation->seller->name,
                    'email' => $conversation->seller->email,
                    'company' => $conversation->seller->company ? [
                        'id' => $conversation->seller->company->id,
                        'name' => $conversation->seller->company->name,
                        'location' => $conversation->seller->company->location,
                        'verified' => $conversation->seller->company->verified,
                        'logo' => $conversation->seller->company->logo
                    ] : null
                ],
                'order_id' => $conversation->order_id,
                'status' => $conversation->status
            ],
            'messages' => $messages
        ]);
    }

    /**
     * Send a message from buyer to seller
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'nullable|exists:conversations,id',
            'recipient_id' => 'required_without:conversation_id|integer',
            'recipient_type' => 'sometimes|string|in:user,company',
            'message' => 'required|string|max:1000',
            'message_type' => 'sometimes|string|in:text,product_inquiry',
            'product_id' => 'nullable|exists:products,id'
        ]);

        $user = Auth::user();
        $conversation = null;
        
        // If conversation_id is provided, verify buyer access
        if ($request->conversation_id) {
            $conversation = Conversation::where('id', $request->conversation_id)
                ->where('buyer_id', $user->id) // Only buyer's conversations
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or access denied'
                ], 404);
            }
        } else {
            // Create or find conversation with recipient
            $recipientId = $request->recipient_id;
            
            // For company recipients, find the company owner/representative
            if ($request->recipient_type === 'company') {
                $company = Company::find($recipientId);
                if (!$company || !$company->user_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Company not found or no representative available'
                    ], 404);
                }
                $recipientId = $company->user_id;
            }
            
            // Check if conversation already exists
            $conversation = Conversation::where('buyer_id', $user->id)
                ->where('seller_id', $recipientId)
                ->first();
            
            // Create new conversation if none exists
            if (!$conversation) {
                $conversation = Conversation::create([
                    'seller_id' => $recipientId,
                    'buyer_id' => $user->id,
                    'last_message_at' => now()
                ]);
            }
        }

        // Create message
        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'receiver_id' => $conversation->seller_id,
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'product_id' => $request->product_id
        ]);

        // Update conversation's last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Load relationships for broadcasting
        $message->load('sender', 'receiver');

        // Broadcast the message
        broadcast(new MessageSent($message));

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'message' => $message->message,
                'message_type' => $message->message_type,
                'product_id' => $message->product_id,
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
     * Send a message with attachment from buyer to seller
     */
    public function sendAttachment(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'nullable|string|max:1000',
            'attachment' => 'required|file|max:10240', // 10MB max
            'message_type' => 'sometimes|string|in:attachment,image,file'
        ]);

        $user = Auth::user();
        
        // Verify buyer owns this conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where('buyer_id', $user->id) // Only buyer's conversations
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        // Handle file attachment
        $attachmentData = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('chat-attachments', $filename, 'public');
            
            $attachmentData = [
                'name' => $file->getClientOriginalName(),
                'original_name' => $file->getClientOriginalName(),
                'path' => $path,
                'url' => url('storage/' . $path),
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension()
            ];
        }

        // Determine message type
        $messageType = 'attachment';
        if ($attachmentData) {
            $messageType = str_starts_with($attachmentData['type'], 'image/') ? 'image' : 'file';
        }

        // Create message
        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'receiver_id' => $conversation->seller_id,
            'message' => $request->message,
            'message_type' => $messageType,
            'attachments' => $attachmentData ? [$attachmentData] : null
        ]);

        // Update conversation's last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Load relationships for broadcasting
        $message->load('sender', 'receiver');

        // Broadcast the message
        broadcast(new MessageSent($message));

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
     * Get unread message count for buyer
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

    /**
     * Mark messages as read for buyer
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message_ids' => 'sometimes|array',
            'message_ids.*' => 'exists:chat_messages,id'
        ]);

        $user = Auth::user();

        // Verify buyer owns this conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where('buyer_id', $user->id)
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
}

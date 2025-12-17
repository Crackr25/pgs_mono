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
     * Get all conversations for the authenticated user (seller, agent, or buyer)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Handle different user types
        if ($user->usertype === 'agent') {
            // For agents, get conversations assigned to them or unassigned conversations for their company
            $companyAgent = $user->companyAgent;
            if (!$companyAgent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not associated with any company'
                ], 403);
            }
            
            $conversations = Conversation::where(function($query) use ($user, $companyAgent) {
                // Conversations assigned to this agent
                $query->where('assigned_agent_id', $user->id)
                      // OR unassigned conversations for their company
                      ->orWhere(function($q) use ($companyAgent) {
                          $q->where('seller_id', $companyAgent->company->user_id)
                            ->whereNull('assigned_agent_id');
                      });
            })
            ->with(['buyer', 'latestMessage', 'order', 'assignedAgent'])
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
                    ] : null,
                    'assigned_agent' => $conversation->assignedAgent ? [
                        'id' => $conversation->assignedAgent->id,
                        'name' => $conversation->assignedAgent->name
                    ] : null
                ];
            });
        } else {
            // For sellers and buyers, use existing logic
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
        }

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
        
        $conversation = Conversation::with(['chatMessages.sender', 'buyer', 'seller', 'assignedAgent'])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                if ($user->usertype === 'agent') {
                    // Agents can view conversations assigned to them or unassigned conversations for their company
                    $companyAgent = $user->companyAgent;
                    if ($companyAgent) {
                        $query->where('assigned_agent_id', $user->id)
                              ->orWhere(function($q) use ($companyAgent) {
                                  $q->where('seller_id', $companyAgent->company->user_id)
                                    ->whereNull('assigned_agent_id');
                              });
                    }
                } else {
                    // Sellers and buyers use existing logic
                    $query->where('seller_id', $user->id)
                          ->orWhere('buyer_id', $user->id);
                }
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
            $messageData = [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'message' => $message->message,
                'message_type' => $message->message_type,
                'product_id' => $message->product_id,
                'product_context' => $message->product_context,
                'attachments' => $message->attachments,
                'created_at' => $message->created_at->toISOString(),
                'read' => $message->read,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'email' => $message->sender->email
                ]
            ];

            // Include payment link fields if this is a payment link message
            if ($message->message_type === 'payment_link') {
                $messageData['payment_link_id'] = $message->payment_link_id;
                $messageData['payment_amount'] = $message->payment_amount;
                $messageData['payment_currency'] = $message->payment_currency;
                $messageData['payment_description'] = $message->payment_description;
                $messageData['payment_status'] = $message->payment_status;
                $messageData['payment_expires_at'] = $message->payment_expires_at ? $message->payment_expires_at->toISOString() : null;
                $messageData['payment_paid_at'] = $message->payment_paid_at ? $message->payment_paid_at->toISOString() : null;
            }

            return $messageData;
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

    /**
     * Get messages after a specific timestamp for polling
     */
    public function getMessagesAfter(Request $request, $id)
    {
        $user = Auth::user();
        $timestamp = $request->query('timestamp');

        if (!$timestamp) {
            return response()->json([
                'success' => false,
                'message' => 'Timestamp parameter is required'
            ], 400);
        }

        // Check if user has access to this conversation
        $conversation = Conversation::where('id', $id);

        if ($user->usertype === 'agent') {
            $companyAgent = $user->companyAgent;
            if (!$companyAgent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not associated with any company'
                ], 403);
            }

            $conversation->where(function($query) use ($user, $companyAgent) {
                $query->where('assigned_agent_id', $user->id)
                      ->orWhere(function($q) use ($companyAgent) {
                          $q->where('seller_id', $companyAgent->company->user_id)
                            ->whereNull('assigned_agent_id');
                      });
            });
        } else {
            $conversation->where(function($query) use ($user) {
                $query->where('seller_id', $user->id)
                      ->orWhere('buyer_id', $user->id);
            });
        }

        $conversation = $conversation->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        // Get messages created after the timestamp
        $messages = ChatMessage::with(['sender'])
            ->where('conversation_id', $id)
            ->where('created_at', '>', $timestamp)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
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
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }
}

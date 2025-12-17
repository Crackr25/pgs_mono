<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Events\MessageSent;
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
                if ($user->usertype === 'agent') {
                    // Agents can send messages in conversations assigned to them or unassigned conversations for their company
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
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        // Determine receiver
        if ($user->usertype === 'agent') {
            // For agents, always send to the buyer (agents represent the company/seller)
            $receiverId = $conversation->buyer_id;
            
            // Auto-assign conversation to this agent if not already assigned
            if (!$conversation->assigned_agent_id) {
                $conversation->update([
                    'assigned_agent_id' => $user->id,
                    'assigned_at' => now(),
                    'assignment_type' => 'auto'
                ]);
            }
        } else {
            // For sellers and buyers, use existing logic
            $receiverId = $conversation->seller_id === $user->id 
                ? $conversation->buyer_id 
                : $conversation->seller_id;
        }

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
                'product_context' => $message->product_context,
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
                if ($user->usertype === 'agent') {
                    // Agents can mark messages as read in conversations assigned to them or unassigned conversations for their company
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

    /**
     * Send a payment link to buyer (agents only)
     */
    public function sendPaymentLink(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'sometimes|string|in:USD,PHP',
            'description' => 'required|string|max:500',
            'expires_in_hours' => 'sometimes|integer|min:1|max:168' // Max 7 days
        ]);

        $user = Auth::user();

        // Only agents can send payment links
        if ($user->usertype !== 'agent') {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can send payment links'
            ], 403);
        }

        // Verify agent has access to this conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where(function ($query) use ($user) {
                $companyAgent = $user->companyAgent;
                if ($companyAgent) {
                    $query->where('assigned_agent_id', $user->id)
                          ->orWhere(function($q) use ($companyAgent) {
                              $q->where('seller_id', $companyAgent->company->user_id)
                                ->whereNull('assigned_agent_id');
                          });
                }
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied'
            ], 404);
        }

        // Generate unique payment link ID
        $paymentLinkId = 'PAY_' . strtoupper(Str::random(16));

        // Calculate expiration time (default 24 hours)
        $expiresInHours = $request->expires_in_hours ?? 24;
        $expiresAt = now()->addHours($expiresInHours);

        // Create payment link message
        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $conversation->buyer_id,
            'message' => "💳 Payment Request\n\n" . $request->description . "\n\nAmount: " . $request->currency . " " . number_format($request->amount, 2),
            'message_type' => 'payment_link',
            'payment_link_id' => $paymentLinkId,
            'payment_amount' => $request->amount,
            'payment_currency' => $request->currency ?? 'USD',
            'payment_description' => $request->description,
            'payment_status' => 'pending',
            'payment_expires_at' => $expiresAt
        ]);

        // Update conversation's last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Auto-assign conversation to this agent if not already assigned
        if (!$conversation->assigned_agent_id) {
            $conversation->update([
                'assigned_agent_id' => $user->id,
                'assigned_at' => now(),
                'assignment_type' => 'auto'
            ]);
        }

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
                'payment_link_id' => $message->payment_link_id,
                'payment_amount' => $message->payment_amount,
                'payment_currency' => $message->payment_currency,
                'payment_description' => $message->payment_description,
                'payment_status' => $message->payment_status,
                'payment_expires_at' => $message->payment_expires_at->toISOString(),
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
     * Create Stripe Checkout Session for payment link
     */
    public function createCheckoutSession(Request $request, $paymentLinkId)
    {
        $user = Auth::user();

        // Find the payment link message
        $message = ChatMessage::where('payment_link_id', $paymentLinkId)
            ->where('receiver_id', $user->id)
            ->first();

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Payment link not found or access denied'
            ], 404);
        }

        // Check if already paid
        if ($message->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This payment link has already been paid'
            ], 400);
        }

        // Check if expired
        if ($message->payment_expires_at && $message->payment_expires_at->isPast()) {
            $message->update(['payment_status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'This payment link has expired'
            ], 400);
        }

        // Get conversation and company info
        $conversation = $message->conversation;
        $companyAgent = $message->sender->companyAgent;
        
        if (!$companyAgent || !$companyAgent->company) {
            return response()->json([
                'success' => false,
                'message' => 'Company information not found'
            ], 404);
        }

        $company = $companyAgent->company;

        // Check if company has Stripe account
        if (!$company->stripe_account_id) {
            return response()->json([
                'success' => false,
                'message' => 'Seller has not set up payment processing'
            ], 400);
        }

        try {
            // Initialize Stripe
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Calculate platform fee (5%)
            $platformFeeAmount = round($message->payment_amount * 0.05 * 100); // in cents
            $totalAmount = round($message->payment_amount * 100); // in cents

            // Create Checkout Session
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($message->payment_currency),
                        'product_data' => [
                            'name' => 'Payment Request',
                            'description' => $message->payment_description,
                        ],
                        'unit_amount' => $totalAmount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/buyer/messages?payment=success&payment_link_id=' . $paymentLinkId,
                'cancel_url' => config('app.frontend_url') . '/buyer/messages?payment=cancelled',
                'client_reference_id' => $paymentLinkId,
                'metadata' => [
                    'payment_link_id' => $paymentLinkId,
                    'conversation_id' => $conversation->id,
                    'buyer_id' => $user->id,
                    'seller_id' => $conversation->seller_id,
                    'company_id' => $company->id
                ],
                'payment_intent_data' => [
                    'application_fee_amount' => $platformFeeAmount,
                    'transfer_data' => [
                        'destination' => $company->stripe_account_id,
                    ],
                ],
            ]);

            return response()->json([
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id
            ]);

        } catch (\Exception $e) {
            \Log::error('Checkout session creation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session. Please try again.'
            ], 500);
        }
    }

    /**
     * Handle successful payment (webhook or redirect)
     */
    public function handlePaymentSuccess($paymentLinkId)
    {
        $message = ChatMessage::where('payment_link_id', $paymentLinkId)->first();

        if (!$message || $message->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Payment link not found or already processed'
            ], 404);
        }

        // Update message status
        $message->update([
            'payment_status' => 'paid',
            'payment_paid_at' => now()
        ]);

        // Send confirmation message
        $confirmationMessage = ChatMessage::create([
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'message' => "✅ Payment Received\n\nThank you! Your payment of " . $message->payment_currency . " " . number_format($message->payment_amount, 2) . " has been successfully processed.",
            'message_type' => 'text'
        ]);

        $confirmationMessage->load('sender', 'receiver');
        broadcast(new MessageSent($confirmationMessage));

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed'
        ]);
    }

    /**
     * Get payment link details
     */
    public function getPaymentLink($paymentLinkId)
    {
        $user = Auth::user();

        $message = ChatMessage::where('payment_link_id', $paymentLinkId)
            ->where('receiver_id', $user->id)
            ->with(['sender', 'conversation'])
            ->first();

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Payment link not found or access denied'
            ], 404);
        }

        // Check if expired
        if ($message->payment_expires_at && $message->payment_expires_at->isPast() && $message->payment_status === 'pending') {
            $message->update(['payment_status' => 'expired']);
        }

        return response()->json([
            'success' => true,
            'payment_link' => [
                'id' => $message->payment_link_id,
                'amount' => $message->payment_amount,
                'currency' => $message->payment_currency,
                'description' => $message->payment_description,
                'status' => $message->payment_status,
                'expires_at' => $message->payment_expires_at ? $message->payment_expires_at->toISOString() : null,
                'paid_at' => $message->payment_paid_at ? $message->payment_paid_at->toISOString() : null,
                'seller' => [
                    'name' => $message->sender->name,
                    'company' => $message->sender->companyAgent ? $message->sender->companyAgent->company->name : null
                ]
            ]
        ]);
    }
}

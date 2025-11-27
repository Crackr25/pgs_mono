<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminChatController extends Controller
{
    /**
     * Get chat statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_conversations' => Conversation::count(),
            'active_conversations' => Conversation::where('status', 'active')->count(),
            'total_messages' => ChatMessage::count(),
            'messages_today' => ChatMessage::whereDate('created_at', today())->count(),
            'unread_messages' => ChatMessage::where('read', false)->count(),
            'recent_conversations' => Conversation::where('created_at', '>=', now()->subDays(7))->count(),
            'conversations_by_status' => Conversation::select('status', DB::raw('count(*) as count'))
                                                    ->groupBy('status')
                                                    ->get()
                                                    ->pluck('count', 'status'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get all conversations with pagination and filtering
     */
    public function conversations(Request $request): JsonResponse
    {
        $query = Conversation::with(['seller', 'buyer', 'assignedAgent', 'latestMessage']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('seller', function($sellerQuery) use ($search) {
                    $sellerQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('buyer', function($buyerQuery) use ($search) {
                    $buyerQuery->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'last_message_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $conversations = $query->paginate($perPage);

        // Add message count to each conversation
        $conversations->getCollection()->transform(function ($conversation) {
            $conversation->message_count = $conversation->chatMessages()->count();
            $conversation->unread_count = $conversation->chatMessages()->where('read', false)->count();
            return $conversation;
        });

        return response()->json($conversations);
    }

    /**
     * Get specific conversation with messages
     */
    public function show($id): JsonResponse
    {
        $conversation = Conversation::with([
            'seller',
            'buyer',
            'assignedAgent',
            'order',
            'chatMessages.sender',
            'chatMessages.receiver'
        ])->findOrFail($id);

        $stats = [
            'total_messages' => $conversation->chatMessages->count(),
            'unread_messages' => $conversation->chatMessages->where('read', false)->count(),
            'first_message_at' => $conversation->chatMessages->first()?->created_at,
            'last_message_at' => $conversation->chatMessages->last()?->created_at,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => $conversation,
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Get messages for a conversation
     */
    public function messages($conversationId, Request $request): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        $query = ChatMessage::where('conversation_id', $conversationId)
                           ->with(['sender', 'receiver']);

        // Paginate
        $perPage = $request->get('per_page', 50);
        $messages = $query->orderBy('created_at', 'asc')->paginate($perPage);

        return response()->json($messages);
    }

    /**
     * Get recent conversations
     */
    public function recent(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);
        $perPage = $request->get('per_page', 15);
        
        $conversations = Conversation::with(['seller', 'buyer', 'latestMessage'])
                                    ->where('created_at', '>=', now()->subDays($days))
                                    ->orderBy('last_message_at', 'desc')
                                    ->paginate($perPage);

        return response()->json($conversations);
    }

    /**
     * Get active conversations
     */
    public function active(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        
        $conversations = Conversation::with(['seller', 'buyer', 'latestMessage'])
                                    ->where('status', 'active')
                                    ->orderBy('last_message_at', 'desc')
                                    ->paginate($perPage);

        return response()->json($conversations);
    }

    /**
     * Search messages
     */
    public function searchMessages(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $query = ChatMessage::with(['conversation.seller', 'conversation.buyer', 'sender', 'receiver'])
                           ->where('message', 'like', '%' . $request->query . '%');

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 20);
        $messages = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($messages);
    }

    /**
     * Get conversation activity/timeline
     */
    public function activity($id): JsonResponse
    {
        $conversation = Conversation::with(['chatMessages'])->findOrFail($id);
        
        $activity = [
            'conversation_created' => $conversation->created_at,
            'last_message_at' => $conversation->last_message_at,
            'status' => $conversation->status,
            'total_messages' => $conversation->chatMessages->count(),
            'message_timeline' => $conversation->chatMessages()
                                              ->select('created_at', 'sender_id', 'message_type')
                                              ->orderBy('created_at', 'desc')
                                              ->limit(50)
                                              ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Update conversation status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,archived,closed'
        ]);

        $conversation->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Conversation status updated successfully',
            'data' => $conversation
        ]);
    }

    /**
     * Assign agent to conversation
     */
    public function assignAgent(Request $request, $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
            'assignment_type' => 'nullable|string'
        ]);

        $conversation->update([
            'assigned_agent_id' => $validated['agent_id'],
            'assigned_at' => now(),
            'assignment_type' => $validated['assignment_type'] ?? 'manual'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigned successfully',
            'data' => $conversation->load('assignedAgent')
        ]);
    }

    /**
     * Get unread messages count
     */
    public function unreadCount(): JsonResponse
    {
        $count = ChatMessage::where('read', false)->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count]
        ]);
    }
}

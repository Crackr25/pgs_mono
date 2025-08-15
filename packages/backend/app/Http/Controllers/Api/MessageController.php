<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Message::with(['recipientCompany', 'relatedQuote', 'relatedOrder']);
        
        // Filter by recipient company (for company owners to see their messages)
        if ($request->has('company_id')) {
            $company = Company::findOrFail($request->company_id);
            
            // Check if user owns this company
            if ($company->user_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $query->where('recipient_company_id', $request->company_id);
        }
        
        // Filter by unread status
        if ($request->has('unread')) {
            $query->where('unread', $request->boolean('unread'));
        }
        
        // Filter by message type
        if ($request->has('message_type')) {
            $query->where('message_type', $request->message_type);
        }
        
        // Search by sender name or message content
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('sender_name', 'like', "%{$search}%")
                  ->orWhere('sender_company', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        $messages = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email',
            'sender_company' => 'nullable|string|max:255',
            'recipient_company_id' => 'required|exists:companies,id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
            'message_type' => 'sometimes|in:inquiry,quote_response,order_update,general',
            'related_quote_id' => 'nullable|exists:quotes,id',
            'related_order_id' => 'nullable|exists:orders,id'
        ]);

        $message = Message::create($validated);
        
        return response()->json($message->load(['recipientCompany', 'relatedQuote', 'relatedOrder']), 201);
    }

    public function show(Message $message): JsonResponse
    {
        // Check if user owns the recipient company
        if ($message->recipientCompany->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($message->load(['recipientCompany', 'relatedQuote', 'relatedOrder']));
    }

    public function markAsRead(Message $message): JsonResponse
    {
        // Check if user owns the recipient company
        if ($message->recipientCompany->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update(['unread' => false]);
        
        return response()->json($message);
    }

    public function destroy(Message $message): JsonResponse
    {
        // Check if user owns the recipient company
        if ($message->recipientCompany->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();
        
        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function getUnreadCount(Request $request): JsonResponse
    {
        if (!$request->has('company_id')) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $company = Company::findOrFail($request->company_id);
        
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $unreadCount = Message::where('recipient_company_id', $request->company_id)
                              ->where('unread', true)
                              ->count();
        
        return response()->json(['unread_count' => $unreadCount]);
    }
}

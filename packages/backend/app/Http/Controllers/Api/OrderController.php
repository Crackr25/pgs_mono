<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {

        $query = Order::with(['quote', 'company', 'payments']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        
        // Filter by company (for sellers)
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        
        // Filter by buyer email (for buyers)
        if ($request->has('buyer_email')) {
            $query->where('buyer_email', $request->buyer_email);
        }
        
        // Search by order number or product name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('buyer_name', 'like', "%{$search}%");
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        // Debug: Log incoming request data
        \Log::info('Order creation request:', $request->all());
        
        $validated = $request->validate([
            'quote_id' => 'nullable|exists:quotes,id',
            'company_id' => 'required|exists:companies,id',
            'product_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'buyer_name' => 'required|string',
            'buyer_email' => 'required|email',
            'buyer_company' => 'nullable|string',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
            // Additional fields for checkout integration
            'payment_method' => 'nullable|string',
            'payment_intent_id' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'cart_items' => 'nullable|array',
            'cart_items.*.product_id' => 'required_with:cart_items|exists:products,id',
            'cart_items.*.quantity' => 'required_with:cart_items|integer|min:1',
            'cart_items.*.unit_price' => 'required_with:cart_items|numeric|min:0',
            'cart_items.*.selected_specifications' => 'nullable'
        ]);

        // Generate unique order number
        $validated['order_number'] = 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);
        
        // Set default status
        $validated['status'] = 'pending';
        $validated['payment_status'] = $validated['payment_intent_id'] ? 'paid' : 'pending';
        
        // Extract cart_items before creating order (if we need to store them separately)
        $cartItems = $validated['cart_items'] ?? null;
        unset($validated['cart_items']);
        
        $order = Order::create($validated);
        
        // If we have cart items, we could store them in a separate order_items table
        // For now, we'll store them as JSON in the notes field if needed
        if ($cartItems) {
            $order->update([
                'notes' => ($order->notes ? $order->notes . "\n\n" : '') . 
                          "Cart Items: " . json_encode($cartItems)
            ]);
        }
        
        // If created from quote, update quote status
        if (isset($validated['quote_id']) && $validated['quote_id']) {
            Quote::find($validated['quote_id'])->update(['status' => 'accepted']);
        }
        
        return response()->json([
            'success' => true,
            'data' => $order->load(['quote', 'company']),
            'message' => 'Order created successfully'
        ], 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['quote', 'company', 'payments']));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        // Only allow updates by the company that owns the order
        if ($order->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,in_production,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,partial,paid,refunded',
            'estimated_delivery' => 'sometimes|date',
            'progress' => 'sometimes|integer|min:0|max:100',
            'notes' => 'nullable|string'
        ]);

        $order->update($validated);
        
        return response()->json($order->load(['quote', 'company']));
    }

    public function tracking(Order $order): JsonResponse
    {
        $tracking = [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'progress' => $order->progress,
            'estimated_delivery' => $order->estimated_delivery,
            'timeline' => [
                [
                    'status' => 'confirmed',
                    'date' => $order->created_at,
                    'completed' => in_array($order->status, ['confirmed', 'in_production', 'shipped', 'delivered'])
                ],
                [
                    'status' => 'in_production',
                    'date' => null,
                    'completed' => in_array($order->status, ['in_production', 'shipped', 'delivered'])
                ],
                [
                    'status' => 'shipped',
                    'date' => null,
                    'completed' => in_array($order->status, ['shipped', 'delivered'])
                ],
                [
                    'status' => 'delivered',
                    'date' => null,
                    'completed' => $order->status === 'delivered'
                ]
            ]
        ];
        
        return response()->json($tracking);
    }

    public function destroy(Order $order): JsonResponse
    {
        // Only allow deletion by the company that owns the order
        if ($order->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow deletion if order is still pending
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Cannot delete order that is already in progress'], 400);
        }

        $order->delete();
        
        return response()->json(['message' => 'Order deleted successfully']);
    }
}

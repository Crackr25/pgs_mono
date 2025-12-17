<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Quote;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['quote.product', 'company', 'payments', 'user', 'reviews']);
        
        // Filter by company (for sellers/manufacturers)
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        } 
        // Filter by buyer email (for buyers)
        elseif ($request->has('buyer_email')) {
            $query->where('buyer_email', $request->buyer_email);
        }
        // Filter by authenticated user (buyers see only their orders)
        else {
            $query->where('user_id', auth()->id());
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
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
        
        // Filter by date range
        if ($request->has('date_filter')) {
            $dateFilter = $request->date_filter;
            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'week':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $query->where('created_at', '>=', now()->subDays(30));
                    break;
                case 'year':
                    $query->where('created_at', '>=', now()->subYear());
                    break;
            }
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(15);
        
        // Add product_id to each order
        $orders->getCollection()->transform(function ($order) {
            $order->product_id = null;
            
            // Get product_id from quote if available
            if ($order->quote && $order->quote->product_id) {
                $order->product_id = $order->quote->product_id;
            }
            // Otherwise, try to extract from cart_items in notes
            elseif ($order->notes && strpos($order->notes, 'Cart Items:') !== false) {
                try {
                    $notesArray = explode('Cart Items:', $order->notes);
                    if (count($notesArray) > 1) {
                        $cartItemsJson = trim($notesArray[1]);
                        $cartItems = json_decode($cartItemsJson, true);
                        if ($cartItems && is_array($cartItems) && count($cartItems) > 0) {
                            // Use the first product's ID
                            $order->product_id = $cartItems[0]['product_id'] ?? null;
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error parsing cart items:', ['error' => $e->getMessage()]);
                }
            }
            
            return $order;
        });
        
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        // Debug: Log incoming request data
        \Log::info('Order creation request:', [
            'request_data' => $request->all(),
            'has_payment_intent_id' => $request->has('payment_intent_id'),
            'payment_intent_id_value' => $request->get('payment_intent_id')
        ]);
        
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

        // Set the user_id from the authenticated user
        $validated['user_id'] = auth()->id();

        // Generate unique order number
        $validated['order_number'] = 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);
        
        // Set default status
        $validated['status'] = 'pending';
        $validated['payment_status'] = ($validated['payment_intent_id'] ?? null) ? 'paid' : 'pending';
        
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
            $quote = Quote::find($validated['quote_id']);
            if ($quote) {
                $quote->update(['status' => 'accepted']);
            }
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

    /**
     * Confirm order receipt by buyer
     */
    public function confirmReceipt(Request $request, $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        
        // Only the buyer can confirm receipt
        if ($order->buyer_email !== auth()->user()->email && $order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow confirmation if order is shipped or delivered
        if (!in_array($order->status, ['shipped', 'delivered'])) {
            return response()->json(['message' => 'Order must be shipped or delivered to confirm receipt'], 400);
        }

        // Update order
        $order->is_confirmed = true;
        $order->confirmed_at = now();
        if ($order->status === 'shipped') {
            $order->status = 'delivered';
        }
        $order->save();

        return response()->json([
            'message' => 'Order receipt confirmed successfully',
            'order' => $order->load(['company', 'quote.product'])
        ]);
    }

    /**
     * Submit review for order
     */
    public function submitReview(Request $request, $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        
        // Only the buyer can submit review
        if ($order->buyer_email !== auth()->user()->email && $order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow review if order is confirmed
        if (!$order->is_confirmed) {
            return response()->json(['message' => 'Order must be confirmed before reviewing'], 400);
        }

        // Check if already reviewed
        if ($order->reviews()->exists()) {
            return response()->json(['message' => 'Order has already been reviewed'], 400);
        }

        // Validate review data
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10',
            'productQuality' => 'required|integer|min:1|max:5',
            'deliverySpeed' => 'required|integer|min:1|max:5',
            'communication' => 'required|integer|min:1|max:5',
        ]);

        // Calculate average rating from all categories
        $averageRating = ($validated['rating'] + $validated['productQuality'] + 
                         $validated['deliverySpeed'] + $validated['communication']) / 4;

        // Create review in reviews table
        $review = Review::create([
            'company_id' => $order->company_id,
            'product_id' => $order->product_id,
            'order_id' => $order->id,
            'reviewer_name' => $order->buyer_name,
            'reviewer_email' => $order->buyer_email,
            'reviewer_company' => $order->buyer_company,
            'rating' => round($averageRating, 1),
            'title' => 'Order Review',
            'comment' => $validated['comment'],
            'verified' => true // Since it's from a confirmed order
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'order' => $order->load(['company', 'quote.product', 'reviews']),
            'review' => $review
        ]);
    }
}

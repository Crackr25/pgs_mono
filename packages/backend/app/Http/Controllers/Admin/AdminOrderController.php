<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * Get all orders with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with(['user', 'company', 'payments']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhere('buyer_name', 'like', "%{$search}%")
                  ->orWhere('buyer_email', 'like', "%{$search}%")
                  ->orWhere('buyer_company', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter by amount range
        if ($request->has('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Get order statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            'pending_revenue' => Order::where('payment_status', 'pending')->sum('total_amount'),
            'recent_orders' => Order::where('created_at', '>=', now()->subDays(7))->count(),
            'average_order_value' => Order::where('payment_status', 'paid')->avg('total_amount'),
            'orders_by_status' => Order::select('status', DB::raw('count(*) as count'))
                                      ->groupBy('status')
                                      ->get()
                                      ->pluck('count', 'status'),
            'orders_by_payment_status' => Order::select('payment_status', DB::raw('count(*) as count'))
                                               ->groupBy('payment_status')
                                               ->get()
                                               ->pluck('count', 'payment_status'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get a specific order
     */
    public function show($id): JsonResponse
    {
        $order = Order::with([
            'user', 
            'company', 
            'quote', 
            'payments',
            'sellerPayout'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update order information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,shipped,delivered,completed,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_delivery' => 'sometimes|date',
            'notes' => 'sometimes|string|nullable',
            'shipping_address' => 'sometimes|string|nullable',
            'billing_address' => 'sometimes|string|nullable',
        ]);

        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order->fresh(['user', 'company', 'payments'])
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $order->status = $validated['status'];
        
        // Auto-update progress based on status
        $progressMap = [
            'pending' => 0,
            'processing' => 25,
            'shipped' => 50,
            'delivered' => 75,
            'completed' => 100,
            'cancelled' => 0
        ];
        $order->progress = $progressMap[$validated['status']] ?? $order->progress;

        if (isset($validated['notes'])) {
            $order->notes = $validated['notes'];
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => [
                'status' => $order->status,
                'progress' => $order->progress
            ]
        ]);
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'notes' => 'nullable|string'
        ]);

        $order->payment_status = $validated['payment_status'];
        
        if ($validated['payment_status'] === 'paid' && !$order->paid_at) {
            $order->paid_at = now();
        }

        if (isset($validated['notes'])) {
            $order->notes = $validated['notes'];
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
            'data' => [
                'payment_status' => $order->payment_status,
                'paid_at' => $order->paid_at
            ]
        ]);
    }

    /**
     * Get orders by status
     */
    public function byStatus($status, Request $request): JsonResponse
    {
        $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status'
            ], 400);
        }

        $perPage = $request->get('per_page', 15);
        $orders = Order::with(['user', 'company'])
                      ->where('status', $status)
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Get pending orders
     */
    public function pending(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $orders = Order::with(['user', 'company'])
                      ->where('status', 'pending')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Get recent orders
     */
    public function recent(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);
        $perPage = $request->get('per_page', 15);
        
        $orders = Order::with(['user', 'company'])
                      ->where('created_at', '>=', now()->subDays($days))
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Get revenue statistics
     */
    public function revenue(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, week, month, year
        
        $query = Order::where('payment_status', 'paid');
        
        switch ($period) {
            case 'day':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->where('created_at', '>=', now()->subWeek());
                break;
            case 'month':
                $query->where('created_at', '>=', now()->subMonth());
                break;
            case 'year':
                $query->where('created_at', '>=', now()->subYear());
                break;
        }
        
        $revenue = [
            'total_revenue' => $query->sum('total_amount'),
            'order_count' => $query->count(),
            'average_order_value' => $query->avg('total_amount'),
            'period' => $period
        ];

        return response()->json([
            'success' => true,
            'data' => $revenue
        ]);
    }

    /**
     * Get order activity/history
     */
    public function activity($id): JsonResponse
    {
        $order = Order::with(['payments', 'sellerPayout'])->findOrFail($id);
        
        $activity = [
            'order_created' => $order->created_at,
            'order_updated' => $order->updated_at,
            'payment_completed' => $order->paid_at,
            'current_status' => $order->status,
            'payment_status' => $order->payment_status,
            'payments' => $order->payments,
            'payout' => $order->sellerPayout,
            'progress' => $order->progress,
        ];

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Export orders (placeholder for CSV/Excel export)
     */
    public function export(Request $request): JsonResponse
    {
        // Placeholder for export functionality
        // You can implement CSV/Excel export here
        
        return response()->json([
            'success' => true,
            'message' => 'Export functionality coming soon'
        ]);
    }

    /**
     * Bulk update orders
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders,id',
            'action' => 'required|in:update_status,update_payment_status,cancel',
            'status' => 'required_if:action,update_status|in:pending,processing,shipped,delivered,completed,cancelled',
            'payment_status' => 'required_if:action,update_payment_status|in:pending,paid,failed,refunded',
        ]);

        $orderIds = $validated['order_ids'];
        $action = $validated['action'];

        switch ($action) {
            case 'update_status':
                Order::whereIn('id', $orderIds)->update(['status' => $validated['status']]);
                $message = 'Order statuses updated successfully';
                break;
            case 'update_payment_status':
                Order::whereIn('id', $orderIds)->update(['payment_status' => $validated['payment_status']]);
                $message = 'Payment statuses updated successfully';
                break;
            case 'cancel':
                Order::whereIn('id', $orderIds)->update(['status' => 'cancelled']);
                $message = 'Orders cancelled successfully';
                break;
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }
}

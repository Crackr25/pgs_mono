<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminPaymentController extends Controller
{
    /**
     * Get all payments with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()->with(['order.user', 'order.company']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('order', function($orderQuery) use ($search) {
                      $orderQuery->where('order_number', 'like', "%{$search}%")
                                 ->orWhere('buyer_name', 'like', "%{$search}%")
                                 ->orWhere('buyer_email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
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
            $query->where('amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage);

        // Add platform fee to each payment
        $payments->getCollection()->transform(function ($payment) {
            $payment->platform_fee = $payment->platform_fee_amount;
            return $payment;
        });

        return response()->json($payments);
    }

    /**
     * Get payment statistics
     */
    public function statistics(): JsonResponse
    {
        $completedPayments = Payment::where('status', 'completed');
        
        $stats = [
            'total_payments' => Payment::count(),
            'completed_payments' => $completedPayments->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
            'total_revenue' => $completedPayments->sum('amount'),
            'total_platform_fees' => $this->calculateTotalPlatformFees(),
            'average_transaction' => $completedPayments->avg('amount'),
            'recent_payments' => Payment::where('created_at', '>=', now()->subDays(7))->count(),
            'payments_by_status' => Payment::select('status', DB::raw('count(*) as count'))
                                          ->groupBy('status')
                                          ->get()
                                          ->pluck('count', 'status'),
            'payments_by_method' => Payment::select('payment_method', DB::raw('count(*) as count'))
                                          ->groupBy('payment_method')
                                          ->get()
                                          ->pluck('count', 'payment_method'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Calculate total platform fees from gateway responses
     */
    private function calculateTotalPlatformFees()
    {
        $payments = Payment::where('status', 'completed')->get();
        $totalFees = 0;

        foreach ($payments as $payment) {
            $totalFees += $payment->platform_fee_amount;
        }

        return $totalFees;
    }

    /**
     * Get a specific payment
     */
    public function show($id): JsonResponse
    {
        $payment = Payment::with(['order.user', 'order.company', 'order.sellerPayout'])
                         ->findOrFail($id);

        $financialBreakdown = $payment->getFinancialBreakdown();
        $technicalDetails = $payment->getTechnicalDetails();

        return response()->json([
            'success' => true,
            'data' => [
                'payment' => $payment,
                'financial_breakdown' => $financialBreakdown,
                'technical_details' => $technicalDetails,
            ]
        ]);
    }

    /**
     * Get completed payments
     */
    public function completed(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $payments = Payment::with(['order.user', 'order.company'])
                          ->where('status', 'completed')
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json($payments);
    }

    /**
     * Get failed payments
     */
    public function failed(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $payments = Payment::with(['order.user', 'order.company'])
                          ->where('status', 'failed')
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json($payments);
    }

    /**
     * Get pending payments
     */
    public function pending(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $payments = Payment::with(['order.user', 'order.company'])
                          ->where('status', 'pending')
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json($payments);
    }

    /**
     * Get revenue statistics by period
     */
    public function revenue(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, week, month, year
        
        $query = Payment::where('status', 'completed');
        
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
        
        $payments = $query->get();
        $totalPlatformFees = 0;
        
        foreach ($payments as $payment) {
            $totalPlatformFees += $payment->platform_fee_amount;
        }
        
        $revenue = [
            'total_revenue' => $payments->sum('amount'),
            'platform_fees' => $totalPlatformFees,
            'payment_count' => $payments->count(),
            'average_transaction' => $payments->avg('amount'),
            'period' => $period
        ];

        return response()->json([
            'success' => true,
            'data' => $revenue
        ]);
    }

    /**
     * Get payments by payment method
     */
    public function byMethod($method, Request $request): JsonResponse
    {
        $validMethods = ['stripe', 'paypal', 'bank_transfer', 'cash'];
        
        if (!in_array($method, $validMethods)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment method'
            ], 400);
        }

        $perPage = $request->get('per_page', 15);
        $payments = Payment::with(['order.user', 'order.company'])
                          ->where('payment_method', $method)
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json($payments);
    }

    /**
     * Get platform fee breakdown
     */
    public function platformFees(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        
        $query = Payment::where('status', 'completed');
        
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
        
        $payments = $query->get();
        $totalFees = 0;
        $feesByCountry = [];
        
        foreach ($payments as $payment) {
            $fee = $payment->platform_fee_amount;
            $totalFees += $fee;
            
            $country = $payment->merchant_country;
            if (!isset($feesByCountry[$country])) {
                $feesByCountry[$country] = 0;
            }
            $feesByCountry[$country] += $fee;
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_platform_fees' => $totalFees,
                'fees_by_country' => $feesByCountry,
                'payment_count' => $payments->count(),
                'average_fee' => $payments->count() > 0 ? $totalFees / $payments->count() : 0,
                'period' => $period
            ]
        ]);
    }

    /**
     * Export payments (placeholder for CSV/Excel export)
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
     * Get payment activity/timeline
     */
    public function activity($id): JsonResponse
    {
        $payment = Payment::with(['order'])->findOrFail($id);
        
        $activity = [
            'payment_created' => $payment->created_at,
            'payment_updated' => $payment->updated_at,
            'payment_processed' => $payment->processed_at,
            'current_status' => $payment->status,
            'payment_method' => $payment->payment_method,
            'gateway_response' => $payment->gateway_response,
        ];

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }
}

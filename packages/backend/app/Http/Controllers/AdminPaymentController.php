<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Company;
use Carbon\Carbon;

class AdminPaymentController extends Controller
{
    /**
     * Get paginated payment ledger for admin dashboard
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Payment::with(['order.company', 'order.user'])
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_method') && $request->payment_method !== '') {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->has('date_from') && $request->date_from !== '') {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to !== '') {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('amount_min') && $request->amount_min !== '') {
                $query->where('amount', '>=', $request->amount_min);
            }

            if ($request->has('amount_max') && $request->amount_max !== '') {
                $query->where('amount', '<=', $request->amount_max);
            }

            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('transaction_id', 'like', "%{$search}%")
                      ->orWhereHas('order', function($orderQuery) use ($search) {
                          $orderQuery->where('id', 'like', "%{$search}%")
                                   ->orWhereHas('company', function($companyQuery) use ($search) {
                                       $companyQuery->where('name', 'like', "%{$search}%");
                                   });
                      });
                });
            }

            $payments = $query->paginate($request->get('per_page', 15));

            // Transform the data for admin view
            $payments->getCollection()->transform(function ($payment) {
                $gatewayResponse = $payment->gateway_response ?? [];
                
                return [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'transaction_id' => $payment->transaction_id,
                    'payment_method' => $payment->payment_method,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'processed_at' => $payment->processed_at,
                    'created_at' => $payment->created_at,
                    
                    // Order details
                    'order' => [
                        'id' => $payment->order->id ?? null,
                        'total_amount' => $payment->order->total_amount ?? null,
                        'payment_status' => $payment->order->payment_status ?? null,
                        'buyer_name' => $payment->order->user->name ?? $payment->order->user->full_name ?? 'Unknown',
                        'buyer_email' => $payment->order->user->email ?? 'Unknown',
                    ],
                    
                    // Merchant details
                    'merchant' => [
                        'id' => $payment->order->company->id ?? null,
                        'name' => $payment->order->company->name ?? 'Unknown',
                        'country' => $payment->order->company->country ?? 'Unknown',
                    ],
                    
                    // Financial breakdown
                    'financial_details' => [
                        'customer_paid' => $gatewayResponse['customer_paid'] ?? $payment->amount,
                        'platform_fee_percentage' => $gatewayResponse['platform_fee_percentage'] ?? 7.9,
                        'platform_fee_amount' => $gatewayResponse['platform_fee_amount'] ?? 0,
                        'merchant_amount' => $gatewayResponse['merchant_amount'] ?? 0,
                        'payment_flow' => $gatewayResponse['payment_flow'] ?? 'unknown',
                    ],
                    
                    // Technical details
                    'technical_details' => [
                        'payment_intent_id' => $gatewayResponse['payment_intent_id'] ?? null,
                        'merchant_country' => $gatewayResponse['merchant_country'] ?? 'Unknown',
                        'processed_at' => $gatewayResponse['processed_at'] ?? null,
                        'webhook_received_at' => $gatewayResponse['webhook_received_at'] ?? null,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                    'from' => $payments->firstItem(),
                    'to' => $payments->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment ledger: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment statistics for admin dashboard
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
            $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

            $baseQuery = Payment::whereBetween('created_at', [$dateFrom, $dateTo]);

            $stats = [
                'total_transactions' => $baseQuery->count(),
                'total_revenue' => $baseQuery->sum('amount'),
                'successful_payments' => $baseQuery->where('status', 'completed')->count(),
                'failed_payments' => $baseQuery->where('status', 'failed')->count(),
                'pending_payments' => $baseQuery->where('status', 'pending')->count(),
                
                'payment_methods' => $baseQuery->select('payment_method')
                    ->selectRaw('COUNT(*) as count, SUM(amount) as total_amount')
                    ->groupBy('payment_method')
                    ->get(),
                
                'daily_revenue' => $baseQuery->where('status', 'completed')
                    ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue, COUNT(*) as transactions')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
                
                'platform_fees_collected' => $this->calculatePlatformFees($dateFrom, $dateTo),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed payment information
     */
    public function show($id): JsonResponse
    {
        try {
            $payment = Payment::with(['order.company', 'order.user', 'order.orderItems.product'])
                ->findOrFail($id);

            $gatewayResponse = $payment->gateway_response ?? [];

            $paymentDetails = [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'transaction_id' => $payment->transaction_id,
                'payment_method' => $payment->payment_method,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'processed_at' => $payment->processed_at,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
                
                // Complete order details
                'order' => [
                    'id' => $payment->order->id,
                    'total_amount' => $payment->order->total_amount,
                    'payment_status' => $payment->order->payment_status,
                    'order_status' => $payment->order->status ?? 'pending',
                    'created_at' => $payment->order->created_at,
                    'items' => $payment->order->orderItems->map(function($item) {
                        return [
                            'product_name' => $item->product->name ?? 'Unknown Product',
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'total_price' => $item->total_price,
                        ];
                    }),
                    'buyer' => [
                        'name' => $payment->order->user->name ?? $payment->order->user->full_name ?? 'Unknown',
                        'email' => $payment->order->user->email ?? 'Unknown',
                    ]
                ],
                
                // Complete merchant details
                'merchant' => [
                    'id' => $payment->order->company->id,
                    'name' => $payment->order->company->name,
                    'country' => $payment->order->company->country,
                    'stripe_account_id' => $payment->order->company->stripe_account_id ?? null,
                ],
                
                // Complete financial breakdown
                'financial_breakdown' => [
                    'customer_paid' => $gatewayResponse['customer_paid'] ?? $payment->amount,
                    'platform_fee_percentage' => $gatewayResponse['platform_fee_percentage'] ?? 7.9,
                    'platform_fee_amount' => $gatewayResponse['platform_fee_amount'] ?? 0,
                    'merchant_amount' => $gatewayResponse['merchant_amount'] ?? 0,
                    'payment_flow' => $gatewayResponse['payment_flow'] ?? 'unknown',
                ],
                
                // Raw gateway response for debugging
                'gateway_response' => $gatewayResponse,
            ];

            return response()->json([
                'success' => true,
                'data' => $paymentDetails
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found or failed to fetch details: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Calculate total platform fees collected
     */
    private function calculatePlatformFees($dateFrom, $dateTo): array
    {
        $payments = Payment::whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->get();

        $totalFees = 0;
        $feesByCountry = [];

        foreach ($payments as $payment) {
            $gatewayResponse = $payment->gateway_response ?? [];
            $platformFee = $gatewayResponse['platform_fee_amount'] ?? 0;
            $country = $gatewayResponse['merchant_country'] ?? 'Unknown';

            $totalFees += $platformFee;
            
            if (!isset($feesByCountry[$country])) {
                $feesByCountry[$country] = 0;
            }
            $feesByCountry[$country] += $platformFee;
        }

        return [
            'total_platform_fees' => round($totalFees, 2),
            'fees_by_country' => $feesByCountry,
            'average_fee_per_transaction' => $payments->count() > 0 ? round($totalFees / $payments->count(), 2) : 0,
        ];
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Payment;
use App\Models\SellerPayout;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\Balance;
use Stripe\BalanceTransaction;

class AdminStripeController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        $stripeSecret = config('services.stripe.secret') ?: env('STRIPE_SECRET');
        
        if ($stripeSecret) {
            Stripe::setApiKey($stripeSecret);
        }
    }

    /**
     * Get Stripe overview statistics
     */
    public function overview(): JsonResponse
    {
        try {
            // Get connected accounts count
            $connectedAccounts = Company::whereNotNull('stripe_account_id')->count();
            $pendingAccounts = Company::whereNotNull('stripe_account_id')
                                     ->where('stripe_onboarding_status', '!=', 'complete')
                                     ->count();
            $activeAccounts = Company::whereNotNull('stripe_account_id')
                                    ->where('stripe_onboarding_status', 'complete')
                                    ->count();

            // Get payment statistics
            $stripePayments = Payment::where('payment_method', 'stripe')
                                    ->where('status', 'completed')
                                    ->get();
            
            $totalVolume = $stripePayments->sum('amount');
            $totalFees = 0;
            
            foreach ($stripePayments as $payment) {
                $totalFees += $payment->platform_fee_amount;
            }

            // Get recent activity
            $recentPayments = Payment::where('payment_method', 'stripe')
                                    ->where('created_at', '>=', now()->subDays(7))
                                    ->count();

            $stats = [
                'connected_accounts' => $connectedAccounts,
                'pending_accounts' => $pendingAccounts,
                'active_accounts' => $activeAccounts,
                'total_volume' => $totalVolume,
                'total_platform_fees' => $totalFees,
                'total_transactions' => $stripePayments->count(),
                'recent_activity' => $recentPayments,
                'average_transaction' => $stripePayments->count() > 0 ? $totalVolume / $stripePayments->count() : 0,
            ];

            // Try to get Stripe balance if API key is configured
            if (config('services.stripe.secret') || env('STRIPE_SECRET')) {
                try {
                    $balance = Balance::retrieve();
                    $stats['stripe_balance'] = [
                        'available' => $balance->available,
                        'pending' => $balance->pending,
                    ];
                } catch (\Exception $e) {
                    \Log::warning('Could not retrieve Stripe balance: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching Stripe overview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all connected Stripe accounts
     */
    public function connectedAccounts(Request $request): JsonResponse
    {
        $query = Company::whereNotNull('stripe_account_id')
                       ->with(['user']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('stripe_account_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by onboarding status
        if ($request->has('status')) {
            if ($request->status === 'complete') {
                $query->where('stripe_onboarding_status', 'complete');
            } elseif ($request->status === 'pending') {
                $query->where('stripe_onboarding_status', '!=', 'complete');
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $accounts = $query->paginate($perPage);

        return response()->json($accounts);
    }

    /**
     * Get specific Stripe account details
     */
    public function accountDetails($companyId): JsonResponse
    {
        try {
            $company = Company::with(['user'])->findOrFail($companyId);

            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account'
                ], 404);
            }

            $accountData = [
                'company' => $company,
                'stripe_account_id' => $company->stripe_account_id,
                'onboarding_complete' => $company->stripe_onboarding_complete,
                'country' => $company->stripe_country,
            ];

            // Try to fetch account details from Stripe
            try {
                $account = Account::retrieve($company->stripe_account_id);
                $accountData['stripe_details'] = [
                    'id' => $account->id,
                    'type' => $account->type,
                    'country' => $account->country,
                    'email' => $account->email,
                    'charges_enabled' => $account->charges_enabled,
                    'payouts_enabled' => $account->payouts_enabled,
                    'details_submitted' => $account->details_submitted,
                    'requirements' => $account->requirements,
                    'capabilities' => $account->capabilities,
                ];
            } catch (\Exception $e) {
                \Log::warning('Could not retrieve Stripe account details: ' . $e->getMessage());
                $accountData['stripe_error'] = $e->getMessage();
            }

            // Get payment statistics for this account
            $payments = Payment::whereHas('order', function($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })->where('payment_method', 'stripe')->get();

            $accountData['payment_stats'] = [
                'total_payments' => $payments->count(),
                'total_volume' => $payments->sum('amount'),
                'completed' => $payments->where('status', 'completed')->count(),
                'failed' => $payments->where('status', 'failed')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $accountData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching account details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Stripe transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        $query = Payment::where('payment_method', 'stripe')
                       ->with(['order.company', 'order.user']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function($orderQuery) use ($search) {
                      $orderQuery->where('order_number', 'like', "%{$search}%");
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
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $transactions = $query->paginate($perPage);

        // Add platform fee to each transaction
        $transactions->getCollection()->transform(function ($payment) {
            $payment->platform_fee = $payment->platform_fee_amount;
            return $payment;
        });

        return response()->json($transactions);
    }

    /**
     * Get Stripe payouts
     */
    public function payouts(Request $request): JsonResponse
    {
        $query = SellerPayout::with(['order.company', 'order.user']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('order', function($orderQuery) use ($search) {
                $orderQuery->where('order_number', 'like', "%{$search}%")
                          ->orWhereHas('company', function($companyQuery) use ($search) {
                              $companyQuery->where('name', 'like', "%{$search}%");
                          });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $payouts = $query->paginate($perPage);

        return response()->json($payouts);
    }

    /**
     * Get Stripe configuration status
     */
    public function configStatus(): JsonResponse
    {
        $config = [
            'stripe_key_configured' => !empty(config('services.stripe.secret') ?: env('STRIPE_SECRET')),
            'stripe_publishable_key_configured' => !empty(config('services.stripe.key') ?: env('STRIPE_KEY')),
            'webhook_secret_configured' => !empty(env('STRIPE_WEBHOOK_SECRET')),
            'environment' => app()->environment(),
        ];

        return response()->json([
            'success' => true,
            'data' => $config
        ]);
    }

    /**
     * Test Stripe connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $balance = Balance::retrieve();
            
            return response()->json([
                'success' => true,
                'message' => 'Stripe connection successful',
                'data' => [
                    'available' => $balance->available,
                    'pending' => $balance->pending,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe connection failed: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\SellerPayout;
use App\Models\Company;
use App\Models\Order;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Transfer;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SellerPayoutController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        $stripeSecret = env('STRIPE_SECRET');
        if (!empty($stripeSecret)) {
            Stripe::setApiKey($stripeSecret);
        }
    }

    /**
     * Get paginated seller payouts (admin view)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = SellerPayout::with(['company', 'order', 'adminUser']);

            // Filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payout_method')) {
                $query->where('payout_method', $request->payout_method);
            }

            if ($request->has('company_id')) {
                $query->where('company_id', $request->company_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('company', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('order', function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%");
                });
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $payouts = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'payouts' => $payouts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payouts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller payouts for authenticated company
     */
    public function getSellerPayouts(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $company = Company::where('user_id', $user->id)->first();

            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'No company found for authenticated user'
                ], 404);
            }

            $query = SellerPayout::with(['order'])
                ->where('company_id', $company->id);

            // Status filter
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $payouts = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'payouts' => $payouts,
                'summary' => [
                    'total_pending' => $company->getTotalPendingPayouts(),
                    'total_completed' => $company->getTotalCompletedPayouts(),
                    'default_payout_method' => $company->getDefaultPayoutMethod()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch seller payouts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create payout from paid order
     */
    public function createFromOrder(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
                'platform_fee_percentage' => 'sometimes|numeric|min:0|max:30',
                'payout_method' => 'sometimes|in:stripe,manual'
            ]);

            $order = Order::with('company')->findOrFail($request->order_id);

            // Check if order is eligible for payout
            if (!$order->isPayoutEligible()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not eligible for payout (must be paid and not already have a payout)'
                ], 400);
            }

            $platformFeePercentage = $request->get('platform_fee_percentage', 7.9);
            $payoutMethod = $request->get('payout_method');

            $payout = $order->createSellerPayout($platformFeePercentage, $payoutMethod);

            // If it's a Stripe payout for US sellers, process immediately
            if ($payout->isStripeMethod() && $order->company->country === 'US') {
                $this->processStripePayout($payout);
            }

            return response()->json([
                'success' => true,
                'message' => 'Seller payout created successfully',
                'payout' => $payout->load(['company', 'order'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payout: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process Stripe payout
     */
    public function processStripePayout(SellerPayout $payout): JsonResponse
    {
        try {
            if (!$payout->isStripeMethod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payout is not configured for Stripe processing'
                ], 400);
            }

            if (!$payout->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payout is not in pending status'
                ], 400);
            }

            $company = $payout->company;
            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account'
                ], 400);
            }

            $payout->markAsProcessing();

            // Create Stripe transfer
            $transfer = Transfer::create([
                'amount' => (int) round($payout->net_amount * 100), // Convert to cents
                'currency' => strtolower($payout->currency),
                'destination' => $company->stripe_account_id,
                'description' => "Payout for order #{$payout->order->order_number}",
                'metadata' => [
                    'payout_id' => $payout->id,
                    'order_id' => $payout->order_id,
                    'company_id' => $company->id,
                    'gross_amount_cents' => (int) round($payout->gross_amount * 100),
                    'platform_fee_cents' => (int) round($payout->platform_fee * 100),
                ]
            ]);

            // Update payout with Stripe transfer details
            $payout->update([
                'stripe_transfer_id' => $transfer->id,
                'stripe_response' => $transfer->toArray(),
                'status' => 'completed',
                'processed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stripe payout processed successfully',
                'transfer_id' => $transfer->id,
                'payout' => $payout->fresh()
            ]);

        } catch (ApiErrorException $e) {
            $payout->markAsFailed('Stripe API error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            $payout->markAsFailed('Processing error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process Stripe payout: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark manual payout as completed (admin only)
     */
    public function completeManualPayout(Request $request, SellerPayout $payout): JsonResponse
    {
        try {
            $request->validate([
                'manual_reference' => 'required|string|max:255',
                'manual_notes' => 'sometimes|string',
                'manual_details' => 'sometimes|array'
            ]);

            if (!$payout->isManualMethod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payout is not configured for manual processing'
                ], 400);
            }

            if (!$payout->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payout is not in pending status'
                ], 400);
            }

            $payout->update([
                'status' => 'completed',
                'admin_user_id' => Auth::id(),
                'manual_reference' => $request->manual_reference,
                'manual_notes' => $request->manual_notes,
                'manual_details' => $request->manual_details,
                'processed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Manual payout marked as completed',
                'payout' => $payout->fresh()->load(['company', 'order', 'adminUser'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete manual payout: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payout statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $query = SellerPayout::query();

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $stats = [
                'total_payouts' => $query->count(),
                'total_amount' => $query->sum('net_amount'),
                'total_platform_fees' => $query->sum('platform_fee'),
                'by_status' => $query->groupBy('status')
                    ->selectRaw('status, count(*) as count, sum(net_amount) as total_amount')
                    ->get(),
                'by_method' => $query->groupBy('payout_method')
                    ->selectRaw('payout_method, count(*) as count, sum(net_amount) as total_amount')
                    ->get(),
                'pending_amount' => SellerPayout::pending()->sum('net_amount'),
                'completed_amount' => SellerPayout::completed()->sum('net_amount'),
                'failed_amount' => SellerPayout::failed()->sum('net_amount')
            ];

            return response()->json([
                'success' => true,
                'statistics' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retry failed payout
     */
    public function retryPayout(SellerPayout $payout): JsonResponse
    {
        try {
            if (!$payout->isFailed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only failed payouts can be retried'
                ], 400);
            }

            // Reset payout to pending status
            $payout->update([
                'status' => 'pending',
                'failed_at' => null,
                'failure_reason' => null,
                'stripe_transfer_id' => null,
                'stripe_response' => null
            ]);

            // If it's a Stripe payout, process immediately
            if ($payout->isStripeMethod()) {
                return $this->processStripePayout($payout);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payout reset to pending status',
                'payout' => $payout->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retry payout: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use App\Models\Product;
use App\Models\Order;
use App\Models\SellerPayout;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key from environment
        $stripeSecret = env('STRIPE_SECRET');
        
        // Debug: Log what we're getting from env
        \Log::info('Stripe Secret from env:', [
            'value' => $stripeSecret ? 'SET (length: ' . strlen($stripeSecret) . ')' : 'NOT SET',
            'starts_with_sk' => $stripeSecret ? (str_starts_with($stripeSecret, 'sk_') ? 'YES' : 'NO') : 'N/A'
        ]);
        
        if (empty($stripeSecret)) {
            throw new \Exception('Stripe API key not configured. Please set STRIPE_SECRET in your .env file. Current value: ' . ($stripeSecret ?? 'NULL'));
        }
        
        if (!str_starts_with($stripeSecret, 'sk_')) {
            throw new \Exception('Invalid Stripe API key format. Key should start with "sk_". Current key starts with: ' . substr($stripeSecret, 0, 3));
        }
        
        Stripe::setApiKey($stripeSecret);
    }

    /**
     * Create a PaymentIntent for customer-to-merchant payment
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.50', // Minimum $0.50
                'currency' => 'sometimes|string',
                'merchant_company_id' => 'required|exists:companies,id',
                'customer_email' => 'required|email',
                'description' => 'sometimes|string|max:500',
                'metadata' => 'sometimes|array',
                'platform_fee_percentage' => 'sometimes|numeric|min:0|max:30' // Default 2.5% platform fee
            ]);

            $company = Company::findOrFail($request->merchant_company_id);

            // Check if merchant has completed Stripe onboarding
            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Merchant has not set up payment processing'
                ], 400);
            }

            if ($company->stripe_onboarding_status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Merchant has not completed payment setup'
                ], 400);
            }

            // Verify merchant account capabilities based on country
            try {
                $account = \Stripe\Account::retrieve($company->stripe_account_id);
                
                // Check if transfers capability is active (required for all sellers)
                if (!isset($account->capabilities->transfers) || $account->capabilities->transfers !== 'active') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Merchant account does not have transfers capability enabled. Please complete Stripe onboarding.',
                        'debug_info' => [
                            'account_id' => $account->id,
                            'transfers_capability' => $account->capabilities->transfers ?? 'not_set',
                            'card_payments_capability' => $account->capabilities->card_payments ?? 'not_set',
                            'details_submitted' => $account->details_submitted,
                            'charges_enabled' => $account->charges_enabled,
                            'payouts_enabled' => $account->payouts_enabled,
                            'country' => $account->country
                        ]
                    ], 400);
                }

                // For US sellers, also check card_payments capability
                if ($company->country === 'US') {
                    if (!isset($account->capabilities->card_payments) || $account->capabilities->card_payments !== 'active') {
                        return response()->json([
                            'success' => false,
                            'message' => 'US merchant account requires card payments capability. Please complete Stripe onboarding.',
                            'debug_info' => [
                                'account_id' => $account->id,
                                'card_payments_capability' => $account->capabilities->card_payments ?? 'not_set',
                                'country' => $account->country
                            ]
                        ], 400);
                    }
                }
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to verify merchant account: ' . $e->getMessage()
                ], 400);
            }

            // Calculate amounts
            $totalAmount = (int) round($request->amount * 100); // Convert to cents
            $platformFeePercentage = $request->get('platform_fee_percentage', 2.5);
            $applicationFeeAmount = (int) round($totalAmount * ($platformFeePercentage / 100));
            $merchantAmount = $totalAmount - $applicationFeeAmount;

            // Create PaymentIntent based on seller country
            $paymentIntentData = [
                'amount' => $totalAmount,
                'currency' => $request->get('currency', 'usd'),
                'metadata' => array_merge([
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'customer_email' => $request->customer_email,
                    'platform_fee_percentage' => $platformFeePercentage,
                    'merchant_amount_cents' => $merchantAmount,
                    'platform_fee_cents' => $applicationFeeAmount,
                    'merchant_country' => $company->country,
                ], $request->get('metadata', [])),
                'description' => $request->get('description', "Payment to {$company->name}"),
                'receipt_email' => $request->customer_email,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ];

            if ($company->country === 'US') {
                // US sellers: Direct payment with application fee
                $paymentIntentData['application_fee_amount'] = $applicationFeeAmount;
                $paymentIntentData['transfer_data'] = [
                    'destination' => $company->stripe_account_id,
                ];
            } else {
                // PH sellers: Platform receives full payment, then transfers to seller
                // No transfer_data here - we'll handle the transfer separately after payment succeeds
                $paymentIntentData['metadata']['requires_manual_transfer'] = 'true';
            }

            $paymentIntent = PaymentIntent::create($paymentIntentData);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount_breakdown' => [
                    'total_amount' => $totalAmount / 100,
                    'merchant_amount' => $merchantAmount / 100,
                    'platform_fee' => $applicationFeeAmount / 100,
                    'platform_fee_percentage' => $platformFeePercentage,
                ],
                'merchant' => [
                    'name' => $company->name,
                    'stripe_account_id' => $company->stripe_account_id,
                ]
            ]);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create PaymentIntent for order checkout
     */
    public function createOrderPaymentIntent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
                'customer_email' => 'required|email',
                'platform_fee_percentage' => 'sometimes|numeric|min:0|max:30'
            ]);

            $order = Order::with('company')->findOrFail($request->order_id);
            $company = $order->company;

            // Check if merchant has completed Stripe onboarding
            if (!$company->stripe_account_id || $company->stripe_onboarding_status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Merchant payment processing not available'
                ], 400);
            }

            // Calculate amounts from order
            $totalAmount = (int) round($order->total_amount * 100); // Convert to cents
            $platformFeePercentage = $request->get('platform_fee_percentage', 2.5);
            $applicationFeeAmount = (int) round($totalAmount * ($platformFeePercentage / 100));
            $merchantAmount = $totalAmount - $applicationFeeAmount;

            // Create PaymentIntent based on seller country
            $paymentIntentData = [
                'amount' => $totalAmount,
                'currency' => 'usd',
                'metadata' => [
                    'order_id' => $order->id,
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'customer_email' => $request->customer_email,
                    'platform_fee_percentage' => $platformFeePercentage,
                    'merchant_amount_cents' => $merchantAmount,
                    'platform_fee_cents' => $applicationFeeAmount,
                    'merchant_country' => $company->country,
                ],
                'description' => "Order #{$order->id} - {$company->name}",
                'receipt_email' => $request->customer_email,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ];

            if ($company->country === 'US') {
                // US sellers: Direct payment with application fee
                $paymentIntentData['application_fee_amount'] = $applicationFeeAmount;
                $paymentIntentData['transfer_data'] = [
                    'destination' => $company->stripe_account_id,
                ];
            } else {
                // PH sellers: Platform receives full payment, then transfers to seller
                $paymentIntentData['metadata']['requires_manual_transfer'] = 'true';
            }

            $paymentIntent = PaymentIntent::create($paymentIntentData);

            // Update order with payment intent ID
            $order->update([
                'payment_intent_id' => $paymentIntent->id,
                'payment_status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'order' => [
                    'id' => $order->id,
                    'total_amount' => $order->total_amount,
                    'merchant_name' => $company->name,
                ],
                'amount_breakdown' => [
                    'total_amount' => $totalAmount / 100,
                    'merchant_amount' => $merchantAmount / 100,
                    'platform_fee' => $applicationFeeAmount / 100,
                    'platform_fee_percentage' => $platformFeePercentage,
                ]
            ]);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm payment and update order status
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'order_id' => 'sometimes|exists:orders,id'
            ]);

            // Retrieve PaymentIntent from Stripe
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                // Update order if provided
                if ($request->has('order_id')) {
                    $order = Order::findOrFail($request->order_id);
                    $order->update([
                        'payment_status' => 'paid',
                        'payment_intent_id' => $paymentIntent->id,
                        'paid_at' => now()
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment confirmed successfully',
                    'payment_status' => $paymentIntent->status,
                    'amount_received' => $paymentIntent->amount_received / 100
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed',
                'payment_status' => $paymentIntent->status
            ], 400);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle payment webhook events
     */
    public function handlePaymentWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $sigHeader = $request->header('Stripe-Signature');
            $endpointSecret = env('STRIPE_PAYMENT_WEBHOOK_SECRET');

            if ($endpointSecret) {
                $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                $event = json_decode($payload, true);
            }

            // Handle the event
            switch ($event['type']) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event['data']['object'];
                    $this->handlePaymentSucceeded($paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event['data']['object'];
                    $this->handlePaymentFailed($paymentIntent);
                    break;

                default:
                    \Log::info('Unhandled payment webhook event: ' . $event['type']);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment webhook error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Handle successful payment webhook
     */
    private function handlePaymentSucceeded($paymentIntent): void
    {
        $metadata = $paymentIntent['metadata'] ?? [];
        
        \Log::info('Processing payment success webhook', [
            'payment_intent_id' => $paymentIntent['id'] ?? 'unknown',
            'metadata_keys' => array_keys($metadata)
        ]);
        
        if (isset($metadata['order_id'])) {
            $order = Order::with('company')->find($metadata['order_id']);
            if ($order) {
                // Update order payment status
                $order->update([
                    'payment_status' => 'paid',
                    'paid_at' => now()
                ]);

                \Log::info('Order payment status updated', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown'
                ]);

                // Create seller payout record
                $this->createSellerPayoutFromOrder($order, $metadata);
            } else {
                \Log::warning('Order not found for payment success', [
                    'order_id' => $metadata['order_id'],
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown'
                ]);
            }
        }

        // Handle manual transfer for PH sellers (legacy support)
        if (isset($metadata['requires_manual_transfer']) && $metadata['requires_manual_transfer'] === 'true') {
            $this->processManualTransfer($paymentIntent);
        }
    }

    /**
     * Create seller payout from completed order
     */
    private function createSellerPayoutFromOrder(Order $order, array $metadata): void
    {
        try {
            // Check if payout already exists
            if ($order->hasSellerPayout()) {
                \Log::info('Seller payout already exists for order', ['order_id' => $order->id]);
                return;
            }

            // Get platform fee percentage from metadata or use default
            $platformFeePercentage = isset($metadata['platform_fee_percentage']) 
                ? floatval($metadata['platform_fee_percentage']) 
                : 2.5;

            // Determine payout method based on company country
            $payoutMethod = $order->company->getDefaultPayoutMethod();

            // Create the payout record
            $payout = $order->createSellerPayout($platformFeePercentage, $payoutMethod);

            \Log::info('Seller payout created successfully', [
                'payout_id' => $payout->id,
                'order_id' => $order->id,
                'company_id' => $order->company_id,
                'net_amount' => $payout->net_amount,
                'payout_method' => $payoutMethod
            ]);

            // For US sellers with Stripe method, process payout immediately
            if ($payout->isStripeMethod() && $order->company->country === 'US') {
                $this->processStripePayoutFromWebhook($payout);
            }

        } catch (\Exception $e) {
            \Log::error('Failed to create seller payout from order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'metadata' => $metadata
            ]);
        }
    }

    /**
     * Process Stripe payout from webhook (for US sellers)
     */
    private function processStripePayoutFromWebhook(SellerPayout $payout): void
    {
        try {
            $company = $payout->company;
            
            if (!$company->stripe_account_id) {
                \Log::error('Cannot process Stripe payout: No Stripe account', [
                    'payout_id' => $payout->id,
                    'company_id' => $company->id
                ]);
                return;
            }

            $payout->markAsProcessing();

            // Create Stripe transfer
            $transfer = \Stripe\Transfer::create([
                'amount' => (int) round($payout->net_amount * 100), // Convert to cents
                'currency' => strtolower($payout->currency),
                'destination' => $company->stripe_account_id,
                'description' => "Payout for order #{$payout->order->order_number}",
                'metadata' => [
                    'payout_id' => $payout->id,
                    'order_id' => $payout->order_id,
                    'company_id' => $company->id,
                    'auto_processed' => 'true'
                ]
            ]);

            // Update payout with success
            $payout->update([
                'stripe_transfer_id' => $transfer->id,
                'stripe_response' => $transfer->toArray(),
                'status' => 'completed',
                'processed_at' => now()
            ]);

            \Log::info('Stripe payout processed successfully from webhook', [
                'payout_id' => $payout->id,
                'transfer_id' => $transfer->id,
                'amount' => $payout->net_amount
            ]);

        } catch (\Exception $e) {
            $payout->markAsFailed('Auto-processing failed: ' . $e->getMessage());
            
            \Log::error('Failed to process Stripe payout from webhook', [
                'payout_id' => $payout->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process manual transfer for PH sellers
     */
    private function processManualTransfer($paymentIntent): void
    {
        try {
            $metadata = $paymentIntent['metadata'] ?? [];
            
            // Check if required metadata exists
            if (!isset($metadata['merchant_company_id']) || !isset($metadata['merchant_amount_cents'])) {
                \Log::error('Cannot process transfer: Missing required metadata', [
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown',
                    'available_metadata' => array_keys($metadata)
                ]);
                return;
            }
            
            $merchantCompanyId = $metadata['merchant_company_id'];
            $merchantAmountCents = $metadata['merchant_amount_cents'];
            
            $company = Company::find($merchantCompanyId);
            if (!$company || !$company->stripe_account_id) {
                \Log::error('Cannot process transfer: Company not found or no Stripe account', [
                    'company_id' => $merchantCompanyId,
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown'
                ]);
                return;
            }

            // Create transfer to PH seller
            $transfer = \Stripe\Transfer::create([
                'amount' => $merchantAmountCents,
                'currency' => strtolower($paymentIntent['currency'] ?? 'usd'),
                'destination' => $company->stripe_account_id,
                'description' => "Transfer for payment {$paymentIntent['id']} to {$company->name}",
                'metadata' => [
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown',
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'original_amount_cents' => $paymentIntent['amount'] ?? 0,
                    'platform_fee_cents' => $metadata['platform_fee_cents'] ?? 0,
                ]
            ]);

            \Log::info('Transfer created successfully for PH seller', [
                'transfer_id' => $transfer->id,
                'company_id' => $company->id,
                'amount_cents' => $merchantAmountCents,
                'payment_intent_id' => $paymentIntent['id']
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to process manual transfer for PH seller', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntent['id'] ?? 'unknown',
                'metadata' => $metadata ?? null
            ]);
        }
    }

    /**
     * Handle failed payment webhook
     */
    private function handlePaymentFailed($paymentIntent): void
    {
        $metadata = $paymentIntent['metadata'] ?? [];
        
        \Log::info('Processing payment failed webhook', [
            'payment_intent_id' => $paymentIntent['id'] ?? 'unknown',
            'metadata_keys' => array_keys($metadata)
        ]);
        
        if (isset($metadata['order_id'])) {
            $order = Order::find($metadata['order_id']);
            if ($order) {
                $order->update([
                    'payment_status' => 'failed'
                ]);
                
                \Log::info('Order payment status updated to failed', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown'
                ]);
            } else {
                \Log::warning('Order not found for payment failure', [
                    'order_id' => $metadata['order_id'],
                    'payment_intent_id' => $paymentIntent['id'] ?? 'unknown'
                ]);
            }
        }
    }

    /**
     * Manually create transfer for PH sellers (admin/testing endpoint)
     */
    public function createManualTransfer(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'company_id' => 'required|exists:companies,id'
            ]);

            // Retrieve PaymentIntent from Stripe
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            
            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment must be succeeded before creating transfer',
                    'payment_status' => $paymentIntent->status
                ], 400);
            }

            $company = Company::findOrFail($request->company_id);
            
            if ($company->country === 'US') {
                return response()->json([
                    'success' => false,
                    'message' => 'US sellers receive payments directly, no manual transfer needed'
                ], 400);
            }

            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account'
                ], 400);
            }

            // Calculate transfer amount (total - platform fee)
            $totalAmount = $paymentIntent->amount;
            $platformFeePercentage = 2.5; // Default platform fee
            if (isset($paymentIntent->metadata['platform_fee_percentage'])) {
                $platformFeePercentage = floatval($paymentIntent->metadata['platform_fee_percentage']);
            }
            
            $applicationFeeAmount = (int) round($totalAmount * ($platformFeePercentage / 100));
            $merchantAmount = $totalAmount - $applicationFeeAmount;

            // Create transfer
            $transfer = \Stripe\Transfer::create([
                'amount' => $merchantAmount,
                'currency' => strtolower($paymentIntent->currency),
                'destination' => $company->stripe_account_id,
                'description' => "Manual transfer for payment {$paymentIntent->id} to {$company->name}",
                'metadata' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'original_amount_cents' => $totalAmount,
                    'platform_fee_cents' => $applicationFeeAmount,
                    'manual_transfer' => 'true'
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transfer created successfully',
                'transfer_id' => $transfer->id,
                'amount_transferred' => $merchantAmount / 100,
                'platform_fee_retained' => $applicationFeeAmount / 100
            ]);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transfer: ' . $e->getMessage()
            ], 500);
        }
    }
}

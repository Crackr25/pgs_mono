<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use App\Models\Product;
use App\Models\Order;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key from environment
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    /**
     * Create a PaymentIntent for customer-to-merchant payment
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.50', // Minimum $0.50
                'currency' => 'string|default:usd',
                'merchant_company_id' => 'required|exists:companies,id',
                'customer_email' => 'required|email',
                'description' => 'string|max:500',
                'metadata' => 'array',
                'platform_fee_percentage' => 'numeric|min:0|max:30|default:2.5' // Default 2.5% platform fee
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

            // Calculate amounts
            $totalAmount = (int) round($request->amount * 100); // Convert to cents
            $platformFeePercentage = $request->get('platform_fee_percentage', 2.5);
            $applicationFeeAmount = (int) round($totalAmount * ($platformFeePercentage / 100));
            $merchantAmount = $totalAmount - $applicationFeeAmount;

            // Create PaymentIntent with transfer to merchant
            $paymentIntent = PaymentIntent::create([
                'amount' => $totalAmount,
                'currency' => $request->get('currency', 'usd'),
                'application_fee_amount' => $applicationFeeAmount,
                'transfer_data' => [
                    'destination' => $company->stripe_account_id,
                ],
                'metadata' => array_merge([
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'customer_email' => $request->customer_email,
                    'platform_fee_percentage' => $platformFeePercentage,
                    'merchant_amount_cents' => $merchantAmount,
                    'platform_fee_cents' => $applicationFeeAmount,
                ], $request->get('metadata', [])),
                'description' => $request->get('description', "Payment to {$company->name}"),
                'receipt_email' => $request->customer_email,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

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
                'platform_fee_percentage' => 'numeric|min:0|max:30|default:2.5'
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

            // Create PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => $totalAmount,
                'currency' => 'usd',
                'application_fee_amount' => $applicationFeeAmount,
                'transfer_data' => [
                    'destination' => $company->stripe_account_id,
                ],
                'metadata' => [
                    'order_id' => $order->id,
                    'merchant_company_id' => $company->id,
                    'merchant_name' => $company->name,
                    'customer_email' => $request->customer_email,
                    'platform_fee_percentage' => $platformFeePercentage,
                    'merchant_amount_cents' => $merchantAmount,
                    'platform_fee_cents' => $applicationFeeAmount,
                ],
                'description' => "Order #{$order->id} - {$company->name}",
                'receipt_email' => $request->customer_email,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

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
                        'payment_status' => 'completed',
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
        $metadata = $paymentIntent['metadata'];
        
        if (isset($metadata['order_id'])) {
            $order = Order::find($metadata['order_id']);
            if ($order) {
                $order->update([
                    'payment_status' => 'completed',
                    'paid_at' => now()
                ]);
            }
        }
    }

    /**
     * Handle failed payment webhook
     */
    private function handlePaymentFailed($paymentIntent): void
    {
        $metadata = $paymentIntent['metadata'];
        
        if (isset($metadata['order_id'])) {
            $order = Order::find($metadata['order_id']);
            if ($order) {
                $order->update([
                    'payment_status' => 'failed'
                ]);
            }
        }
    }
}

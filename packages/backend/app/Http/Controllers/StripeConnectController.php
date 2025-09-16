<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Exception\ApiErrorException;

class StripeConnectController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key from environment
        $stripeSecret = config('services.stripe.secret') ?: env('STRIPE_SECRET');
        
        if (!$stripeSecret) {
            throw new \Exception('Stripe secret key not configured. Please set STRIPE_SECRET in your .env file.');
        }
        
        Stripe::setApiKey($stripeSecret);
    }

    /**
     * Create a Stripe Express account for a merchant
     */
    public function createExpressAccount(Request $request): JsonResponse
    {
        try {
            // Debug: Log the incoming request data
            \Log::info('Stripe account creation request:', [
                'all_data' => $request->all(),
                'email' => $request->input('email'),
                'has_email' => $request->has('email'),
                'email_filled' => $request->filled('email')
            ]);

            $request->validate([
                'email' => 'required|email',
                'country' => 'nullable|string',
                'type' => 'nullable|string'
            ]);

            // Set defaults for optional fields
            $country = $request->input('country', 'PH');
            $type = $request->input('type', 'express');

            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'No company found for authenticated user'
                ], 404);
            }

            // Check if company already has a Stripe account
            if ($company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company already has a Stripe account',
                    'stripe_account_id' => $company->stripe_account_id
                ], 400);
            }

            // Create Stripe Express account
            $account = Account::create([
                'type' => $type,
                'country' => $country,
                'email' => $request->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'company',
                'company' => [
                    'name' => $company->name,
                    'phone' => $company->phone,
                ],
                'metadata' => [
                    'company_id' => $company->id,
                    'platform' => 'pgs_marketplace'
                ]
            ]);

            // Update company with Stripe account ID
            $company->update([
                'stripe_account_id' => $account->id,
                'stripe_onboarding_status' => 'pending',
                'stripe_account_created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stripe Express account created successfully',
                'stripe_account_id' => $account->id,
                'account_status' => $account->details_submitted ? 'active' : 'pending'
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
                'message' => 'Failed to create Stripe account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate onboarding link for Stripe Express account
     */
    public function createOnboardingLink(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'refresh_url' => 'required|url',
                'return_url' => 'required|url'
            ]);

            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'No company found for authenticated user'
                ], 404);
            }

            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account. Create one first.'
                ], 400);
            }

            // Create account link for onboarding
            $accountLink = AccountLink::create([
                'account' => $company->stripe_account_id,
                'refresh_url' => $request->refresh_url,
                'return_url' => $request->return_url,
                'type' => 'account_onboarding',
            ]);

            return response()->json([
                'success' => true,
                'onboarding_url' => $accountLink->url,
                'expires_at' => $accountLink->expires_at
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
                'message' => 'Failed to create onboarding link: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Stripe account status
     */
    public function getAccountStatus(Request $request): JsonResponse
    {
        try {
            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'No company found for authenticated user'
                ], 404);
            }

            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account'
                ], 404);
            }

            // Retrieve account from Stripe
            $account = Account::retrieve($company->stripe_account_id);

            // Update local status
            $onboardingStatus = $account->details_submitted ? 'completed' : 'pending';
            if ($company->stripe_onboarding_status !== $onboardingStatus) {
                $company->update(['stripe_onboarding_status' => $onboardingStatus]);
            }

            return response()->json([
                'success' => true,
                'stripe_account_id' => $account->id,
                'details_submitted' => $account->details_submitted,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
                'onboarding_status' => $onboardingStatus,
                'requirements' => $account->requirements->toArray()
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
                'message' => 'Failed to get account status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create login link for existing Stripe Express account
     */
    public function createLoginLink(Request $request): JsonResponse
    {
        try {
            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'No company found for authenticated user'
                ], 404);
            }

            if (!$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company does not have a Stripe account'
                ], 404);
            }

            // Create login link
            $loginLink = \Stripe\Account::createLoginLink($company->stripe_account_id);

            return response()->json([
                'success' => true,
                'login_url' => $loginLink->url
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
                'message' => 'Failed to create login link: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Stripe Connect webhook events
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $sigHeader = $request->header('Stripe-Signature');
            $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

            if ($endpointSecret) {
                $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                $event = json_decode($payload, true);
            }

            // Handle the event
            switch ($event['type']) {
                case 'account.updated':
                    $account = $event['data']['object'];
                    $this->handleAccountUpdated($account);
                    break;
                
                case 'account.application.deauthorized':
                    $account = $event['data']['object'];
                    $this->handleAccountDeauthorized($account);
                    break;

                default:
                    \Log::info('Unhandled Stripe webhook event: ' . $event['type']);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Handle account updated webhook
     */
    private function handleAccountUpdated($account): void
    {
        $company = Company::where('stripe_account_id', $account['id'])->first();
        
        if ($company) {
            $onboardingStatus = $account['details_submitted'] ? 'completed' : 'pending';
            $company->update(['stripe_onboarding_status' => $onboardingStatus]);
        }
    }

    /**
     * Handle account deauthorized webhook
     */
    private function handleAccountDeauthorized($account): void
    {
        $company = Company::where('stripe_account_id', $account['id'])->first();
        
        if ($company) {
            $company->update([
                'stripe_account_id' => null,
                'stripe_onboarding_status' => 'pending'
            ]);
        }
    }
}

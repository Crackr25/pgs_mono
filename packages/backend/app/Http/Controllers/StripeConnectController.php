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
                'type' => 'nullable|string',
                'business_address' => 'nullable|array',
                'business_address.line1' => 'nullable|string',
                'business_address.city' => 'nullable|string',
                'business_address.state' => 'nullable|string',
                'business_address.postal_code' => 'nullable|string',
                'business_address.country' => 'nullable|string',
                'external_account' => 'nullable|array',
                'external_account.account_number' => 'nullable|string',
                'external_account.routing_number' => 'nullable|string',
                'business_owners' => 'nullable|array',
                'business_owners.*.first_name' => 'nullable|string',
                'business_owners.*.last_name' => 'nullable|string',
                'business_owners.*.email' => 'nullable|email',
                'business_owners.*.phone' => 'nullable|string',
                'business_owners.*.dob' => 'nullable|array',
                'business_owners.*.dob.day' => 'nullable|integer|min:1|max:31',
                'business_owners.*.dob.month' => 'nullable|integer|min:1|max:12',
                'business_owners.*.dob.year' => 'nullable|integer|min:1900|max:2010',
                'business_owners.*.address' => 'nullable|array',
                'business_owners.*.ownership_percentage' => 'nullable|numeric|min:0|max:100'
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

            // Prepare account data with country-specific capabilities
            $capabilities = [];
            $accountData = [
                'type' => $type,
                'country' => $country,
                'email' => $request->email,
            ];

            if ($country === 'US') {
                // US sellers can process payments directly (card_payments + transfers)
                $capabilities = [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ];
            } else {
                // PH and other countries: payout-only accounts (transfers only with recipient service agreement)
                $capabilities = [
                    'transfers' => ['requested' => true],
                ];
                // For PH accounts requesting only transfers, we need to specify the recipient service agreement
                $accountData['tos_acceptance'] = [
                    'service_agreement' => 'recipient'
                ];
            }

            $accountData['capabilities'] = $capabilities;
            $accountData['business_type'] = 'company';
            $accountData['company'] = [
                'name' => $company->name,
                'phone' => $company->phone,
            ];
            $accountData['metadata'] = [
                'company_id' => $company->id,
                'platform' => 'pgs_marketplace'
            ];
            $accountData['settings'] = [
                'payouts' => [
                    'schedule' => [
                        'interval' => 'daily'
                    ]
                ]
            ];

            // Add business address if provided
            if ($request->has('business_address') && is_array($request->business_address)) {
                $businessAddress = $request->business_address;
                if (!empty($businessAddress['line1'])) {
                    $accountData['company']['address'] = [
                        'line1' => $businessAddress['line1'],
                        'city' => $businessAddress['city'] ?? '',
                        'state' => $businessAddress['state'] ?? '',
                        'postal_code' => $businessAddress['postal_code'] ?? '',
                        'country' => $businessAddress['country'] ?? $country
                    ];
                }
            }

            // Store external account data for later processing (after account creation)
            $externalAccountData = null;
            if ($request->has('external_account') && is_array($request->external_account)) {
                $externalAccount = $request->external_account;
                if (!empty($externalAccount['account_number']) && !empty($externalAccount['routing_number'])) {
                    $externalAccountData = [
                        'object' => 'bank_account',
                        'country' => $country,
                        'currency' => $country === 'US' ? 'usd' : 'php',
                        'account_number' => $externalAccount['account_number'],
                        'routing_number' => $externalAccount['routing_number']
                    ];
                }
            }

            // Store business owners data for later processing (after account creation)
            $businessOwnersData = [];
            if ($request->has('business_owners') && is_array($request->business_owners)) {
                foreach ($request->business_owners as $index => $owner) {
                    if (!empty($owner['first_name']) && !empty($owner['last_name'])) {
                        $ownerData = [
                            'first_name' => $owner['first_name'],
                            'last_name' => $owner['last_name'],
                            'email' => $owner['email'] ?? '',
                            'phone' => $owner['phone'] ?? '',
                            'relationship' => [
                                'representative' => $index === 0, // First owner is representative
                                'owner' => true,
                                'percent_ownership' => $owner['ownership_percentage'] ?? 25
                            ]
                        ];

                        // Add date of birth if provided
                        if (isset($owner['dob']) && is_array($owner['dob'])) {
                            $dob = $owner['dob'];
                            if (!empty($dob['day']) && !empty($dob['month']) && !empty($dob['year'])) {
                                $ownerData['dob'] = [
                                    'day' => (int)$dob['day'],
                                    'month' => (int)$dob['month'],
                                    'year' => (int)$dob['year']
                                ];
                            }
                        }

                        // Add address if provided
                        if (isset($owner['address']) && is_array($owner['address'])) {
                            $address = $owner['address'];
                            if (!empty($address['line1'])) {
                                $ownerData['address'] = [
                                    'line1' => $address['line1'],
                                    'city' => $address['city'] ?? '',
                                    'state' => $address['state'] ?? '',
                                    'postal_code' => $address['postal_code'] ?? '',
                                    'country' => $address['country'] ?? $country
                                ];
                            }
                        }

                        $businessOwnersData[] = $ownerData;
                    }
                }

                // For company accounts, indicate that owners will be provided
                if (!empty($businessOwnersData)) {
                    $accountData['company']['owners_provided'] = true;
                }
            }

            // Log the account data being sent to Stripe for debugging
            \Log::info('Creating Stripe account with data:', [
                'account_data' => $accountData,
                'has_external_account' => !is_null($externalAccountData),
                'business_owners_count' => count($businessOwnersData)
            ]);

            // Create Stripe Express account
            $account = Account::create($accountData);

            // Add external account (bank account) after account creation
            if ($externalAccountData) {
                try {
                    \Stripe\Account::createExternalAccount($account->id, [
                        'external_account' => $externalAccountData
                    ]);
                } catch (ApiErrorException $e) {
                    // Log the error but don't fail the account creation
                    \Log::warning('Failed to add external account: ' . $e->getMessage(), [
                        'account_id' => $account->id,
                        'external_account_data' => $externalAccountData
                    ]);
                }
            }

            // Add business owners as persons after account creation
            if (!empty($businessOwnersData)) {
                foreach ($businessOwnersData as $ownerData) {
                    try {
                        \Stripe\Account::createPerson($account->id, $ownerData);
                    } catch (ApiErrorException $e) {
                        // Log the error but don't fail the account creation
                        \Log::warning('Failed to add business owner as person: ' . $e->getMessage(), [
                            'account_id' => $account->id,
                            'owner_data' => $ownerData
                        ]);
                    }
                }
            }

            // Update company with Stripe account ID and country
            $company->update([
                'stripe_account_id' => $account->id,
                'stripe_onboarding_status' => 'pending',
                'stripe_account_created_at' => now(),
                'country' => $country
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
                'data' => [
                'stripe_account_id' => $account->id,
                'details_submitted' => $account->details_submitted,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
                'onboarding_status' => $onboardingStatus,
                'requirements' => $account->requirements->toArray()
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

    /**
     * Update account with additional required information
     */
    public function updateAccountInformation(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'business_address' => 'nullable|array',
                'business_address.line1' => 'required_with:business_address|string',
                'business_address.city' => 'required_with:business_address|string',
                'business_address.state' => 'required_with:business_address|string',
                'business_address.postal_code' => 'required_with:business_address|string',
                'business_address.country' => 'nullable|string',
                'external_account' => 'nullable|array',
                'external_account.account_number' => 'required_with:external_account|string',
                'external_account.routing_number' => 'required_with:external_account|string',
                'business_owners' => 'nullable|array',
                'business_owners.*.first_name' => 'required_with:business_owners|string',
                'business_owners.*.last_name' => 'required_with:business_owners|string',
                'business_owners.*.email' => 'nullable|email',
                'business_owners.*.phone' => 'nullable|string',
                'business_owners.*.dob' => 'nullable|array',
                'business_owners.*.dob.day' => 'required_with:business_owners.*.dob|integer|min:1|max:31',
                'business_owners.*.dob.month' => 'required_with:business_owners.*.dob|integer|min:1|max:12',
                'business_owners.*.dob.year' => 'required_with:business_owners.*.dob|integer|min:1900|max:2010',
                'business_owners.*.address' => 'nullable|array',
                'business_owners.*.ownership_percentage' => 'nullable|numeric|min:0|max:100'
            ]);

            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company || !$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Stripe account found for this company'
                ], 404);
            }

            $updateData = [];

            // Update business address
            if ($request->has('business_address')) {
                $businessAddress = $request->business_address;
                $updateData['company'] = [
                    'address' => [
                        'line1' => $businessAddress['line1'],
                        'city' => $businessAddress['city'],
                        'state' => $businessAddress['state'],
                        'postal_code' => $businessAddress['postal_code']
                    ]
                ];
            }

            // Update individual (representative) information
            if ($request->has('business_owners') && !empty($request->business_owners)) {
                $owner = $request->business_owners[0]; // Primary owner/representative
                $individualData = [
                    'first_name' => $owner['first_name'],
                    'last_name' => $owner['last_name'],
                    'email' => $owner['email'] ?? '',
                    'phone' => $owner['phone'] ?? ''
                ];

                // Add date of birth
                if (isset($owner['dob']) && is_array($owner['dob'])) {
                    $dob = $owner['dob'];
                    $individualData['dob'] = [
                        'day' => (int)$dob['day'],
                        'month' => (int)$dob['month'],
                        'year' => (int)$dob['year']
                    ];
                }

                // Add address
                if (isset($owner['address']) && is_array($owner['address'])) {
                    $address = $owner['address'];
                    $individualData['address'] = [
                        'line1' => $address['line1'],
                        'city' => $address['city'] ?? '',
                        'state' => $address['state'] ?? '',
                        'postal_code' => $address['postal_code'] ?? '',
                        'country' => $address['country'] ?? 'PH'
                    ];
                }

                $updateData['individual'] = $individualData;
            }

            // Update the account
            if (!empty($updateData)) {
                $account = Account::update($company->stripe_account_id, $updateData);
            }

            // Add external account (bank account) if provided
            if ($request->has('external_account')) {
                $externalAccount = $request->external_account;
                try {
                    $bankAccount = \Stripe\Account::createExternalAccount(
                        $company->stripe_account_id,
                        [
                            'external_account' => [
                                'object' => 'bank_account',
                                'country' => 'PH',
                                'currency' => 'php',
                                'account_number' => $externalAccount['account_number'],
                                'routing_number' => $externalAccount['routing_number']
                            ]
                        ]
                    );
                } catch (\Exception $e) {
                    \Log::warning('Failed to add external account: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Account information updated successfully',
                'account_id' => $company->stripe_account_id
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
                'message' => 'Failed to update account information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update additional account information (SSN, address, etc.)
     */
    public function updateAdditionalInfo(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'individual' => 'nullable|array',
                'individual.ssn_last_4' => 'nullable|string|size:4',
                'individual.ssn_full' => 'nullable|string',
                'individual.id_number' => 'nullable|string',
                'individual.phone' => 'nullable|string',
                'individual.email' => 'nullable|email',
                'individual.dob' => 'nullable|array',
                'individual.dob.day' => 'nullable|integer|min:1|max:31',
                'individual.dob.month' => 'nullable|integer|min:1|max:12',
                'individual.dob.year' => 'nullable|integer|min:1900|max:2010',
                'individual.address' => 'nullable|array',
                'individual.address.line1' => 'nullable|string',
                'individual.address.city' => 'nullable|string',
                'individual.address.state' => 'nullable|string',
                'individual.address.postal_code' => 'nullable|string',
                'individual.address.country' => 'nullable|string'
            ]);

            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company || !$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Stripe account found for this company'
                ], 404);
            }

            $updateData = [];

            // Get the account to check its business type
            $account = Account::retrieve($company->stripe_account_id);
            
            \Log::info('Updating additional info for account:', [
                'account_id' => $company->stripe_account_id,
                'business_type' => $account->business_type,
                'request_data' => $request->all()
            ]);
            
            // Update individual information if provided
            if ($request->has('individual') && is_array($request->individual)) {
                $individual = $request->individual;
                $individualData = [];

                // Basic information
                if (isset($individual['ssn_last_4'])) $individualData['ssn_last_4'] = $individual['ssn_last_4'];
                if (isset($individual['ssn_full'])) $individualData['ssn_full'] = $individual['ssn_full'];
                if (isset($individual['id_number'])) $individualData['id_number'] = $individual['id_number'];
                if (isset($individual['phone'])) $individualData['phone'] = $individual['phone'];
                if (isset($individual['email'])) $individualData['email'] = $individual['email'];

                // Date of birth
                if (isset($individual['dob']) && is_array($individual['dob'])) {
                    $dob = $individual['dob'];
                    if (!empty($dob['day']) && !empty($dob['month']) && !empty($dob['year'])) {
                        $individualData['dob'] = [
                            'day' => (int)$dob['day'],
                            'month' => (int)$dob['month'],
                            'year' => (int)$dob['year']
                        ];
                    }
                }

                // Address
                if (isset($individual['address']) && is_array($individual['address'])) {
                    $address = $individual['address'];
                    if (!empty($address['line1'])) {
                        $individualData['address'] = [
                            'line1' => $address['line1'],
                            'city' => $address['city'] ?? '',
                            'state' => $address['state'] ?? '',
                            'postal_code' => $address['postal_code'] ?? '',
                            'country' => $address['country'] ?? 'US'
                        ];
                    }
                }

                if (!empty($individualData)) {
                    // For company accounts, we need to add/update this as a person (representative)
                    if ($account->business_type === 'company') {
                        // Set relationship for company representative
                        $individualData['relationship'] = [
                            'representative' => true,
                            'owner' => true,
                            'percent_ownership' => 25 // Default ownership percentage
                        ];

                        try {
                            // First, try to get existing persons
                            $persons = \Stripe\Account::allPersons($company->stripe_account_id);
                            
                            \Log::info('Existing persons for account:', [
                                'account_id' => $company->stripe_account_id,
                                'persons_count' => count($persons->data),
                                'person_data_to_update' => $individualData
                            ]);
                            
                            if (!empty($persons->data)) {
                                // Update the first person (representative)
                                $personId = $persons->data[0]->id;
                                \Log::info('Updating existing person:', ['person_id' => $personId]);
                                \Stripe\Account::updatePerson($company->stripe_account_id, $personId, $individualData);
                            } else {
                                // Create a new person
                                \Log::info('Creating new person for account:', ['account_id' => $company->stripe_account_id]);
                                \Stripe\Account::createPerson($company->stripe_account_id, $individualData);
                            }
                        } catch (ApiErrorException $e) {
                            \Log::error('Failed to update person information:', [
                                'error' => $e->getMessage(),
                                'account_id' => $company->stripe_account_id,
                                'data' => $individualData
                            ]);
                            throw new \Exception('Failed to update person information: ' . $e->getMessage());
                        }
                    } else {
                        // For individual accounts, update the individual field directly
                        $updateData['individual'] = $individualData;
                    }
                }
            }

            // Update the account if there's data to update (for individual accounts)
            if (!empty($updateData)) {
                Account::update($company->stripe_account_id, $updateData);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Additional information updated successfully',
                'account_id' => $company->stripe_account_id,
                'business_type' => $account->business_type
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
                'message' => 'Failed to update additional information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug endpoint to check account structure and persons
     */
    public function debugAccountStructure(Request $request): JsonResponse
    {
        try {
            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company || !$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Stripe account found for this company'
                ], 404);
            }

            // Get account details
            $account = Account::retrieve($company->stripe_account_id);
            
            // Get persons
            $persons = \Stripe\Account::allPersons($company->stripe_account_id);

            return response()->json([
                'success' => true,
                'account_id' => $account->id,
                'business_type' => $account->business_type,
                'details_submitted' => $account->details_submitted,
                'persons_count' => count($persons->data),
                'persons' => array_map(function($person) {
                    return [
                        'id' => $person->id,
                        'relationship' => $person->relationship ?? null,
                        'verification' => $person->verification ?? null,
                        'requirements' => $person->requirements ?? null
                    ];
                }, $persons->data),
                'account_requirements' => $account->requirements->toArray()
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
                'message' => 'Failed to debug account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to validate account creation parameters
     */
    public function validateAccountData(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'country' => 'nullable|string',
                'business_address' => 'nullable|array',
                'external_account' => 'nullable|array',
                'business_owners' => 'nullable|array'
            ]);

            // Just validate and return what would be sent to Stripe
            $accountData = [
                'type' => 'express',
                'country' => $request->input('country', 'US'),
                'email' => $request->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'company',
                'company' => [
                    'name' => 'Test Company',
                    'phone' => '+63123456789',
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Account data validation successful',
                'would_send_to_stripe' => $accountData,
                'has_individual_field' => isset($accountData['individual']),
                'note' => 'Business owners will be added as persons after account creation'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get account requirements and missing information
     */
    public function getAccountRequirements(Request $request): JsonResponse
    {
        try {
            // Get the authenticated user's company
            $company = Company::where('user_id', auth()->id())->first();
            
            if (!$company || !$company->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Stripe account found for this company'
                ], 404);
            }

            // Retrieve account from Stripe
            $account = Account::retrieve($company->stripe_account_id);

            return response()->json([
                'success' => true,
                'account_id' => $account->id,
                'requirements' => [
                    'currently_due' => $account->requirements->currently_due ?? [],
                    'eventually_due' => $account->requirements->eventually_due ?? [],
                    'past_due' => $account->requirements->past_due ?? [],
                    'pending_verification' => $account->requirements->pending_verification ?? []
                ],
                'capabilities' => [
                    'card_payments' => $account->capabilities->card_payments ?? 'inactive',
                    'transfers' => $account->capabilities->transfers ?? 'inactive'
                ],
                'details_submitted' => $account->details_submitted,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled
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
                'message' => 'Failed to get account requirements: ' . $e->getMessage()
            ], 500);
        }
    }
}

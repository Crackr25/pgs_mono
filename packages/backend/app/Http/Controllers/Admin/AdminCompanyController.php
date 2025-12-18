<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminCompanyController extends Controller
{
    /**
     * Get all companies with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::query()->with(['user', 'agents' => function($query) {
            $query->where('company_agents.is_active', true)
                  ->select('users.id', 'users.name', 'users.email');
        }]);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by verification status (using 'verified' boolean and 'status' enum)
        if ($request->has('verification_status')) {
            if ($request->verification_status === 'verified') {
                $query->where('verified', true);
            } elseif ($request->verification_status === 'pending') {
                $query->where('status', 'pending');
            } elseif ($request->verification_status === 'rejected') {
                $query->where('status', 'inactive');
            }
        }

        // Filter by Stripe onboarding status
        if ($request->has('stripe_status')) {
            if ($request->stripe_status === 'completed') {
                $query->where('stripe_onboarding_status', 'completed');
            } elseif ($request->stripe_status === 'pending') {
                $query->where('stripe_onboarding_status', '!=', 'completed')
                      ->orWhereNull('stripe_onboarding_status');
            } elseif ($request->stripe_status === 'connected') {
                $query->whereNotNull('stripe_account_id');
            }
        }

        // Filter by country
        if ($request->has('country') && $request->country !== 'all') {
            $query->where('country', $request->country);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $companies = $query->paginate($perPage);

        return response()->json($companies);
    }

    /**
     * Get company statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_companies' => Company::count(),
            'verified' => Company::where('verified', true)->count(),
            'pending' => Company::where('status', 'pending')->count(),
            'rejected' => Company::where('status', 'inactive')->count(),
            'stripe_connected' => Company::whereNotNull('stripe_account_id')->count(),
            'stripe_completed' => Company::where('stripe_onboarding_status', 'completed')->count(),
            'recent_companies' => Company::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get a specific company
     */
    public function show($id): JsonResponse
    {
        $company = Company::with(['user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $company
        ]);
    }

    /**
     * Update company information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:50',
            'website' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'verified' => 'sometimes|boolean',
            'status' => 'sometimes|in:active,inactive,pending',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company updated successfully',
            'data' => $company->fresh()
        ]);
    }

    /**
     * Verify company
     */
    public function verify($id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $company->update([
            'verified' => true,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Company verified successfully',
            'data' => $company
        ]);
    }

    /**
     * Reject company verification
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'sometimes|string|max:1000'
        ]);

        $company->update([
            'verified' => false,
            'status' => 'inactive'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Company verification rejected',
            'data' => $company
        ]);
    }

    /**
     * Delete company
     */
    public function destroy($id): JsonResponse
    {
        $company = Company::findOrFail($id);

        // Check if company has active orders or other dependencies
        // Add your business logic here

        $company->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully'
        ]);
    }

    /**
     * Get pending verifications
     */
    public function pendingVerifications(): JsonResponse
    {
        $companies = Company::with(['user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($companies);
    }

    /**
     * Get company documents for review
     */
    public function documents($id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $documents = [
            'dti_sec_certificate' => $company->dti_sec_certificate,
            'peza_documents' => $company->peza_documents,
            'product_certifications' => $company->product_certifications,
            'business_permits' => $company->business_permits,
            'kyc_id_front' => $company->kyc_id_front,
            'kyc_id_back' => $company->kyc_id_back,
            'kyc_proof_address' => $company->kyc_proof_address,
            'kyc_business_registration' => $company->kyc_business_registration,
            'factory_overview_video' => $company->factory_overview_video,
            'production_line_photos' => $company->production_line_photos,
            'quality_control_photos' => $company->quality_control_photos,
            'warehouse_photos' => $company->warehouse_photos,
            'certifications_display_photos' => $company->certifications_display_photos,
        ];

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Update Stripe status
     */
    public function updateStripeStatus(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'stripe_onboarding_status' => 'required|in:pending,completed,failed',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stripe status updated successfully',
            'data' => $company
        ]);
    }

    /**
     * Get company activity/history
     */
    public function activity($id): JsonResponse
    {
        // Implement activity logging if needed
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Activity logging not yet implemented'
            ]
        ]);
    }
}

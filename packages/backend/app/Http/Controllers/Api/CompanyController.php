<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Company::with(['user', 'products']);
        
        // Filter by verification status
        if ($request->has('verified')) {
            $query->where('verified', $request->boolean('verified'));
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        
        // Search by name or location
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        $companies = $query->paginate(15);
        
        return response()->json($companies);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'registration' => 'required|string|unique:companies',
            'peza_id' => 'nullable|string',
            'location' => 'required|string',
            'year_established' => 'required|integer|min:1900|max:' . date('Y'),
            'factory_size' => 'nullable|string',
            'product_lines' => 'nullable|array',
            'employees' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'phone' => 'nullable|string',
            'email' => 'nullable|email'
        ]);

        $validated['user_id'] = auth()->id();
        
        $company = Company::create($validated);
        
        return response()->json($company->load('user'), 201);
    }

    public function show(Company $company): JsonResponse
    {
        return response()->json($company->load(['user', 'products', 'reviews']));
    }

    public function update(Request $request, Company $company): JsonResponse
    {
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'registration' => 'sometimes|string|unique:companies,registration,' . $company->id,
            'peza_id' => 'nullable|string',
            'location' => 'sometimes|string',
            'year_established' => 'sometimes|integer|min:1900|max:' . date('Y'),
            'factory_size' => 'nullable|string',
            'product_lines' => 'nullable|array',
            'employees' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'phone' => 'nullable|string',
            'email' => 'nullable|email'
        ]);

        $company->update($validated);
        
        return response()->json($company->load('user'));
    }

    public function destroy(Company $company): JsonResponse
    {
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $company->delete();
        
        return response()->json(['message' => 'Company deleted successfully']);
    }

    public function products(Company $company): JsonResponse
    {
        $products = $company->products()->with('company')->paginate(15);
        
        return response()->json($products);
    }

    /**
     * Upload documents for onboarding step 2
     */
    public function uploadDocuments(Request $request, Company $company): JsonResponse
    {
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'dti_sec_certificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB
            'peza_documents.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'product_certifications.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'business_permits.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];

        // Handle single files
        if ($request->hasFile('dti_sec_certificate')) {
            $path = $request->file('dti_sec_certificate')->store('companies/' . $company->id . '/documents', 'public');
            $uploadedFiles['dti_sec_certificate'] = $path;
            $company->dti_sec_certificate = $path;
        }

        // Handle multiple files
        $multipleFileFields = ['peza_documents', 'product_certifications', 'business_permits'];
        
        foreach ($multipleFileFields as $field) {
            if ($request->hasFile($field)) {
                $paths = [];
                foreach ($request->file($field) as $file) {
                    $path = $file->store('companies/' . $company->id . '/documents', 'public');
                    $paths[] = $path;
                }
                $uploadedFiles[$field] = $paths;
                $company->{$field} = json_encode($paths);
            }
        }

        // Update onboarding step
        $company->onboarding_step = 'documents';
        $company->save();

        return response()->json([
            'message' => 'Documents uploaded successfully',
            'files' => $uploadedFiles,
            'company' => $company->fresh()
        ]);
    }

    /**
     * Upload KYC files for onboarding step 3
     */
    public function uploadKyc(Request $request, Company $company): JsonResponse
    {
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'kyc_id_front' => 'nullable|file|mimes:jpg,jpeg,png|max:5120', // 5MB
            'kyc_id_back' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'kyc_proof_address' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'kyc_business_registration' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];
        $kycFields = ['kyc_id_front', 'kyc_id_back', 'kyc_proof_address', 'kyc_business_registration'];

        foreach ($kycFields as $field) {
            if ($request->hasFile($field)) {
                $path = $request->file($field)->store('companies/' . $company->id . '/kyc', 'public');
                $uploadedFiles[$field] = $path;
                $company->{$field} = $path;
            }
        }

        // Update onboarding step
        $company->onboarding_step = 'kyc';
        $company->save();

        return response()->json([
            'message' => 'KYC files uploaded successfully',
            'files' => $uploadedFiles,
            'company' => $company->fresh()
        ]);
    }

    /**
     * Upload factory tour media for onboarding step 4
     */
    public function uploadFactoryTour(Request $request, Company $company): JsonResponse
    {
        // Check if user owns this company
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'factory_overview_video' => 'nullable|file|mimes:mp4,mov,avi|max:102400', // 100MB
            'production_line_photos.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240', // 10MB
            'quality_control_photos.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'warehouse_photos.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'certifications_photos.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
        ]);

        $uploadedFiles = [];

        // Handle single video file
        if ($request->hasFile('factory_overview_video')) {
            $path = $request->file('factory_overview_video')->store('companies/' . $company->id . '/factory-tour', 'public');
            $uploadedFiles['factory_overview_video'] = $path;
            $company->factory_overview_video = $path;
        }

        // Handle multiple photo files
        $photoFields = ['production_line_photos', 'quality_control_photos', 'warehouse_photos', 'certifications_photos'];
        
        foreach ($photoFields as $field) {
            if ($request->hasFile($field)) {
                $paths = [];
                foreach ($request->file($field) as $file) {
                    $path = $file->store('companies/' . $company->id . '/factory-tour', 'public');
                    $paths[] = $path;
                }
                $uploadedFiles[$field] = $paths;
                $company->{$field} = json_encode($paths);
            }
        }

        // Update onboarding step and mark as completed
        $company->onboarding_step = 'completed';
        $company->onboarding_completed_at = now();
        $company->save();

        return response()->json([
            'message' => 'Factory tour media uploaded successfully. Onboarding completed!',
            'files' => $uploadedFiles,
            'company' => $company->fresh()
        ]);
    }

    /**
     * Get marketplace statistics
     */
    public function getMarketplaceStats(): JsonResponse
    {
        $stats = [
            'total_suppliers' => Company::count(),
            'verified_suppliers' => Company::where('verified', '1')->count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('active', '1')->count(),
        ];

        return response()->json($stats);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
}

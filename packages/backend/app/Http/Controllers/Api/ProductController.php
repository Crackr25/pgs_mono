<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        
       $company = Company::where('user_id', auth()->id())->first();
        
        if (!$company) {
            // Either return empty list or 404 — choose your UX
            return response()->json(['data' => []]); 
            // or: return response()->json(['message' => 'No company found'], 404);
        }
    
        $query = Product::with(['company'])->where('company_id', $company->id);
        
  
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        
        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }
        
        // Search by name or specs
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('specs', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        
        $products = $query->paginate(15);
        
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'specs' => 'required|string',
            'image' => 'nullable|string',
            'moq' => 'required|integer|min:1',
            'lead_time' => 'required|string',
            'hs_code' => 'nullable|string',
            'variants' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit' => 'nullable|string'
        ]);

        // Check if user owns the company
        $company = Company::findOrFail($validated['company_id']);
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $product = Product::create($validated);
        
        return response()->json($product->load('company'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['company', 'quotes']));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'specs' => 'sometimes|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'moq' => 'sometimes|integer|min:1',
            'lead_time' => 'sometimes|string',
            'hs_code' => 'nullable|string',
            'variants' => 'nullable|array',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit' => 'nullable|string'
        ]);

        $product->update($validated);
        
        return response()->json($product->load('company'));
    }

    public function destroy(Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();
        
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:5120' // 5MB max, single image
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            
            // Update product with single image path
            $product->update(['image' => $path]);
        }

        return response()->json([
            'message' => 'Image uploaded successfully',
            'data' => $product->fresh()
        ]);
    }
}

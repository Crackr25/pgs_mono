<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    /**
     * Get all products with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['company', 'images', 'mainImage']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%")
                  ->orWhere('model_number', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by status (active/inactive)
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('active', false);
            }
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock_quantity', '>', 0);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            } elseif ($request->stock_status === 'low_stock') {
                $query->where('stock_quantity', '>', 0)
                      ->where('stock_quantity', '<=', 10);
            }
        }

        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        // Transform products to include image URL and has_image flag (like MarketplaceController)
        $products->getCollection()->transform(function ($product) {
            // Get the main image or first available image
            $image = $product->mainImage;
            if (!$image && $product->images) {
                $image = $product->images->first();
            }
            
            // Set image URL
            $imageUrl = $image ? asset('storage/' . $image->image_path) : null;
            
            // Add image fields to product
            $product->image = $imageUrl;
            $product->has_image = !is_null($imageUrl);
            
            return $product;
        });

        return response()->json($products);
    }

    /**
     * Get product statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('active', true)->count(),
            'inactive_products' => Product::where('active', false)->count(),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->count(),
            'low_stock' => Product::where('stock_quantity', '>', 0)
                                  ->where('stock_quantity', '<=', 10)
                                  ->count(),
            'total_value' => Product::where('active', true)
                                   ->sum(DB::raw('price * stock_quantity')),
            'recent_products' => Product::where('created_at', '>=', now()->subDays(7))->count(),
            'categories' => Product::select('category', DB::raw('count(*) as count'))
                                  ->groupBy('category')
                                  ->get()
                                  ->pluck('count', 'category'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get a specific product
     */
    public function show($id): JsonResponse
    {
        $product = Product::with(['company', 'images', 'quotes', 'orderItems'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update product information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'moq' => 'sometimes|integer|min:1',
            'lead_time' => 'sometimes|string|max:255',
            'brand_name' => 'sometimes|string|max:255',
            'model_number' => 'sometimes|string|max:255',
            'warranty' => 'sometimes|string|max:255',
            'origin_country' => 'sometimes|string|max:255',
            'hs_code' => 'sometimes|string|max:255',
            'unit' => 'sometimes|string|max:50',
            'active' => 'sometimes|boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['company', 'images'])
        ]);
    }

    /**
     * Delete a product
     */
    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        // Check if product has orders
        if ($product->orderItems()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product with existing orders'
            ], 400);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Toggle product active status
     */
    public function toggleStatus($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->active = !$product->active;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Product status updated successfully',
            'data' => [
                'active' => $product->active
            ]
        ]);
    }

    /**
     * Get products that are out of stock
     */
    public function outOfStock(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $products = Product::with(['company', 'images'])
                          ->where('stock_quantity', '<=', 0)
                          ->orderBy('updated_at', 'desc')
                          ->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get products with low stock
     */
    public function lowStock(Request $request): JsonResponse
    {
        $threshold = $request->get('threshold', 10);
        $perPage = $request->get('per_page', 15);
        
        $products = Product::with(['company', 'images'])
                          ->where('stock_quantity', '>', 0)
                          ->where('stock_quantity', '<=', $threshold)
                          ->orderBy('stock_quantity', 'asc')
                          ->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get all unique categories
     */
    public function categories(): JsonResponse
    {
        $categories = Product::select('category')
                            ->distinct()
                            ->whereNotNull('category')
                            ->orderBy('category')
                            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Bulk update products
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $productIds = $validated['product_ids'];
        $action = $validated['action'];

        switch ($action) {
            case 'activate':
                Product::whereIn('id', $productIds)->update(['active' => true]);
                $message = 'Products activated successfully';
                break;
            case 'deactivate':
                Product::whereIn('id', $productIds)->update(['active' => false]);
                $message = 'Products deactivated successfully';
                break;
            case 'delete':
                // Check for orders
                $hasOrders = Product::whereIn('id', $productIds)
                                   ->whereHas('orderItems')
                                   ->exists();
                if ($hasOrders) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete products with existing orders'
                    ], 400);
                }
                Product::whereIn('id', $productIds)->delete();
                $message = 'Products deleted successfully';
                break;
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    /**
     * Get product activity/history (placeholder)
     */
    public function activity($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        // Placeholder for activity log
        // You can implement actual activity tracking later
        $activity = [
            'orders' => $product->orderItems()->with('order')->latest()->take(10)->get(),
            'quotes' => $product->quotes()->with('user')->latest()->take(10)->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }
}

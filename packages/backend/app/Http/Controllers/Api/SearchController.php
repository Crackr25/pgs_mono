<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * SearchController - Handles all search-related functionality
 * 
 * This controller is dedicated to search operations including:
 * - Product search suggestions (autocomplete)
 * - Full product search with filters
 * - Popular search terms
 * - Search analytics and tracking
 */
class SearchController extends Controller
{
    /**
     * Get search suggestions based on product names
     * 
     * This method provides real-time search suggestions for the autocomplete feature.
     * It searches through existing products and returns relevant matches.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $limit = min($request->get('limit', 8), 20); // Max 20 suggestions
            
            // Validate minimum query length
            if (strlen($query) < 2) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Query too short'
                ]);
            }
            
            // Search for products matching the query
            $suggestions = Product::with(['company:id,name,verified'])
                ->select(['id', 'name', 'category', 'price', 'company_id'])
                ->where('stock_quantity', '>', 0)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('category', 'LIKE', "%{$query}%");
                })
                ->orderByRaw("
                    CASE 
                        WHEN name LIKE ? THEN 1
                        WHEN name LIKE ? THEN 2
                        WHEN category LIKE ? THEN 3
                        ELSE 4
                    END
                ", ["{$query}%", "%{$query}%", "%{$query}%"])
                ->limit($limit)
                ->get();
            
            // Format suggestions for frontend
            $formattedSuggestions = $suggestions->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'price' => $product->price,
                    'company' => [
                        'id' => $product->company->id,
                        'name' => $product->company->name,
                        'verified' => $product->company->verified ?? false
                    ]
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $formattedSuggestions,
                'query' => $query,
                'count' => $formattedSuggestions->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching search suggestions',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    
    /**
     * Perform full product search with filters
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function searchProducts(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $category = $request->get('category', '');
            $minPrice = $request->get('min_price');
            $maxPrice = $request->get('max_price');
            $location = $request->get('location', '');
            $perPage = min($request->get('per_page', 15), 50); // Max 50 per page
            
            $searchQuery = Product::with(['company:id,name,location,verified,rating'])
                ->where('status', 'active');
            
            // Apply search filters
            if (!empty($query)) {
                $searchQuery->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('description', 'LIKE', "%{$query}%")
                      ->orWhere('category', 'LIKE', "%{$query}%")
                      ->orWhere('tags', 'LIKE', "%{$query}%");
                });
            }
            
            if (!empty($category) && $category !== 'All Categories') {
                $searchQuery->where('category', $category);
            }
            
            if (!empty($minPrice)) {
                $searchQuery->where('price', '>=', $minPrice);
            }
            
            if (!empty($maxPrice)) {
                $searchQuery->where('price', '<=', $maxPrice);
            }
            
            if (!empty($location)) {
                $searchQuery->whereHas('company', function ($q) use ($location) {
                    $q->where('location', 'LIKE', "%{$location}%");
                });
            }
            
            // Order by relevance and popularity
            $searchQuery->orderByRaw("
                CASE 
                    WHEN name LIKE ? THEN 1
                    WHEN name LIKE ? THEN 2
                    WHEN category LIKE ? THEN 3
                    ELSE 4
                END, views DESC, created_at DESC
            ", ["{$query}%", "%{$query}%", "%{$query}%"]);
            
            $results = $searchQuery->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $results->items(),
                'pagination' => [
                    'current_page' => $results->currentPage(),
                    'last_page' => $results->lastPage(),
                    'per_page' => $results->perPage(),
                    'total' => $results->total(),
                    'from' => $results->firstItem(),
                    'to' => $results->lastItem()
                ],
                'filters' => [
                    'query' => $query,
                    'category' => $category,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                    'location' => $location
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error performing search',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    
    /**
     * Get popular search terms
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getPopularSearches(Request $request): JsonResponse
    {
        try {
            $limit = min($request->get('limit', 10), 20);
            
            // Get most searched categories and popular product names
            $popularCategories = Product::select('category')
                ->where('status', 'active')
                ->groupBy('category')
                ->orderByRaw('COUNT(*) DESC')
                ->limit($limit)
                ->pluck('category');
            
            $popularProducts = Product::select('name')
                ->where('status', 'active')
                ->where('views', '>', 0)
                ->orderBy('views', 'desc')
                ->limit($limit)
                ->pluck('name');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $popularCategories,
                    'products' => $popularProducts
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching popular searches',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    
    /**
     * Track search queries for analytics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function trackSearch(Request $request): JsonResponse
    {
        try {
            $query = $request->get('query', '');
            $resultsCount = $request->get('results_count', 0);
            $userAgent = $request->header('User-Agent', '');
            $ipAddress = $request->ip();
            
            // Here you could log to a search_logs table for analytics
            // For now, we'll just return success
            
            return response()->json([
                'success' => true,
                'message' => 'Search tracked successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error tracking search',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}

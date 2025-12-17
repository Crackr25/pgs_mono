<?php

namespace App\Http\Controllers;

use App\Models\ProductSearch;
use App\Models\ProductView;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductAnalyticsController extends Controller
{
    /**
     * Track a product search
     */
    public function trackSearch(Request $request)
    {
        $validated = $request->validate([
            'search_term' => 'required|string|max:255',
            'results_count' => 'integer|min:0',
            'filters' => 'nullable|array',
        ]);

        $user = $request->user();

        ProductSearch::create([
            'search_term' => $validated['search_term'],
            'user_id' => $user?->id,
            'user_type' => $user ? $user->usertype : 'guest',
            'results_count' => $validated['results_count'] ?? 0,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'filters' => $validated['filters'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Search tracked successfully'
        ]);
    }

    /**
     * Track a product view
     */
    public function trackView(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'duration_seconds' => 'nullable|integer|min:0',
            'referrer' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        ProductView::create([
            'product_id' => $validated['product_id'],
            'user_id' => $user?->id,
            'user_type' => $user ? $user->usertype : 'guest',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $validated['referrer'] ?? $request->header('referer'),
            'duration_seconds' => $validated['duration_seconds'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'View tracked successfully'
        ]);
    }

    /**
     * Get comprehensive analytics dashboard data (Admin only)
     */
    public function getDashboardStats(Request $request)
    {
        $days = $request->input('days', 30);

        // Most searched terms
        $mostSearched = ProductSearch::getMostSearched(10, $days);

        // Trending searches
        $trendingSearches = ProductSearch::getTrendingSearches(10);

        // Most viewed products
        $mostViewed = ProductView::getMostViewed(10, $days);

        // Trending products
        $trendingProducts = ProductView::getTrendingProducts(10);

        // Category statistics
        $categoryStats = ProductView::getCategoryStats($days);

        // Overall statistics
        $totalSearches = ProductSearch::where('created_at', '>=', now()->subDays($days))->count();
        $totalViews = ProductView::where('created_at', '>=', now()->subDays($days))->count();
        $uniqueSearchTerms = ProductSearch::where('created_at', '>=', now()->subDays($days))
            ->distinct('search_term')
            ->count('search_term');
        $uniqueViewedProducts = ProductView::where('created_at', '>=', now()->subDays($days))
            ->distinct('product_id')
            ->count('product_id');

        // Search to view conversion rate
        $searchesWithResults = ProductSearch::where('created_at', '>=', now()->subDays($days))
            ->where('results_count', '>', 0)
            ->count();
        $conversionRate = $totalSearches > 0 ? round(($searchesWithResults / $totalSearches) * 100, 2) : 0;

        // Daily trends (last 30 days)
        $dailySearches = ProductSearch::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $dailyViews = ProductView::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_searches' => $totalSearches,
                    'total_views' => $totalViews,
                    'unique_search_terms' => $uniqueSearchTerms,
                    'unique_viewed_products' => $uniqueViewedProducts,
                    'conversion_rate' => $conversionRate,
                ],
                'most_searched' => $mostSearched,
                'trending_searches' => $trendingSearches,
                'most_viewed_products' => $mostViewed,
                'trending_products' => $trendingProducts,
                'category_stats' => $categoryStats,
                'daily_trends' => [
                    'searches' => $dailySearches,
                    'views' => $dailyViews,
                ],
            ]
        ]);
    }

    /**
     * Get most searched terms (Admin only)
     */
    public function getMostSearched(Request $request)
    {
        $limit = $request->input('limit', 20);
        $days = $request->input('days', 30);

        $searches = ProductSearch::getMostSearched($limit, $days);

        return response()->json([
            'success' => true,
            'data' => $searches
        ]);
    }

    /**
     * Get most viewed products (Admin only)
     */
    public function getMostViewed(Request $request)
    {
        $limit = $request->input('limit', 20);
        $days = $request->input('days', 30);

        $products = ProductView::getMostViewed($limit, $days);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Get category statistics (Admin only)
     */
    public function getCategoryStats(Request $request)
    {
        $days = $request->input('days', 30);

        $stats = ProductView::getCategoryStats($days);

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get trending searches (Admin only)
     */
    public function getTrendingSearches(Request $request)
    {
        $limit = $request->input('limit', 20);

        $trending = ProductSearch::getTrendingSearches($limit);

        return response()->json([
            'success' => true,
            'data' => $trending
        ]);
    }

    /**
     * Get trending products (Admin only)
     */
    public function getTrendingProducts(Request $request)
    {
        $limit = $request->input('limit', 20);

        $trending = ProductView::getTrendingProducts($limit);

        return response()->json([
            'success' => true,
            'data' => $trending
        ]);
    }

    /**
     * Get search history with pagination (Admin only)
     */
    public function getSearchHistory(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $searchTerm = $request->input('search');
        $userType = $request->input('user_type');

        $query = ProductSearch::with('user')
            ->orderBy('created_at', 'desc');

        if ($searchTerm) {
            $query->where('search_term', 'like', "%{$searchTerm}%");
        }

        if ($userType) {
            $query->where('user_type', $userType);
        }

        $searches = $query->paginate($perPage);

        return response()->json($searches);
    }

    /**
     * Get view history with pagination (Admin only)
     */
    public function getViewHistory(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $productId = $request->input('product_id');
        $userType = $request->input('user_type');

        $query = ProductView::with(['product', 'user'])
            ->orderBy('created_at', 'desc');

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($userType) {
            $query->where('user_type', $userType);
        }

        $views = $query->paginate($perPage);

        return response()->json($views);
    }

    /**
     * Export analytics data (Admin only)
     */
    public function exportAnalytics(Request $request)
    {
        $type = $request->input('type', 'searches'); // searches, views, categories
        $days = $request->input('days', 30);

        $data = [];

        switch ($type) {
            case 'searches':
                $data = ProductSearch::getMostSearched(1000, $days);
                break;
            case 'views':
                $data = ProductView::getMostViewed(1000, $days);
                break;
            case 'categories':
                $data = ProductView::getCategoryStats($days);
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'type' => $type,
            'period_days' => $days,
            'exported_at' => now()->toDateTimeString(),
        ]);
    }
}

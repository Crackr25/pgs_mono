<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductView extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'user_type',
        'ip_address',
        'user_agent',
        'referrer',
        'duration_seconds',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the product that was viewed
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who viewed the product
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get views within a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get views by user type
     */
    public function scopeByUserType($query, $userType)
    {
        return $query->where('user_type', $userType);
    }

    /**
     * Get most viewed products
     */
    public static function getMostViewed($limit = 10, $days = 30)
    {
        return self::where('product_views.created_at', '>=', now()->subDays($days))
            ->join('products', 'product_views.product_id', '=', 'products.id')
            ->selectRaw('
                product_views.product_id,
                products.name,
                products.category,
                products.price,
                products.image,
                COUNT(*) as view_count,
                COUNT(DISTINCT product_views.user_id) as unique_viewers,
                AVG(product_views.duration_seconds) as avg_duration
            ')
            ->groupBy('product_views.product_id', 'products.name', 'products.category', 'products.price', 'products.image')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get category view statistics
     */
    public static function getCategoryStats($days = 30)
    {
        return self::where('product_views.created_at', '>=', now()->subDays($days))
            ->join('products', 'product_views.product_id', '=', 'products.id')
            ->selectRaw('
                products.category,
                COUNT(*) as view_count,
                COUNT(DISTINCT product_views.product_id) as product_count,
                COUNT(DISTINCT product_views.user_id) as unique_viewers
            ')
            ->groupBy('products.category')
            ->orderByDesc('view_count')
            ->get();
    }

    /**
     * Get trending products (recent spike in views)
     */
    public static function getTrendingProducts($limit = 10)
    {
        $recentViews = self::where('product_views.created_at', '>=', now()->subDays(7))
            ->join('products', 'product_views.product_id', '=', 'products.id')
            ->selectRaw('
                product_views.product_id,
                products.name,
                products.category,
                products.price,
                products.image,
                COUNT(*) as recent_count
            ')
            ->groupBy('product_views.product_id', 'products.name', 'products.category', 'products.price', 'products.image')
            ->get()
            ->keyBy('product_id');

        $olderViews = self::whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])
            ->selectRaw('product_id, COUNT(*) as older_count')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $trending = [];
        foreach ($recentViews as $productId => $data) {
            $recentCount = $data->recent_count;
            $olderCount = $olderViews->get($productId)?->older_count ?? 1;
            $growthRate = (($recentCount - $olderCount) / $olderCount) * 100;

            if ($growthRate > 0) {
                $trending[] = [
                    'product_id' => $productId,
                    'name' => $data->name,
                    'category' => $data->category,
                    'price' => $data->price,
                    'image' => $data->image,
                    'recent_count' => $recentCount,
                    'growth_rate' => round($growthRate, 2),
                ];
            }
        }

        usort($trending, fn($a, $b) => $b['growth_rate'] <=> $a['growth_rate']);
        return array_slice($trending, 0, $limit);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'search_term',
        'user_id',
        'user_type',
        'results_count',
        'ip_address',
        'user_agent',
        'filters',
    ];

    protected $casts = [
        'filters' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who performed the search
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get searches within a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get searches by user type
     */
    public function scopeByUserType($query, $userType)
    {
        return $query->where('user_type', $userType);
    }

    /**
     * Get most searched terms
     */
    public static function getMostSearched($limit = 10, $days = 30)
    {
        return self::where('created_at', '>=', now()->subDays($days))
            ->selectRaw('search_term, COUNT(*) as search_count, SUM(results_count) as total_results')
            ->groupBy('search_term')
            ->orderByDesc('search_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get trending searches (recent spike in searches)
     */
    public static function getTrendingSearches($limit = 10)
    {
        $recentSearches = self::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('search_term, COUNT(*) as recent_count')
            ->groupBy('search_term')
            ->get()
            ->keyBy('search_term');

        $olderSearches = self::whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])
            ->selectRaw('search_term, COUNT(*) as older_count')
            ->groupBy('search_term')
            ->get()
            ->keyBy('search_term');

        $trending = [];
        foreach ($recentSearches as $term => $data) {
            $recentCount = $data->recent_count;
            $olderCount = $olderSearches->get($term)?->older_count ?? 1;
            $growthRate = (($recentCount - $olderCount) / $olderCount) * 100;

            if ($growthRate > 0) {
                $trending[] = [
                    'search_term' => $term,
                    'recent_count' => $recentCount,
                    'growth_rate' => round($growthRate, 2),
                ];
            }
        }

        usort($trending, fn($a, $b) => $b['growth_rate'] <=> $a['growth_rate']);
        return array_slice($trending, 0, $limit);
    }
}

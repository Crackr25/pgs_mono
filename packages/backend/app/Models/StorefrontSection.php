<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontSection extends Model
{
    protected $fillable = [
        'storefront_id', 'page_id', 'section_type', 'title', 'content', 
        'images', 'settings', 'sort_order', 'is_visible'
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'images' => 'array',
        'settings' => 'array',
    ];

    /**
     * Get the storefront that owns the section
     */
    public function storefront()
    {
        return $this->belongsTo(CompanyStorefront::class, 'storefront_id');
    }

    /**
     * Get the page that owns the section (Dynamic-style page association)
     */
    public function page()
    {
        return $this->belongsTo(StorefrontPage::class, 'page_id');
    }

    /**
     * Get full URLs for all images in the section
     */
    public function getImageUrlsAttribute()
    {
        if (!$this->images) return [];
        
        return array_map(function($path) {
            return asset('storage/' . $path);
        }, $this->images);
    }
}

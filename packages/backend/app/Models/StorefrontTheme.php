<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontTheme extends Model
{
    protected $fillable = [
        'name', 'description', 'preview_image', 'css_template', 
        'layout_config', 'color_scheme', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'layout_config' => 'array',
        'color_scheme' => 'array',
    ];

    /**
     * Get all storefronts using this theme
     */
    public function storefronts()
    {
        return $this->hasMany(CompanyStorefront::class, 'theme_id');
    }

    /**
     * Get the full preview image URL
     */
    public function getPreviewUrlAttribute()
    {
        return $this->preview_image ? asset('storage/' . $this->preview_image) : null;
    }
}

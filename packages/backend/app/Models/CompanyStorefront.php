<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CompanyStorefront extends Model
{
    protected $fillable = [
        'company_id', 'slug', 'theme_id', 'banner_image', 'tagline', 'about_us',
        'primary_color', 'secondary_color', 'accent_color', 'font_family', 
        'header_layout', 'custom_css', 'meta_title', 'meta_description', 
        'meta_keywords', 'is_active', 'show_contact_form', 'show_products', 
        'social_links'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_contact_form' => 'boolean',
        'show_products' => 'boolean',
        'social_links' => 'array',
    ];

    /**
     * Get the company that owns the storefront
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the theme associated with the storefront
     */
    public function theme()
    {
        return $this->belongsTo(StorefrontTheme::class);
    }

    /**
     * Get all sections for the storefront
     */
    public function sections()
    {
        return $this->hasMany(StorefrontSection::class, 'storefront_id')->orderBy('sort_order');
    }

    /**
     * Get all pages for the storefront (Dynamic-style pages)
     */
    public function pages()
    {
        return $this->hasMany(StorefrontPage::class, 'storefront_id');
    }

    /**
     * Get all menu items for the storefront (Custom navigation)
     */
    public function menuItems()
    {
        return $this->hasMany(StorefrontMenuItem::class, 'storefront_id')
            ->where('is_visible', true)
            ->orderBy('sort_order');
    }

    /**
     * Get the full storefront URL
     */
    public function getStorefrontUrlAttribute()
    {
        return url("/store/{$this->slug}");
    }

    /**
     * Get the full banner image URL
     */
    public function getBannerUrlAttribute()
    {
        return $this->banner_image ? asset('storage/' . $this->banner_image) : null;
    }

    /**
     * Generate a unique slug from company name
     *
     * @param string $companyName
     * @return string
     */
    public static function generateUniqueSlug($companyName)
    {
        $slug = Str::slug($companyName);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}

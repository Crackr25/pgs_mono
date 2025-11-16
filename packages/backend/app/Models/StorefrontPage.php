<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorefrontPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'storefront_id',
        'slug',
        'title',
        'content',
        'meta_description',
        'meta_keywords',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function storefront()
    {
        return $this->belongsTo(CompanyStorefront::class, 'storefront_id');
    }

    public function sections()
    {
        return $this->hasMany(StorefrontSection::class, 'page_id')->orderBy('sort_order');
    }
}

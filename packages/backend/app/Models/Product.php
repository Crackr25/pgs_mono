<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'specs',
        'image',
        'moq',
        'lead_time',
        'hs_code',
        'origin_country',
        'brand_name',
        'model_number',
        'warranty',
        'variants',
        'videos',
        'price',
        'category',
        'description',
        'active',
        'stock_quantity',
        'unit'
    ];

    protected $casts = [
        'variants' => 'array',
        'videos' => 'array',
        'price' => 'decimal:2',
        'active' => 'boolean',
        'moq' => 'integer',
        'stock_quantity' => 'integer'
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function mainImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_main', true);
    }

    public function additionalImages()
    {
        return $this->hasMany(ProductImage::class)->where('is_main', false)->orderBy('sort_order');
    }
}

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
        'images',
        'moq',
        'lead_time',
        'hs_code',
        'variants',
        'price',
        'category',
        'description',
        'active',
        'stock_quantity',
        'unit'
    ];

    protected $casts = [
        'images' => 'array',
        'variants' => 'array',
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
}

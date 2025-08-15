<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'registration',
        'peza_id',
        'location',
        'year_established',
        'factory_size',
        'product_lines',
        'employees',
        'description',
        'website',
        'phone',
        'email',
        'logo',
        'verified',
        'status'
    ];

    protected $casts = [
        'product_lines' => 'array',
        'verified' => 'boolean',
        'year_established' => 'integer',
        'employees' => 'integer'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}

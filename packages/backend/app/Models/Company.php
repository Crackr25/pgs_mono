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
        'status',
        // Onboarding file uploads
        'dti_sec_certificate',
        'peza_documents',
        'product_certifications',
        'business_permits',
        'kyc_id_front',
        'kyc_id_back',
        'kyc_proof_address',
        'kyc_business_registration',
        'factory_overview_video',
        'production_line_photos',
        'quality_control_photos',
        'warehouse_photos',
        'certifications_display_photos',
        'onboarding_step'
    ];

    protected $casts = [
        'product_lines' => 'array',
        'verified' => 'boolean',
        'year_established' => 'integer',
        'employees' => 'integer',
        // File upload arrays
        'peza_documents' => 'array',
        'product_certifications' => 'array',
        'business_permits' => 'array',
        'production_line_photos' => 'array',
        'quality_control_photos' => 'array',
        'warehouse_photos' => 'array',
        'certifications_display_photos' => 'array'
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

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
        'manufacturer_type',
        'registration',
        'peza_id',
        'location',
        'country',
        'preferred_payout_method',
        'payout_settings',
        'year_established',
        'years_in_business',
        'factory_size',
        'product_lines',
        'main_categories',
        'employees',
        'description',
        'website',
        'phone',
        'email',
        'logo',
        'company_banner',
        'verified',
        'certification_badge',
        'certification_agency',
        'leading_factory_rank',
        'odm_services_available',
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
        'onboarding_step',
        'stripe_account_id',
        'stripe_onboarding_status',
        'stripe_account_created_at'
    ];

    protected $casts = [
        'product_lines' => 'array',
        'main_categories' => 'array',
        'payout_settings' => 'array',
        'verified' => 'boolean',
        'odm_services_available' => 'boolean',
        'year_established' => 'integer',
        'years_in_business' => 'integer',
        'employees' => 'integer',
        // File upload arrays
        'peza_documents' => 'array',
        'product_certifications' => 'array',
        'business_permits' => 'array',
        'production_line_photos' => 'array',
        'quality_control_photos' => 'array',
        'warehouse_photos' => 'array',
        'certifications_display_photos' => 'array',
        'stripe_account_created_at' => 'datetime'
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

    public function companyAgents()
    {
        return $this->hasMany(CompanyAgent::class);
    }

    public function agents()
    {
        return $this->belongsToMany(User::class, 'company_agents')
                    ->withPivot(['role', 'permissions', 'is_active', 'joined_at'])
                    ->withTimestamps();
    }

    public function activeAgents()
    {
        return $this->agents()->wherePivot('is_active', true)->whereNotNull('joined_at');
    }

    public function sellerPayouts()
    {
        return $this->hasMany(SellerPayout::class);
    }

    public function pendingPayouts()
    {
        return $this->hasMany(SellerPayout::class)->where('status', 'pending');
    }

    public function completedPayouts()
    {
        return $this->hasMany(SellerPayout::class)->where('status', 'completed');
    }

    public function storefront()
    {
        return $this->hasOne(CompanyStorefront::class);
    }

    // Helper methods for payout management
    public function getTotalPendingPayouts()
    {
        return $this->pendingPayouts()->sum('net_amount');
    }

    public function getTotalCompletedPayouts()
    {
        return $this->completedPayouts()->sum('net_amount');
    }

    public function getDefaultPayoutMethod()
    {
        // If preferred method is set, use it
        if ($this->preferred_payout_method) {
            return $this->preferred_payout_method;
        }
        
        // Otherwise, use country-based default
        return $this->country === 'US' ? 'stripe' : 'manual';
    }

    public function canUseStripePayouts()
    {
        return $this->stripe_account_id && $this->stripe_onboarding_status === 'completed';
    }

    public function getAvailablePayoutMethods()
    {
        $methods = ['manual']; // Manual is always available
        
        if ($this->canUseStripePayouts()) {
            $methods[] = 'stripe';
        }
        
        return $methods;
    }
}

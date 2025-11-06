<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rfq extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'title',
        'description',
        'category',
        'quantity',
        'unit',
        'budget_min',
        'budget_max',
        'delivery_location',
        'delivery_date',
        'specifications',
        'attachments',
        'terms_conditions',
        'payment_terms',
        'validity_days',
        'expires_at',
        'status',
        'quote_count',
        'sample_requirements',
        'supplier_location_preference',
        'quality_standards',
        'certifications_required'
    ];

    protected $casts = [
        'specifications' => 'array',
        'attachments' => 'array',
        'certifications_required' => 'array',
        'delivery_date' => 'date',
        'expires_at' => 'datetime',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'quantity' => 'integer',
        'validity_days' => 'integer',
        'quote_count' => 'integer'
    ];

    protected $dates = [
        'delivery_date',
        'expires_at'
    ];

    // Relationships
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(RfqResponse::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'published')
                    ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByBudgetRange($query, $min, $max)
    {
        return $query->where('budget_max', '>=', $min)
                    ->where('budget_min', '<=', $max);
    }

    // Accessors
    public function getIsExpiredAttribute()
    {
        return $this->expires_at <= now();
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'draft' => 'gray',
            'published' => 'green',
            'closed' => 'blue',
            'expired' => 'red',
            default => 'gray'
        };
    }

    public function getBudgetRangeAttribute()
    {
        return '$' . number_format($this->budget_min, 2) . ' - $' . number_format($this->budget_max, 2);
    }

    // Mutators
    public function setExpiresAtAttribute($value)
    {
        if (!$value && $this->validity_days) {
            $this->attributes['expires_at'] = now()->addDays($this->validity_days);
        } else {
            $this->attributes['expires_at'] = $value;
        }
    }

    // Methods
    public function markAsExpired()
    {
        $this->update(['status' => 'expired']);
    }

    public function incrementQuoteCount()
    {
        $this->increment('quote_count');
    }

    public function canReceiveQuotes()
    {
        return $this->status === 'published' && !$this->is_expired;
    }
}

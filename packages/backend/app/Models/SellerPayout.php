<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SellerPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'order_id',
        'gross_amount',
        'platform_fee',
        'net_amount',
        'currency',
        'platform_fee_percentage',
        'payout_method',
        'status',
        'stripe_transfer_id',
        'stripe_payout_id',
        'stripe_response',
        'admin_user_id',
        'manual_reference',
        'manual_notes',
        'manual_details',
        'processed_at',
        'failed_at',
        'failure_reason'
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'platform_fee_percentage' => 'decimal:2',
        'stripe_response' => 'array',
        'manual_details' => 'array',
        'processed_at' => 'datetime',
        'failed_at' => 'datetime'
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    // Scopes
    public function scopePending(Builder $query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted(Builder $query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed(Builder $query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeStripePayouts(Builder $query)
    {
        return $query->where('payout_method', 'stripe');
    }

    public function scopeManualPayouts(Builder $query)
    {
        return $query->where('payout_method', 'manual');
    }

    public function scopeForCompany(Builder $query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // Helper Methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function isStripeMethod()
    {
        return $this->payout_method === 'stripe';
    }

    public function isManualMethod()
    {
        return $this->payout_method === 'manual';
    }

    public function markAsCompleted($processedAt = null)
    {
        $this->update([
            'status' => 'completed',
            'processed_at' => $processedAt ?? now(),
            'failed_at' => null,
            'failure_reason' => null
        ]);
    }

    public function markAsFailed($reason = null, $failedAt = null)
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => $failedAt ?? now(),
            'failure_reason' => $reason
        ]);
    }

    public function markAsProcessing()
    {
        $this->update([
            'status' => 'processing'
        ]);
    }

    // Static Methods
    public static function createFromOrder(Order $order, $platformFeePercentage = 7.9, $payoutMethod = null)
    {
        $company = $order->company;
        
        // Determine payout method based on company country if not specified
        if (!$payoutMethod) {
            $payoutMethod = $company->country === 'US' ? 'stripe' : 'manual';
        }

        // NEW ADDITIVE APPROACH: order total includes platform fee
        // Customer paid: total_amount = base_amount + (base_amount * platform_fee_percentage / 100)
        // Solve for base_amount: base_amount = total_amount / (1 + platform_fee_percentage / 100)
        $totalPaid = $order->total_amount;
        $baseAmount = $totalPaid / (1 + $platformFeePercentage / 100);
        $platformFee = $totalPaid - $baseAmount;
        
        // Seller gets the base amount (what they should receive)
        $grossAmount = $baseAmount; // What seller should receive
        $netAmount = $baseAmount;   // Same as gross since platform fee is additive

        return self::create([
            'company_id' => $company->id,
            'order_id' => $order->id,
            'gross_amount' => $grossAmount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'currency' => 'USD', // Could be dynamic based on order
            'platform_fee_percentage' => $platformFeePercentage,
            'payout_method' => $payoutMethod,
            'status' => 'pending'
        ]);
    }

    // Accessors
    public function getFormattedGrossAmountAttribute()
    {
        return '$' . number_format($this->gross_amount, 2);
    }

    public function getFormattedPlatformFeeAttribute()
    {
        return '$' . number_format($this->platform_fee, 2);
    }

    public function getFormattedNetAmountAttribute()
    {
        return '$' . number_format($this->net_amount, 2);
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'bg-yellow-100 text-yellow-800',
            'processing' => 'bg-blue-100 text-blue-800',
            'completed' => 'bg-green-100 text-green-800',
            'failed' => 'bg-red-100 text-red-800',
            'cancelled' => 'bg-gray-100 text-gray-800'
        ];

        return $badges[$this->status] ?? 'bg-gray-100 text-gray-800';
    }
}

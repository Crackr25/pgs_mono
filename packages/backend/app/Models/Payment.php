<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'gateway_response',
        'processed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'processed_at' => 'datetime'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function company()
    {
        return $this->hasOneThrough(Company::class, Order::class, 'id', 'id', 'order_id', 'company_id');
    }

    public function user()
    {
        return $this->hasOneThrough(User::class, Order::class, 'id', 'id', 'order_id', 'user_id');
    }

    // Scopes
    public function scopeCompleted(Builder $query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed(Builder $query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending(Builder $query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByPaymentMethod(Builder $query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByDateRange(Builder $query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeByAmountRange(Builder $query, $minAmount, $maxAmount)
    {
        return $query->whereBetween('amount', [$minAmount, $maxAmount]);
    }

    // Accessors
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2);
    }

    public function getPlatformFeeAmountAttribute()
    {
        return $this->gateway_response['platform_fee_amount'] ?? 0;
    }

    public function getMerchantAmountAttribute()
    {
        return $this->gateway_response['merchant_amount'] ?? 0;
    }

    public function getPaymentFlowAttribute()
    {
        return $this->gateway_response['payment_flow'] ?? 'unknown';
    }

    public function getMerchantCountryAttribute()
    {
        return $this->gateway_response['merchant_country'] ?? 'Unknown';
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isStripePayment(): bool
    {
        return $this->payment_method === 'stripe';
    }

    public function getFinancialBreakdown(): array
    {
        $gatewayResponse = $this->gateway_response ?? [];
        
        return [
            'customer_paid' => $gatewayResponse['customer_paid'] ?? $this->amount,
            'platform_fee_percentage' => $gatewayResponse['platform_fee_percentage'] ?? 7.9,
            'platform_fee_amount' => $gatewayResponse['platform_fee_amount'] ?? 0,
            'merchant_amount' => $gatewayResponse['merchant_amount'] ?? 0,
            'payment_flow' => $gatewayResponse['payment_flow'] ?? 'unknown',
        ];
    }

    public function getTechnicalDetails(): array
    {
        $gatewayResponse = $this->gateway_response ?? [];
        
        return [
            'payment_intent_id' => $gatewayResponse['payment_intent_id'] ?? null,
            'merchant_country' => $gatewayResponse['merchant_country'] ?? 'Unknown',
            'processed_at' => $gatewayResponse['processed_at'] ?? null,
            'webhook_received_at' => $gatewayResponse['webhook_received_at'] ?? null,
        ];
    }
}

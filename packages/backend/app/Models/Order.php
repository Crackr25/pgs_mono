<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quote_id',
        'company_id',
        'order_number',
        'product_name',
        'quantity',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_intent_id',
        'paid_at',
        'estimated_delivery',
        'progress',
        'buyer_name',
        'buyer_email',
        'buyer_company',
        'shipping_address',
        'billing_address',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'total_amount' => 'decimal:2',
        'progress' => 'integer',
        'estimated_delivery' => 'date',
        'paid_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function sellerPayout()
    {
        return $this->hasOne(SellerPayout::class);
    }

    // Helper methods for payout management
    public function hasSellerPayout()
    {
        return $this->sellerPayout()->exists();
    }

    public function createSellerPayout($platformFeePercentage = 2.5, $payoutMethod = null)
    {
        if ($this->hasSellerPayout()) {
            return $this->sellerPayout;
        }

        return SellerPayout::createFromOrder($this, $platformFeePercentage, $payoutMethod);
    }

    public function isPayoutEligible()
    {
        return $this->payment_status === 'paid' && !$this->hasSellerPayout();
    }
}

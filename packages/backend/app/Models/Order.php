<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
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
}

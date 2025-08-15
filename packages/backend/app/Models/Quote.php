<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'company_id',
        'buyer_name',
        'buyer_email',
        'buyer_company',
        'quantity',
        'target_price',
        'deadline',
        'status',
        'message',
        'response_message',
        'quoted_price',
        'quoted_lead_time'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'target_price' => 'decimal:2',
        'quoted_price' => 'decimal:2',
        'deadline' => 'date'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}

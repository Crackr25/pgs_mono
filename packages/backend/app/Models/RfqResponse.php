<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'rfq_id',
        'supplier_id',
        'supplier_company_name',
        'quoted_price',
        'lead_time_days',
        'message',
        'terms_conditions',
        'attachments',
        'status',
        'supplier_rating',
        'total_orders',
        'submitted_at'
    ];

    protected $casts = [
        'attachments' => 'array',
        'quoted_price' => 'decimal:2',
        'supplier_rating' => 'decimal:2',
        'lead_time_days' => 'integer',
        'total_orders' => 'integer',
        'submitted_at' => 'datetime'
    ];

    protected $dates = [
        'submitted_at'
    ];

    // Relationships
    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeByRfq($query, $rfqId)
    {
        return $query->where('rfq_id', $rfqId);
    }

    public function scopeBySupplier($query, $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    // Accessors
    public function getFormattedQuotedPriceAttribute()
    {
        return '$' . number_format($this->quoted_price, 2);
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'accepted' => 'green',
            'rejected' => 'red',
            'withdrawn' => 'gray',
            default => 'gray'
        };
    }
}

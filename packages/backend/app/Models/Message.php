<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_name',
        'sender_email',
        'sender_company',
        'recipient_company_id',
        'subject',
        'message',
        'unread',
        'message_type',
        'related_quote_id',
        'related_order_id',
        'attachments'
    ];

    protected $casts = [
        'unread' => 'boolean',
        'attachments' => 'array'
    ];

    // Relationships
    public function recipientCompany()
    {
        return $this->belongsTo(Company::class, 'recipient_company_id');
    }

    public function relatedQuote()
    {
        return $this->belongsTo(Quote::class, 'related_quote_id');
    }

    public function relatedOrder()
    {
        return $this->belongsTo(Order::class, 'related_order_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'read',
        'message_type',
        'attachments',
        'product_id',
        'product_context',
        'payment_link_id',
        'payment_amount',
        'payment_currency',
        'payment_description',
        'payment_status',
        'payment_expires_at',
        'payment_paid_at'
    ];

    protected $casts = [
        'read' => 'boolean',
        'attachments' => 'array',
        'product_context' => 'array',
        'payment_amount' => 'decimal:2',
        'payment_expires_at' => 'datetime',
        'payment_paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
        });
    }

    // Mark message as read
    public function markAsRead()
    {
        $this->update(['read' => true]);
    }
}

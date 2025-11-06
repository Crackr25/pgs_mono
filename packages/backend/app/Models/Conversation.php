<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'buyer_id',
        'order_id',
        'status',
        'last_message_at',
        'assigned_agent_id',
        'assigned_at',
        'assignment_type'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'assigned_at' => 'datetime'
    ];

    // Relationships
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function assignedAgent()
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class)->latestOfMany();
    }

    public function unreadMessagesCount($userId)
    {
        return $this->chatMessages()
            ->where('receiver_id', $userId)
            ->where('read', false)
            ->count();
    }

    // Scope for seller conversations
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    // Scope for buyer conversations
    public function scopeForBuyer($query, $buyerId)
    {
        return $query->where('buyer_id', $buyerId);
    }

    // Scope for agent conversations
    public function scopeForAgent($query, $agentId)
    {
        return $query->where('assigned_agent_id', $agentId);
    }

    // Scope for company conversations (seller or assigned agents)
    public function scopeForCompany($query, $sellerId, $agentIds = [])
    {
        return $query->where(function($q) use ($sellerId, $agentIds) {
            $q->where('seller_id', $sellerId);
            if (!empty($agentIds)) {
                $q->orWhereIn('assigned_agent_id', $agentIds);
            }
        });
    }
}

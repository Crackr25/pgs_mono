<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'message_type',
        'attachments',
        'read',
        'read_at'
    ];

    protected $casts = [
        'attachments' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['sender', 'receiver'];

    // Relationships
    public function conversation()
    {
        return $this->belongsTo(AgentConversation::class, 'agent_conversation_id');
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

    public function scopeForConversation($query, $conversationId)
    {
        return $query->where('agent_conversation_id', $conversationId);
    }

    // Helper methods
    public function markAsRead()
    {
        if (!$this->read) {
            $this->read = true;
            $this->read_at = now();
            $this->save();
        }
    }
}

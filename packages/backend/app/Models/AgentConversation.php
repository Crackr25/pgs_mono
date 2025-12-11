<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent1_id',
        'agent2_id',
        'company1_id',
        'company2_id',
        'last_message_at',
        'agent1_unread_count',
        'agent2_unread_count'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function agent1()
    {
        return $this->belongsTo(User::class, 'agent1_id');
    }

    public function agent2()
    {
        return $this->belongsTo(User::class, 'agent2_id');
    }

    public function company1()
    {
        return $this->belongsTo(Company::class, 'company1_id');
    }

    public function company2()
    {
        return $this->belongsTo(Company::class, 'company2_id');
    }

    public function messages()
    {
        return $this->hasMany(AgentMessage::class)->latest();
    }

    public function lastMessage()
    {
        return $this->hasOne(AgentMessage::class)->latestOfMany();
    }

    // Scopes
    public function scopeForAgent($query, $agentId)
    {
        return $query->where('agent1_id', $agentId)
                     ->orWhere('agent2_id', $agentId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('last_message_at', 'desc');
    }

    // Helper methods
    public function getOtherAgent($currentAgentId)
    {
        return $this->agent1_id == $currentAgentId ? $this->agent2 : $this->agent1;
    }

    public function getOtherCompany($currentAgentId)
    {
        return $this->agent1_id == $currentAgentId ? $this->company2 : $this->company1;
    }

    public function getUnreadCount($agentId)
    {
        return $this->agent1_id == $agentId ? $this->agent1_unread_count : $this->agent2_unread_count;
    }

    public function markAsRead($agentId)
    {
        if ($this->agent1_id == $agentId) {
            $this->agent1_unread_count = 0;
        } else {
            $this->agent2_unread_count = 0;
        }
        $this->save();
    }

    public function incrementUnread($receiverId)
    {
        if ($this->agent1_id == $receiverId) {
            $this->increment('agent1_unread_count');
        } else {
            $this->increment('agent2_unread_count');
        }
    }

    public static function findOrCreateConversation($agent1Id, $agent2Id)
    {
        // Ensure consistent ordering (smaller ID first)
        $ids = [$agent1Id, $agent2Id];
        sort($ids);

        $conversation = self::where('agent1_id', $ids[0])
                           ->where('agent2_id', $ids[1])
                           ->first();

        if (!$conversation) {
            $agent1 = User::find($ids[0]);
            $agent2 = User::find($ids[1]);

            $conversation = self::create([
                'agent1_id' => $ids[0],
                'agent2_id' => $ids[1],
                'company1_id' => $agent1->companyAgent->company_id,
                'company2_id' => $agent2->companyAgent->company_id,
            ]);
        }

        return $conversation;
    }
}

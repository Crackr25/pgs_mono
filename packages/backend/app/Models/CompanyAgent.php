<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CompanyAgent extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'role',
        'permissions',
        'is_active',
        'invited_at',
        'joined_at',
        'invitation_token'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
        'invited_at' => 'datetime',
        'joined_at' => 'datetime'
    ];

    // Default permissions for different roles
    public static $rolePermissions = [
        'customer_service' => [
            'messages' => ['read', 'reply'],
            'products' => ['view'],
            'orders' => ['view']
        ],
        'sales' => [
            'messages' => ['read', 'reply', 'initiate'],
            'products' => ['view', 'discuss'],
            'quotes' => ['create', 'modify'],
            'orders' => ['view', 'update']
        ],
        'manager' => [
            'messages' => ['read', 'reply', 'initiate'],
            'products' => ['view', 'discuss'],
            'quotes' => ['create', 'modify', 'approve'],
            'orders' => ['view', 'update'],
            'agents' => ['manage']
        ]
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedConversations()
    {
        return $this->hasMany(Conversation::class, 'assigned_agent_id', 'user_id');
    }

    // Helper methods
    public function getPermissions()
    {
        if ($this->permissions) {
            return $this->permissions;
        }

        return self::$rolePermissions[$this->role] ?? [];
    }

    public function hasPermission($category, $action)
    {
        $permissions = $this->getPermissions();
        return isset($permissions[$category]) && in_array($action, $permissions[$category]);
    }

    public function generateInvitationToken()
    {
        $this->invitation_token = Str::random(64);
        $this->invited_at = now();
        $this->save();
        
        return $this->invitation_token;
    }

    public function acceptInvitation()
    {
        $this->joined_at = now();
        $this->invitation_token = null;
        $this->save();
    }

    public function isActive()
    {
        return $this->is_active && $this->joined_at !== null;
    }

    public function isPending()
    {
        return $this->invitation_token !== null && $this->joined_at === null;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->whereNotNull('joined_at');
    }

    public function scopePending($query)
    {
        return $query->whereNotNull('invitation_token')->whereNull('joined_at');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }
}

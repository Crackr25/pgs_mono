<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'usertype',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the company associated with the user.
     */
    public function company()
    {
        return $this->hasOne(Company::class);
    }

    /**
     * Get the company agent record for this user.
     */
    public function companyAgent()
    {
        return $this->hasOne(CompanyAgent::class);
    }

    /**
     * Get all companies where this user is an agent.
     */
    public function agentCompanies()
    {
        return $this->belongsToMany(Company::class, 'company_agents')
                    ->withPivot(['role', 'permissions', 'is_active', 'joined_at'])
                    ->withTimestamps();
    }

    /**
     * Check if user is an agent for any company.
     */
    public function isAgent()
    {
        return $this->usertype === 'agent' || $this->companyAgent()->exists();
    }

    /**
     * Check if user is a seller (owns a company).
     */
    public function isSeller()
    {
        return $this->usertype === 'seller' && $this->company()->exists();
    }

    /**
     * Check if user is a buyer.
     */
    public function isBuyer()
    {
        return $this->usertype === 'buyer';
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin()
    {
        return $this->usertype === 'admin';
    }

    /**
     * Get the active company context for the user.
     * For sellers, returns their own company.
     * For agents, returns the company they work for.
     */
    public function getActiveCompany()
    {
        if ($this->isSeller()) {
            return $this->company;
        }

        if ($this->isAgent()) {
            $agentRecord = $this->companyAgent()->active()->first();
            return $agentRecord ? $agentRecord->company : null;
        }

        return null;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'first_name',
        'last_name',
        'company',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip_code',
        'country',
        'phone',
        'email',
        'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the shipping address.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get default address for a user.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Get the full name.
     */
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Get the full address.
     */
    public function getFullAddressAttribute()
    {
        $address = $this->address_line_1;
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        $address .= ', ' . $this->city . ', ' . $this->state . ' ' . $this->zip_code;
        if ($this->country !== 'Philippines') {
            $address .= ', ' . $this->country;
        }
        return $address;
    }

    /**
     * Set this address as default and unset others.
     */
    public function setAsDefault()
    {
        // Unset other default addresses for this user
        static::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        // Set this as default
        $this->update(['is_default' => true]);
    }
}

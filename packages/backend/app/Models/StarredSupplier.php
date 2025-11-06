<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarredSupplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'supplier_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that starred the supplier.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the starred supplier (company).
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'supplier_id');
    }
}

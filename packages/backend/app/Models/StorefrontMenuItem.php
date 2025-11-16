<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorefrontMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'storefront_id',
        'parent_id',
        'label',
        'type',
        'target',
        'sort_order',
        'is_visible',
        'show_dropdown',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'show_dropdown' => 'boolean',
    ];

    public function storefront()
    {
        return $this->belongsTo(CompanyStorefront::class, 'storefront_id');
    }

    public function parent()
    {
        return $this->belongsTo(StorefrontMenuItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(StorefrontMenuItem::class, 'parent_id');
    }
}

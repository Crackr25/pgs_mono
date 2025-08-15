<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'order_id',
        'reviewer_name',
        'reviewer_email',
        'reviewer_company',
        'rating',
        'title',
        'comment',
        'verified',
        'response'
    ];

    protected $casts = [
        'rating' => 'integer',
        'verified' => 'boolean'
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

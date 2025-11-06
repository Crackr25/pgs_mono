<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'inquiry_type',
        'status',
        'user_id',
        'responded_at',
        'admin_notes'
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user that made this inquiry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for pending inquiries
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for resolved inquiries
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope for specific inquiry type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('inquiry_type', $type);
    }

    /**
     * Mark inquiry as responded
     */
    public function markAsResponded($notes = null)
    {
        $this->update([
            'status' => 'in_progress',
            'responded_at' => now(),
            'admin_notes' => $notes
        ]);
    }

    /**
     * Mark inquiry as resolved
     */
    public function markAsResolved($notes = null)
    {
        $this->update([
            'status' => 'resolved',
            'admin_notes' => $notes
        ]);
    }
}

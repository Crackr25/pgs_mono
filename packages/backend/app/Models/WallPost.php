<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WallPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'content',
        'images',
        'videos',
        'post_type',
        'likes_count',
        'replies_count',
        'is_pinned',
        'is_active'
    ];

    protected $casts = [
        'images' => 'array',
        'videos' => 'array',
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['user', 'company'];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function replies()
    {
        return $this->hasMany(PostReply::class)->where('is_active', true)->latest();
    }

    public function likes()
    {
        return $this->morphMany(PostLike::class, 'likeable');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Helper methods
    public function isLikedBy($userId)
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function toggleLike($userId)
    {
        $like = $this->likes()->where('user_id', $userId)->first();
        
        if ($like) {
            $like->delete();
            $this->decrement('likes_count');
            return false;
        } else {
            $this->likes()->create(['user_id' => $userId]);
            $this->increment('likes_count');
            return true;
        }
    }

    public function incrementReplies()
    {
        $this->increment('replies_count');
    }

    public function decrementReplies()
    {
        $this->decrement('replies_count');
    }
}

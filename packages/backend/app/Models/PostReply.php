<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PostReply extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'wall_post_id',
        'user_id',
        'company_id',
        'content',
        'images',
        'videos',
        'likes_count',
        'is_active'
    ];

    protected $casts = [
        'images' => 'array',
        'videos' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['user', 'company'];

    // Relationships
    public function wallPost()
    {
        return $this->belongsTo(WallPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
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
}

<?php

namespace App\Http\Controllers;

use App\Models\WallPost;
use App\Models\PostReply;
use App\Models\WallNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WallFeedController extends Controller
{
    /**
     * Get wall feed posts (paginated)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Only agents can access wall feed
        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied. Only agents can view the wall feed.'], 403);
        }

        $query = WallPost::active()->recent()->with(['replies' => function($q) {
            $q->limit(3); // Load only first 3 replies
        }]);

        // Filter by pinned
        if ($request->has('pinned')) {
            $query->pinned();
        }

        $posts = $query->paginate($request->get('per_page', 15));

        // Add liked status for current user
        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->is_liked_by_me = $post->isLikedBy($user->id);
            $post->replies->transform(function ($reply) use ($user) {
                $reply->is_liked_by_me = $reply->isLikedBy($user->id);
                return $reply;
            });
            return $post;
        });

        return response()->json($posts);
    }

    /**
     * Create a new wall post
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // Only agents can post
            if ($user->usertype !== 'agent') {
                return response()->json(['error' => 'Access denied. Only agents can create posts.'], 403);
            }

            $request->validate([
                'content' => 'required|string|max:5000',
                'images.*' => 'nullable|image|max:10240', // 10MB per image
                'videos.*' => 'nullable|mimes:mp4,mov,avi,wmv|max:51200', // 50MB per video
            ]);

            $companyAgent = $user->companyAgent;
            if (!$companyAgent) {
                \Log::error('Agent profile not found for user: ' . $user->id);
                return response()->json([
                    'error' => 'Agent profile not found. Please contact your company administrator.',
                    'user_id' => $user->id,
                    'usertype' => $user->usertype
                ], 404);
            }

        $images = [];
        $videos = [];
        $postType = 'text';

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('wall-posts/images', $filename, 'public');
                $images[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $image->getClientOriginalName()
                ];
            }
            $postType = 'image';
        }

        // Handle video uploads
        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = Str::uuid() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('wall-posts/videos', $filename, 'public');
                $videos[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $video->getClientOriginalName()
                ];
            }
            $postType = !empty($images) ? 'mixed' : 'video';
        }

            $post = WallPost::create([
                'user_id' => $user->id,
                'company_id' => $companyAgent->company_id,
                'content' => $request->content,
                'images' => !empty($images) ? $images : null,
                'videos' => !empty($videos) ? $videos : null,
                'post_type' => $postType,
            ]);

            $post->load('user', 'company');
            $post->is_liked_by_me = false;

            return response()->json([
                'message' => 'Post created successfully',
                'post' => $post
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating wall post: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to create post',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific post with all replies
     */
    public function show($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $post = WallPost::active()->with('replies')->findOrFail($id);
        $post->is_liked_by_me = $post->isLikedBy($user->id);
        
        $post->replies->transform(function ($reply) use ($user) {
            $reply->is_liked_by_me = $reply->isLikedBy($user->id);
            return $reply;
        });

        return response()->json($post);
    }

    /**
     * Update a post (only by creator)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $post = WallPost::findOrFail($id);

        if ($post->user_id !== $user->id) {
            return response()->json(['error' => 'You can only edit your own posts'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $post->update([
            'content' => $request->content
        ]);

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post->fresh(['user', 'company'])
        ]);
    }

    /**
     * Delete a post (only by creator)
     */
    public function destroy($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $post = WallPost::findOrFail($id);

        if ($post->user_id !== $user->id) {
            return response()->json(['error' => 'You can only delete your own posts'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Like/Unlike a post
     */
    public function toggleLike($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $post = WallPost::findOrFail($id);
        $liked = $post->toggleLike($user->id);

        // Create notification if liked and not own post
        if ($liked && $post->user_id !== $user->id) {
            WallNotification::create([
                'user_id' => $post->user_id,
                'actor_id' => $user->id,
                'type' => 'post_like',
                'wall_post_id' => $post->id,
            ]);
        }

        // Delete notification if unliked
        if (!$liked) {
            WallNotification::where('user_id', $post->user_id)
                ->where('actor_id', $user->id)
                ->where('type', 'post_like')
                ->where('wall_post_id', $post->id)
                ->delete();
        }

        return response()->json([
            'message' => $liked ? 'Post liked' : 'Post unliked',
            'liked' => $liked,
            'likes_count' => $post->fresh()->likes_count
        ]);
    }

    /**
     * Add a public reply to a post
     */
    public function addReply(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied. Only agents can reply.'], 403);
        }

        $post = WallPost::findOrFail($id);

        $request->validate([
            'content' => 'required|string|max:2000',
            'images.*' => 'nullable|image|max:10240',
            'videos.*' => 'nullable|mimes:mp4,mov,avi,wmv|max:51200',
        ]);

        $companyAgent = $user->companyAgent;
        if (!$companyAgent) {
            return response()->json(['error' => 'Agent profile not found'], 404);
        }

        $images = [];
        $videos = [];

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('wall-posts/replies/images', $filename, 'public');
                $images[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $image->getClientOriginalName()
                ];
            }
        }

        // Handle video uploads
        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = Str::uuid() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('wall-posts/replies/videos', $filename, 'public');
                $videos[] = [
                    'url' => url('storage/' . $path),
                    'path' => $path,
                    'name' => $video->getClientOriginalName()
                ];
            }
        }

        $reply = PostReply::create([
            'wall_post_id' => $post->id,
            'user_id' => $user->id,
            'company_id' => $companyAgent->company_id,
            'content' => $request->content,
            'images' => !empty($images) ? $images : null,
            'videos' => !empty($videos) ? $videos : null,
        ]);

        $post->incrementReplies();

        // Create notification for post owner (if not replying to own post)
        if ($post->user_id !== $user->id) {
            WallNotification::create([
                'user_id' => $post->user_id,
                'actor_id' => $user->id,
                'type' => 'post_reply',
                'wall_post_id' => $post->id,
                'wall_post_reply_id' => $reply->id,
                'content' => $request->content,
            ]);
        }

        $reply->load('user', 'company');
        $reply->is_liked_by_me = false;

        return response()->json([
            'message' => 'Reply added successfully',
            'reply' => $reply
        ], 201);
    }

    /**
     * Delete a reply (only by creator)
     */
    public function deleteReply($postId, $replyId)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $reply = PostReply::where('wall_post_id', $postId)->findOrFail($replyId);

        if ($reply->user_id !== $user->id) {
            return response()->json(['error' => 'You can only delete your own replies'], 403);
        }

        $post = $reply->wallPost;
        $reply->delete();
        $post->decrementReplies();

        return response()->json(['message' => 'Reply deleted successfully']);
    }

    /**
     * Like/Unlike a reply
     */
    public function toggleReplyLike($postId, $replyId)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $reply = PostReply::where('wall_post_id', $postId)->findOrFail($replyId);
        $liked = $reply->toggleLike($user->id);

        // Create notification if liked and not own reply
        if ($liked && $reply->user_id !== $user->id) {
            WallNotification::create([
                'user_id' => $reply->user_id,
                'actor_id' => $user->id,
                'type' => 'reply_like',
                'wall_post_id' => $postId,
                'wall_post_reply_id' => $reply->id,
            ]);
        }

        // Delete notification if unliked
        if (!$liked) {
            WallNotification::where('user_id', $reply->user_id)
                ->where('actor_id', $user->id)
                ->where('type', 'reply_like')
                ->where('wall_post_reply_id', $reply->id)
                ->delete();
        }

        return response()->json([
            'message' => $liked ? 'Reply liked' : 'Reply unliked',
            'liked' => $liked,
            'likes_count' => $reply->fresh()->likes_count
        ]);
    }

    /**
     * Track post view
     */
    public function trackView($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $post = WallPost::findOrFail($id);
        $post->increment('views_count');

        return response()->json([
            'message' => 'View tracked',
            'views_count' => $post->views_count
        ]);
    }
}

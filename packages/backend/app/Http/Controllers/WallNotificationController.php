<?php

namespace App\Http\Controllers;

use App\Models\WallNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WallNotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $notifications = WallNotification::where('user_id', $user->id)
            ->with(['actor', 'post', 'reply'])
            ->recent()
            ->paginate($request->get('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $count = WallNotification::where('user_id', $user->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $notification = WallNotification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        WallNotification::where('user_id', $user->id)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $user = Auth::user();

        if ($user->usertype !== 'agent') {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $notification = WallNotification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}

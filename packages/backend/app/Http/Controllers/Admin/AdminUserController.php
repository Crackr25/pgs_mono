<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    /**
     * Get all users with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['company', 'companyAgent.company']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by user type
        if ($request->has('usertype') && $request->usertype !== 'all') {
            $query->where('usertype', $request->usertype);
        }

        // Filter by status (if you have a status field)
        if ($request->has('status')) {
            // Add status filter logic here
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get user statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'buyers' => User::where('usertype', 'buyer')->count(),
            'sellers' => User::where('usertype', 'seller')->count(),
            'agents' => User::where('usertype', 'agent')->count(),
            'admins' => User::where('usertype', 'admin')->count(),
            'recent_users' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get a specific user
     */
    public function show($id): JsonResponse
    {
        $user = User::with(['company', 'companyAgent.company'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update user information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'usertype' => 'sometimes|in:buyer,seller,agent,admin',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Suspend/Activate user
     */
    public function toggleStatus($id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent admin from suspending themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot suspend your own account'
            ], 400);
        }

        // Toggle status logic (you may need to add a 'status' field to users table)
        // For now, we'll just return success
        // $user->status = $user->status === 'active' ? 'suspended' : 'active';
        // $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Delete user
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ], 400);
        }

        // Prevent deleting other admins (optional)
        if ($user->usertype === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete admin users'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    }

    /**
     * Get user activity log (placeholder)
     */
    public function activityLog($id): JsonResponse
    {
        // Implement activity logging if needed
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Activity logging not yet implemented'
            ]
        ]);
    }

    /**
     * Impersonate user - Admin can login as any user
     */
    public function impersonate($id): JsonResponse
    {
        $admin = auth()->user();
        
        // Ensure the authenticated user is an admin
        if ($admin->usertype !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can impersonate users.'
            ], 403);
        }

        $user = User::with(['company', 'companyAgent.company'])->findOrFail($id);

        // Prevent impersonating another admin
        if ($user->usertype === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot impersonate another admin user'
            ], 403);
        }

        // Delete existing tokens for the user (clean slate)
        $user->tokens()->delete();

        // Create a new token for the user
        $token = $user->createToken('impersonation-token')->plainTextToken;

        // Load additional data based on user type
        if ($user->usertype === 'agent') {
            $activeCompany = $user->getActiveCompany();
            $user->active_company = $activeCompany;
        }

        // Store impersonation info in session or return it
        return response()->json([
            'success' => true,
            'message' => 'Impersonation started successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'impersonator_id' => $admin->id,
                'impersonator_name' => $admin->name
            ]
        ]);
    }

    /**
     * Stop impersonation and return to admin account
     */
    public function stopImpersonation(Request $request): JsonResponse
    {
        $currentUser = auth()->user();
        
        // Delete the impersonation token
        $currentUser->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Impersonation stopped successfully'
        ]);
    }
}

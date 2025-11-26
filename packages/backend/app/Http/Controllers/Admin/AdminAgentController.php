<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CompanyAgent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminAgentController extends Controller
{
    /**
     * Get all agents with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->whereHas('companyAgent')
            ->with(['companyAgent.company']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by company
        if ($request->has('company_id')) {
            $query->whereHas('companyAgent', function($q) use ($request) {
                $q->where('company_id', $request->company_id);
            });
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '' && $request->is_active !== 'undefined') {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('companyAgent', function($q) use ($isActive) {
                $q->where('is_active', $isActive);
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $agents = $query->paginate($perPage);

        return response()->json($agents);
    }

    /**
     * Get agent statistics
     */
    public function statistics(): JsonResponse
    {
        $totalAgents = User::whereHas('companyAgent')->count();
        
        $activeAgents = CompanyAgent::where('is_active', true)
            ->whereNotNull('joined_at')
            ->count();
        
        $pendingAgents = CompanyAgent::whereNull('joined_at')->count();
        
        $inactiveAgents = CompanyAgent::where('is_active', false)->count();

        $stats = [
            'total_agents' => $totalAgents,
            'active_agents' => $activeAgents,
            'pending_agents' => $pendingAgents,
            'inactive_agents' => $inactiveAgents,
            'recent_agents' => User::whereHas('companyAgent')
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get a specific agent
     */
    public function show($id): JsonResponse
    {
        $agent = User::whereHas('companyAgent')
            ->with(['companyAgent.company'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $agent
        ]);
    }

    /**
     * Update agent information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $agent = User::whereHas('companyAgent')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
        ]);

        $agent->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agent updated successfully',
            'data' => $agent->fresh()
        ]);
    }

    /**
     * Delete agent
     */
    public function destroy($id): JsonResponse
    {
        $agent = User::whereHas('companyAgent')->findOrFail($id);

        // Delete associated company agent records
        CompanyAgent::where('user_id', $id)->delete();

        $agent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agent deleted successfully'
        ]);
    }

    /**
     * Toggle agent active status
     */
    public function toggleStatus($id): JsonResponse
    {
        $agent = User::whereHas('companyAgent')->findOrFail($id);
        
        $companyAgent = CompanyAgent::where('user_id', $id)->first();
        
        if (!$companyAgent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent is not associated with any company'
            ], 400);
        }

        $companyAgent->is_active = !$companyAgent->is_active;
        $companyAgent->save();

        return response()->json([
            'success' => true,
            'message' => 'Agent status updated successfully',
            'data' => [
                'agent' => $agent,
                'is_active' => $companyAgent->is_active
            ]
        ]);
    }

    /**
     * Update agent permissions
     */
    public function updatePermissions(Request $request, $id): JsonResponse
    {
        $agent = User::whereHas('companyAgent')->findOrFail($id);
        
        $companyAgent = CompanyAgent::where('user_id', $id)->first();
        
        if (!$companyAgent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent is not associated with any company'
            ], 400);
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'role' => 'sometimes|string|max:255',
        ]);

        $companyAgent->permissions = $validated['permissions'];
        
        if (isset($validated['role'])) {
            $companyAgent->role = $validated['role'];
        }
        
        $companyAgent->save();

        return response()->json([
            'success' => true,
            'message' => 'Agent permissions updated successfully',
            'data' => $companyAgent
        ]);
    }

    /**
     * Get pending agent invitations
     */
    public function pendingInvitations(): JsonResponse
    {
        $pendingAgents = CompanyAgent::with(['user', 'company'])
            ->whereNull('joined_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($pendingAgents);
    }

    /**
     * Get agent activity log
     */
    public function activity($id): JsonResponse
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
     * Resend agent invitation
     */
    public function resendInvitation($id): JsonResponse
    {
        $companyAgent = CompanyAgent::with(['user', 'company'])->findOrFail($id);

        if ($companyAgent->joined_at) {
            return response()->json([
                'success' => false,
                'message' => 'Agent has already accepted the invitation'
            ], 400);
        }

        // TODO: Implement email sending logic here
        // Mail::to($companyAgent->user->email)->send(new AgentInvitation($companyAgent));

        return response()->json([
            'success' => true,
            'message' => 'Invitation resent successfully'
        ]);
    }
}

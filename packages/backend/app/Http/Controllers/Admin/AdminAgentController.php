<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CompanyAgent;
use App\Mail\AgentInvitation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

    /**
     * Create agent invitation (Admin creates invitation for a company)
     */
    public function createInvitation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'role' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'send_invitation' => 'boolean'
        ]);

        // Check if user already exists
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // Create new user with temporary password
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(12)), // Temporary password
                'usertype' => 'agent',
            ]);
        } else {
            // Check if user is already an agent for this company
            $existingAgent = CompanyAgent::where('user_id', $user->id)
                ->where('company_id', $validated['company_id'])
                ->first();

            if ($existingAgent) {
                return response()->json([
                    'success' => false,
                    'message' => 'This user is already an agent for this company'
                ], 400);
            }

            // Update usertype to agent if not already
            if ($user->usertype !== 'agent') {
                $user->usertype = 'agent';
                $user->save();
            }
        }

        // Create company agent record
        $companyAgent = CompanyAgent::create([
            'company_id' => $validated['company_id'],
            'user_id' => $user->id,
            'role' => $validated['role'] ?? 'Agent',
            'permissions' => $validated['permissions'] ?? [],
            'is_active' => true,
            'invited_by' => auth()->id(),
        ]);

        // Generate invitation token
        $token = $companyAgent->generateInvitationToken();

        // Send invitation email if requested
        $emailSent = null;
        if ($request->get('send_invitation', true)) {
            try {
                Mail::to($user->email)->send(new AgentInvitation($companyAgent, $token));
                $emailSent = true;
            } catch (\Exception $e) {
                // Log the error but don't fail the invitation creation
                \Log::error('Failed to send agent invitation email: ' . $e->getMessage());
                $emailSent = false;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Agent invitation created successfully',
            'data' => $companyAgent->load(['user', 'company']),
            'invitation_token' => $token,
            'email_sent' => $emailSent,
            'email_status' => $emailSent === true ? 'sent' : ($emailSent === false ? 'failed' : 'not_requested')
        ], 201);
    }

    /**
     * Change agent's company
     */
    public function changeCompany(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'role' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $agent = User::whereHas('companyAgent')->findOrFail($id);
        
        $companyAgent = CompanyAgent::where('user_id', $id)->first();
        
        if (!$companyAgent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent is not associated with any company'
            ], 400);
        }

        // Check if agent is already assigned to the new company
        $existingAssignment = CompanyAgent::where('user_id', $id)
            ->where('company_id', $validated['company_id'])
            ->where('id', '!=', $companyAgent->id)
            ->first();

        if ($existingAssignment) {
            return response()->json([
                'success' => false,
                'message' => 'Agent is already assigned to this company'
            ], 400);
        }

        $oldCompanyId = $companyAgent->company_id;

        // Update company assignment
        $companyAgent->company_id = $validated['company_id'];
        
        if (isset($validated['role'])) {
            $companyAgent->role = $validated['role'];
        }
        
        if (isset($validated['permissions'])) {
            $companyAgent->permissions = $validated['permissions'];
        }

        $companyAgent->save();

        return response()->json([
            'success' => true,
            'message' => 'Agent company changed successfully',
            'data' => [
                'agent' => $companyAgent->load(['user', 'company']),
                'old_company_id' => $oldCompanyId,
                'new_company_id' => $validated['company_id']
            ]
        ]);
    }
}

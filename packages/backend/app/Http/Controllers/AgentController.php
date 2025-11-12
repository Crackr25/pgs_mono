<?php

namespace App\Http\Controllers;

use App\Models\CompanyAgent;
use App\Models\User;
use App\Models\Company;
use App\Mail\AgentInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AgentController extends Controller
{
    /**
     * Get all agents for the authenticated seller's company.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
    
        
        $company = $user->company;


        if (!$company) {
            return response()->json([
                'error' => 'Company not found', 
                'debug' => [
                    'user_id' => $user->id,
                    'user_company_id' => $user->company_id ?? 'null'
                ]
            ], 404);
        }

        // First, let's check if we have any agents at all
        $totalAgents = $company->companyAgents()->count();
        $agentsWithUsers = $company->companyAgents()->whereHas('user')->count();
        
        if ($totalAgents > 0 && $agentsWithUsers === 0) {
            return response()->json([
                'error' => 'Data integrity issue: agents exist but no valid user relationships found',
                'debug' => [
                    'total_agents' => $totalAgents,
                    'agents_with_users' => $agentsWithUsers
                ]
            ], 500);
        }
        
        $query = $company->companyAgents()->with('user');

        // Filter by status
        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'pending':
                    $query->pending();
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
            }
        }

        // Filter by role
        // if ($request->has('role')) {
        //     $query->byRole($request->role);
        // }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $agents = $query->paginate($request->get('per_page', 15));

        return response()->json($agents);
    }

    /**
     * Create a new agent invitation.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:customer_service,sales,manager,custom',
            'permissions' => 'nullable|array',
            'send_invitation' => 'boolean'
        ]);

        // Create user account for the agent
        $agentUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(Str::random(12)), // Temporary password
            'usertype' => 'agent'
        ]);

        // Create company agent record
        $companyAgent = CompanyAgent::create([
            'company_id' => $company->id,
            'user_id' => $agentUser->id,
            'role' => $request->role,
            'permissions' => $request->permissions,
            'is_active' => true
        ]);

        // Generate invitation token
        $token = $companyAgent->generateInvitationToken();

        // Send invitation email if requested
        if ($request->get('send_invitation', true)) {
            try {
                Mail::to($agentUser->email)->send(new AgentInvitation($companyAgent, $token));
                $emailSent = true;
            } catch (\Exception $e) {
                // Log the error but don't fail the invitation creation
                \Log::error('Failed to send agent invitation email: ' . $e->getMessage());
                $emailSent = false;
            }
        } else {
            $emailSent = null; // Email sending was not requested
        }

        return response()->json([
            'message' => 'Agent invitation created successfully',
            'agent' => $companyAgent->load('user'),
            'invitation_token' => $token,
            'email_sent' => $emailSent,
            'email_status' => $emailSent === true ? 'sent' : ($emailSent === false ? 'failed' : 'not_requested')
        ], 201);
    }

    /**
     * Get a specific agent.
     */
    public function show($id)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $agent = $company->companyAgents()->with('user')->findOrFail($id);

        return response()->json($agent);
    }

    /**
     * Update an agent's details.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $agent = $company->companyAgents()->findOrFail($id);

        $request->validate([
            'role' => 'sometimes|in:customer_service,sales,manager,custom',
            'permissions' => 'nullable|array',
            'is_active' => 'sometimes|boolean'
        ]);

        $agent->update($request->only(['role', 'permissions', 'is_active']));

        return response()->json([
            'message' => 'Agent updated successfully',
            'agent' => $agent->load('user')
        ]);
    }

    /**
     * Remove an agent.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $agent = $company->companyAgents()->findOrFail($id);
        
        // Unassign any conversations assigned to this agent
        $agent->assignedConversations()->update(['assigned_agent_id' => null]);
        
        $agent->delete();

        return response()->json(['message' => 'Agent removed successfully']);
    }

    /**
     * Accept an agent invitation.
     */
    public function acceptInvitation(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $agent = CompanyAgent::where('invitation_token', $request->token)->first();

        if (!$agent) {
            return response()->json(['error' => 'Invalid invitation token'], 404);
        }

        // Update user password
        $agent->user->update([
            'password' => Hash::make($request->password)
        ]);

        // Accept invitation
        $agent->acceptInvitation();

        return response()->json([
            'message' => 'Invitation accepted successfully',
            'agent' => $agent->load('user', 'company')
        ]);
    }

    /**
     * Get agent statistics for the company.
     */
    public function statistics()
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $stats = [
            'total_agents' => $company->companyAgents()->count(),
            'active_agents' => $company->companyAgents()->active()->count(),
            'pending_invitations' => $company->companyAgents()->pending()->count(),
            'agents_by_role' => $company->companyAgents()
                ->selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role'),
            'recent_activity' => $company->companyAgents()
                ->with('user')
                ->latest('updated_at')
                ->limit(5)
                ->get()
        ];

        return response()->json($stats);
    }

    /**
     * Assign a conversation to an agent.
     */
    public function assignConversation(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'agent_id' => 'required|exists:users,id'
        ]);

        // Verify the agent belongs to this company
        $agent = $company->companyAgents()->where('user_id', $request->agent_id)->first();
        if (!$agent || !$agent->isActive()) {
            return response()->json(['error' => 'Invalid or inactive agent'], 400);
        }

        // Update conversation assignment
        $conversation = \App\Models\Conversation::findOrFail($request->conversation_id);
        $conversation->update([
            'assigned_agent_id' => $request->agent_id,
            'assigned_at' => now(),
            'assignment_type' => 'manual'
        ]);

        return response()->json([
            'message' => 'Conversation assigned successfully',
            'conversation' => $conversation->load('assignedAgent')
        ]);
    }

    /**
     * Get available roles and their permissions.
     */
    public function getRoles()
    {
        return response()->json([
            'roles' => CompanyAgent::$rolePermissions
        ]);
    }
}

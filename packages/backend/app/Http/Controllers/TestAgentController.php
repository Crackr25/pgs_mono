<?php

namespace App\Http\Controllers;

use App\Models\CompanyAgent;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestAgentController extends Controller
{
    /**
     * Create a test agent with a known invitation token for testing purposes.
     */
    public function createTestAgent(Request $request)
    {
        // Only allow in development/testing environment
        if (app()->environment('production')) {
            return response()->json(['error' => 'Not available in production'], 403);
        }

        try {
            // Find a company to attach the agent to (use first available company)
            $company = Company::first();
            
            if (!$company) {
                return response()->json(['error' => 'No company found. Please create a company first.'], 404);
            }

            // Create a test user for the agent
            $testEmail = 'test.agent.' . time() . '@example.com';
            $agentUser = User::create([
                'name' => 'Test Agent ' . time(),
                'email' => $testEmail,
                'password' => Hash::make('temporary123'), // Temporary password
                'usertype' => 'agent'
            ]);

            // Create company agent record
            $companyAgent = CompanyAgent::create([
                'company_id' => $company->id,
                'user_id' => $agentUser->id,
                'role' => 'customer_service',
                'is_active' => true
            ]);

            // Generate invitation token
            $token = $companyAgent->generateInvitationToken();

            return response()->json([
                'message' => 'Test agent created successfully',
                'agent' => [
                    'id' => $companyAgent->id,
                    'name' => $agentUser->name,
                    'email' => $agentUser->email,
                    'role' => $companyAgent->role,
                    'company' => $company->name
                ],
                'invitation_token' => $token,
                'invitation_url' => url("/agents/accept-invitation?token={$token}"),
                'test_instructions' => [
                    '1. Copy the invitation_token above',
                    '2. Go to /agents/test-invitation',
                    '3. Paste the token and test the invitation flow',
                    '4. Or directly visit the invitation_url'
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create test agent',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all pending invitations for testing.
     */
    public function getPendingInvitations()
    {
        // Only allow in development/testing environment
        if (app()->environment('production')) {
            return response()->json(['error' => 'Not available in production'], 403);
        }

        $pendingInvitations = CompanyAgent::with(['user', 'company'])
            ->whereNotNull('invitation_token')
            ->whereNull('joined_at')
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->user->name,
                    'email' => $agent->user->email,
                    'company' => $agent->company->name,
                    'role' => $agent->role,
                    'invitation_token' => $agent->invitation_token,
                    'invitation_url' => url("/agents/accept-invitation?token={$agent->invitation_token}"),
                    'invited_at' => $agent->invited_at
                ];
            });

        return response()->json([
            'pending_invitations' => $pendingInvitations,
            'count' => $pendingInvitations->count()
        ]);
    }

    /**
     * Clean up test agents.
     */
    public function cleanupTestAgents()
    {
        // Only allow in development/testing environment
        if (app()->environment('production')) {
            return response()->json(['error' => 'Not available in production'], 403);
        }

        try {
            // Delete test agents (users with email containing 'test.agent')
            $testUsers = User::where('email', 'like', 'test.agent%')->get();
            $deletedCount = 0;

            foreach ($testUsers as $user) {
                // Delete associated company agent records
                CompanyAgent::where('user_id', $user->id)->delete();
                // Delete the user
                $user->delete();
                $deletedCount++;
            }

            return response()->json([
                'message' => "Cleaned up {$deletedCount} test agents"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to cleanup test agents',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

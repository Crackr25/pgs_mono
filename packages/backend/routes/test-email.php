<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\AgentInvitation;
use App\Models\CompanyAgent;

/*
|--------------------------------------------------------------------------
| Email Testing Routes
|--------------------------------------------------------------------------
|
| These routes are for testing email functionality during development.
| Remove or comment out these routes in production.
|
*/

Route::get('/test-agent-invitation-email/{agentId}', function ($agentId) {
    try {
        $companyAgent = CompanyAgent::with(['user', 'company'])->findOrFail($agentId);
        $token = 'test-token-' . time();
        
        Mail::to($companyAgent->user->email)->send(new AgentInvitation($companyAgent, $token));
        
        return response()->json([
            'message' => 'Test agent invitation email sent successfully',
            'sent_to' => $companyAgent->user->email,
            'company' => $companyAgent->company->company_name,
            'agent_name' => $companyAgent->user->name
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to send test email',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/preview-agent-invitation-email/{agentId}', function ($agentId) {
    try {
        $companyAgent = CompanyAgent::with(['user', 'company'])->findOrFail($agentId);
        $token = 'preview-token-' . time();
        
        $mailable = new AgentInvitation($companyAgent, $token);
        
        return $mailable->render();
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to preview email',
            'message' => $e->getMessage()
        ], 500);
    }
});

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Pusher\Pusher;

class BroadcastingAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        try {
            // Validate required parameters
            $request->validate([
                'socket_id' => 'required|string',
                'channel_name' => 'required|string'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $socketId = $request->input('socket_id');
            $channelName = $request->input('channel_name');

            // Log for debugging
            \Log::info('Broadcasting auth request', [
                'user_id' => $user->id,
                'user_type' => $user->usertype,
                'socket_id' => $socketId,
                'channel_name' => $channelName
            ]);

            // Additional debug info for agents
            if ($user->usertype === 'agent') {
                $companyAgent = $user->companyAgent;
                \Log::info('Agent debug info', [
                    'has_company_agent' => $companyAgent ? 'yes' : 'no',
                    'company_id' => $companyAgent ? $companyAgent->company_id : 'none',
                    'company_user_id' => $companyAgent && $companyAgent->company ? $companyAgent->company->user_id : 'none'
                ]);
            }

            // Check if user can access this channel
            if (!$this->canAccessChannel($user, $channelName)) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            // Create Pusher instance
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                config('broadcasting.connections.pusher.options')
            );

            // Generate auth signature
            $auth = $pusher->socket_auth($channelName, $socketId);

            // Return the auth data
            return response()->json(json_decode($auth, true));

        } catch (\Exception $e) {
            \Log::error('Broadcasting auth error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    private function canAccessChannel($user, $channelName)
    {
        // Parse channel name to determine access
        if (strpos($channelName, 'private-user.') === 0) {
            $userId = str_replace('private-user.', '', $channelName);
            return (int) $user->id === (int) $userId;
        }

        if (strpos($channelName, 'private-conversation.') === 0) {
            $conversationId = str_replace('private-conversation.', '', $channelName);
            
            // Check if user can access this conversation
            $conversation = \App\Models\Conversation::find($conversationId);
            
            \Log::info('Conversation access check', [
                'conversation_id' => $conversationId,
                'conversation_exists' => $conversation ? 'yes' : 'no',
                'user_type' => $user->usertype
            ]);
            
            if (!$conversation) {
                \Log::info('Conversation not found', ['conversation_id' => $conversationId]);
                return false;
            }

            // Log conversation details
            \Log::info('Conversation details', [
                'seller_id' => $conversation->seller_id,
                'buyer_id' => $conversation->buyer_id,
                'assigned_agent_id' => $conversation->assigned_agent_id
            ]);

            // Check access based on user type
            if ($user->usertype === 'agent') {
                // Agents can access conversations assigned to them OR unassigned conversations for their company
                $companyAgent = $user->companyAgent;
                if ($companyAgent) {
                    $hasAccess = $conversation->assigned_agent_id === $user->id ||
                           ($conversation->seller_id === $companyAgent->company->user_id && !$conversation->assigned_agent_id);
                    
                    \Log::info('Agent access check result', [
                        'has_access' => $hasAccess ? 'yes' : 'no',
                        'assigned_to_agent' => $conversation->assigned_agent_id === $user->id ? 'yes' : 'no',
                        'unassigned_company_conversation' => ($conversation->seller_id === $companyAgent->company->user_id && !$conversation->assigned_agent_id) ? 'yes' : 'no'
                    ]);
                    
                    return $hasAccess;
                }
                \Log::info('Agent has no company agent relationship');
                return false;
            } else {
                // Sellers and buyers use existing logic
                $hasAccess = $conversation->seller_id === $user->id || $conversation->buyer_id === $user->id;
                \Log::info('Seller/Buyer access check result', ['has_access' => $hasAccess ? 'yes' : 'no']);
                return $hasAccess;
            }
        }

        return false;
    }
}

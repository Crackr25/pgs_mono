<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Chat channels
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \App\Models\Conversation::where('id', $conversationId)
        ->where(function ($query) use ($user) {
            if ($user->usertype === 'agent') {
                // Agents can access conversations assigned to them OR unassigned conversations for their company
                $companyAgent = $user->companyAgent;
                if ($companyAgent) {
                    $query->where('assigned_agent_id', $user->id)
                          ->orWhere(function($q) use ($companyAgent) {
                              $q->where('seller_id', $companyAgent->company->user_id)
                                ->whereNull('assigned_agent_id');
                          });
                }
            } else {
                // Sellers and buyers use existing logic
                $query->where('seller_id', $user->id)
                      ->orWhere('buyer_id', $user->id);
            }
        })
        ->exists();
});

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatMessage;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatMessage $chatMessage)
    {
        $this->chatMessage = $chatMessage;
        
        // Log for debugging
        \Log::info('MessageSent event created', [
            'message_id' => $chatMessage->id,
            'conversation_id' => $chatMessage->conversation_id,
            'sender_id' => $chatMessage->sender_id,
            'receiver_id' => $chatMessage->receiver_id
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->chatMessage->conversation_id),
            new PrivateChannel('user.' . $this->chatMessage->receiver_id)
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chatMessage->id,
            'conversation_id' => $this->chatMessage->conversation_id,
            'sender_id' => $this->chatMessage->sender_id,
            'receiver_id' => $this->chatMessage->receiver_id,
            'message' => $this->chatMessage->message,
            'created_at' => $this->chatMessage->created_at->toISOString(),
            'read' => $this->chatMessage->read,
            'sender' => [
                'id' => $this->chatMessage->sender->id,
                'name' => $this->chatMessage->sender->name,
                'email' => $this->chatMessage->sender->email
            ]
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}

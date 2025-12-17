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
            new PrivateChannel('user.' . $this->chatMessage->receiver_id),
            new PrivateChannel('user.' . $this->chatMessage->sender_id) // Add sender channel
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $messageData = [
            'id' => $this->chatMessage->id,
            'conversation_id' => $this->chatMessage->conversation_id,
            'sender_id' => $this->chatMessage->sender_id,
            'receiver_id' => $this->chatMessage->receiver_id,
            'message' => $this->chatMessage->message,
            'message_type' => $this->chatMessage->message_type,
            'product_id' => $this->chatMessage->product_id,
            'product_context' => $this->chatMessage->product_context,
            'created_at' => $this->chatMessage->created_at->toISOString(),
            'read' => $this->chatMessage->read,
            'sender' => [
                'id' => $this->chatMessage->sender->id,
                'name' => $this->chatMessage->sender->name,
                'email' => $this->chatMessage->sender->email
            ]
        ];

        // Include payment link fields if this is a payment link message
        if ($this->chatMessage->message_type === 'payment_link') {
            $messageData['payment_link_id'] = $this->chatMessage->payment_link_id;
            $messageData['payment_amount'] = $this->chatMessage->payment_amount;
            $messageData['payment_currency'] = $this->chatMessage->payment_currency;
            $messageData['payment_description'] = $this->chatMessage->payment_description;
            $messageData['payment_status'] = $this->chatMessage->payment_status;
            $messageData['payment_expires_at'] = $this->chatMessage->payment_expires_at ? $this->chatMessage->payment_expires_at->toISOString() : null;
            $messageData['payment_paid_at'] = $this->chatMessage->payment_paid_at ? $this->chatMessage->payment_paid_at->toISOString() : null;
        }

        return [
            'message' => $messageData
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

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conversation;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Hash;

class ChatTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users if they don't exist

        // Create a test conversation
        $conversation = Conversation::firstOrCreate(
            [
                'seller_id' => 5,
                'buyer_id' => 1,
            ],
            [
                'status' => 'active',
                'last_message_at' => now(),
            ]
        );

        // Create some test messages
        $messages = [
            [
                'sender_id' => 1,
                'receiver_id' => 5,
                'message' => 'Hello! I\'m interested in your products.',
            ],
            [
                'sender_id' => 5,
                'receiver_id' => 1,
                'message' => 'Hi there! Thank you for your interest. Which products are you looking for?',
            ],
            [
                'sender_id' => 1,
                'receiver_id' => 5,
                'message' => 'I need bulk electronics for my retail store. Can you provide a quote?',
            ],
            [
                'sender_id' => 5,
                'receiver_id' => 1,
                'message' => 'Absolutely! I can provide competitive pricing for bulk orders. What specific electronics are you interested in?',
            ],
        ];

        foreach ($messages as $index => $messageData) {
            ChatMessage::firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $messageData['sender_id'],
                    'message' => $messageData['message'],
                ],
                [
                    'receiver_id' => $messageData['receiver_id'],
                    'read' => $index < 2, // Mark first 2 messages as read
                    'created_at' => now()->subMinutes(10 - $index * 2),
                ]
            );
        }


    }
}

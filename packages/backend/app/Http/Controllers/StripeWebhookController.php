<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(Request $request)
    {
        // Verify webhook signature
        $endpoint_secret = config('services.stripe.webhook_secret');
        
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, 
                $sig_header, 
                $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Stripe webhook invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe webhook invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;
            
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            
            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;
            
            default:
                Log::info('Unhandled Stripe webhook event: ' . $event->type);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Handle successful checkout session
     */
    private function handleCheckoutSessionCompleted($session)
    {
        Log::info('Checkout session completed', ['session' => $session]);

        $paymentLinkId = $session->client_reference_id ?? $session->metadata->payment_link_id ?? null;
        
        if (!$paymentLinkId) {
            Log::error('No payment_link_id found in checkout session');
            return;
        }

        $this->updatePaymentStatus($paymentLinkId, 'paid');
    }

    /**
     * Handle successful payment intent
     */
    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Payment intent succeeded', ['payment_intent' => $paymentIntent->id]);

        $paymentLinkId = $paymentIntent->metadata->payment_link_id ?? null;
        
        if (!$paymentLinkId) {
            Log::error('No payment_link_id found in payment intent');
            return;
        }

        $this->updatePaymentStatus($paymentLinkId, 'paid');
    }

    /**
     * Handle failed payment intent
     */
    private function handlePaymentIntentFailed($paymentIntent)
    {
        Log::info('Payment intent failed', ['payment_intent' => $paymentIntent->id]);

        $paymentLinkId = $paymentIntent->metadata->payment_link_id ?? null;
        
        if (!$paymentLinkId) {
            Log::error('No payment_link_id found in payment intent');
            return;
        }

        // Optionally update status to failed
        // $this->updatePaymentStatus($paymentLinkId, 'failed');
    }

    /**
     * Update payment link status and send confirmation
     */
    private function updatePaymentStatus($paymentLinkId, $status)
    {
        $message = ChatMessage::where('payment_link_id', $paymentLinkId)->first();

        if (!$message) {
            Log::error('Payment link message not found', ['payment_link_id' => $paymentLinkId]);
            return;
        }

        // Check if already processed
        if ($message->payment_status === 'paid') {
            Log::info('Payment already processed', ['payment_link_id' => $paymentLinkId]);
            return;
        }

        // Update message status
        $message->update([
            'payment_status' => $status,
            'payment_paid_at' => now()
        ]);

        Log::info('Payment status updated', [
            'payment_link_id' => $paymentLinkId,
            'status' => $status
        ]);

        // Send confirmation message
        $confirmationMessage = ChatMessage::create([
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'message' => "✅ Payment Received\n\nThank you! Your payment of " . $message->payment_currency . " " . number_format($message->payment_amount, 2) . " has been successfully processed.",
            'message_type' => 'text'
        ]);

        $confirmationMessage->load('sender', 'receiver');
        broadcast(new MessageSent($confirmationMessage));

        Log::info('Payment confirmation message sent', [
            'payment_link_id' => $paymentLinkId,
            'confirmation_message_id' => $confirmationMessage->id
        ]);
    }
}

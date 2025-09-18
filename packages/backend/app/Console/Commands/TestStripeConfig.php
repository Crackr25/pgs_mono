<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestStripeConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:stripe-config';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Stripe configuration from environment variables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Stripe Configuration...');
        $this->newLine();

        // Test STRIPE_SECRET
        $stripeSecret = env('STRIPE_SECRET');
        $this->info('STRIPE_SECRET:');
        if ($stripeSecret) {
            $this->line('  ✓ Set (length: ' . strlen($stripeSecret) . ')');
            $this->line('  ✓ Starts with: ' . substr($stripeSecret, 0, 7) . '...');
            $this->line('  ✓ Format valid: ' . (str_starts_with($stripeSecret, 'sk_') ? 'YES' : 'NO'));
        } else {
            $this->error('  ✗ Not set or empty');
        }

        $this->newLine();

        // Test STRIPE_PUBLISHABLE
        $stripePublishable = env('STRIPE_PUBLISHABLE');
        $this->info('STRIPE_PUBLISHABLE:');
        if ($stripePublishable) {
            $this->line('  ✓ Set (length: ' . strlen($stripePublishable) . ')');
            $this->line('  ✓ Starts with: ' . substr($stripePublishable, 0, 7) . '...');
            $this->line('  ✓ Format valid: ' . (str_starts_with($stripePublishable, 'pk_') ? 'YES' : 'NO'));
        } else {
            $this->error('  ✗ Not set or empty');
        }

        $this->newLine();

        // Test other Stripe configs
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');
        $paymentWebhookSecret = env('STRIPE_PAYMENT_WEBHOOK_SECRET');

        $this->info('STRIPE_WEBHOOK_SECRET: ' . ($webhookSecret ? '✓ Set' : '✗ Not set'));
        $this->info('STRIPE_PAYMENT_WEBHOOK_SECRET: ' . ($paymentWebhookSecret ? '✓ Set' : '✗ Not set'));

        $this->newLine();

        // Test if we can initialize Stripe
        try {
            if ($stripeSecret && str_starts_with($stripeSecret, 'sk_')) {
                \Stripe\Stripe::setApiKey($stripeSecret);
                $this->info('✓ Stripe API key successfully set');
                
                // Try a simple API call
                $balance = \Stripe\Balance::retrieve();
                $this->info('✓ Stripe API connection successful');
                $this->line('  Available balance: $' . ($balance->available[0]->amount / 100));
            } else {
                $this->error('✗ Cannot test Stripe API - invalid key format');
            }
        } catch (\Exception $e) {
            $this->error('✗ Stripe API test failed: ' . $e->getMessage());
        }

        return 0;
    }
}

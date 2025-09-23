<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seller_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            
            // Financial Details
            $table->decimal('gross_amount', 10, 2); // Order total amount
            $table->decimal('platform_fee', 10, 2); // Platform commission
            $table->decimal('net_amount', 10, 2); // Amount to pay seller
            $table->string('currency', 3)->default('USD');
            $table->decimal('platform_fee_percentage', 5, 2)->default(2.50); // Store fee percentage used
            
            // Payout Method & Status
            $table->enum('payout_method', ['stripe', 'manual'])->default('stripe');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            
            // Stripe Integration Fields
            $table->string('stripe_transfer_id')->nullable(); // Stripe transfer ID
            $table->string('stripe_payout_id')->nullable(); // Stripe payout ID
            $table->json('stripe_response')->nullable(); // Full Stripe response
            
            // Manual Payout Tracking
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('manual_reference')->nullable(); // Wire transfer reference
            $table->text('manual_notes')->nullable(); // Admin notes
            $table->json('manual_details')->nullable(); // Bank details, etc.
            
            // Timestamps
            $table->timestamp('processed_at')->nullable(); // When payout was completed
            $table->timestamp('failed_at')->nullable(); // When payout failed
            $table->text('failure_reason')->nullable(); // Why payout failed
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['company_id', 'status']);
            $table->index(['order_id']);
            $table->index(['status', 'payout_method']);
            $table->index(['created_at']);
            $table->index(['processed_at']);
            
            // Ensure one payout per order
            $table->unique(['order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_payouts');
    }
};

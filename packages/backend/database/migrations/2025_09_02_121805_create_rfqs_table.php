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
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->integer('quantity');
            $table->string('unit');
            $table->decimal('budget_min', 12, 2);
            $table->decimal('budget_max', 12, 2);
            $table->string('delivery_location');
            $table->date('delivery_date');
            $table->json('specifications')->nullable();
            $table->json('attachments')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('payment_terms')->nullable();
            $table->integer('validity_days')->default(30);
            $table->timestamp('expires_at');
            $table->enum('status', ['draft', 'published', 'closed', 'expired'])->default('draft');
            $table->integer('quote_count')->default(0);
            $table->timestamps();
            
            $table->index(['buyer_id', 'status']);
            $table->index(['category', 'status']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfqs');
    }
};

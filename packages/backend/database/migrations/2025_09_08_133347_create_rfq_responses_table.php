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
        Schema::create('rfq_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained('rfqs')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('users')->onDelete('cascade');
            $table->string('supplier_company_name');
            $table->decimal('quoted_price', 12, 2);
            $table->integer('lead_time_days')->nullable();
            $table->text('message')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])->default('pending');
            $table->decimal('supplier_rating', 3, 2)->nullable();
            $table->integer('total_orders')->default(0);
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
            
            // Indexes
            $table->index(['rfq_id', 'status']);
            $table->index(['supplier_id', 'submitted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfq_responses');
    }
};

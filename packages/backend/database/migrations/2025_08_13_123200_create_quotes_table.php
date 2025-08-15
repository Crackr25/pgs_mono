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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('buyer_company')->nullable();
            $table->integer('quantity');
            $table->decimal('target_price', 10, 2)->nullable();
            $table->date('deadline');
            $table->enum('status', ['pending', 'responded', 'accepted', 'rejected', 'expired'])->default('pending');
            $table->text('message');
            $table->text('response_message')->nullable();
            $table->decimal('quoted_price', 10, 2)->nullable();
            $table->string('quoted_lead_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};

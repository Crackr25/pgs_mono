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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('sender_name');
            $table->string('sender_email');
            $table->string('sender_company')->nullable();
            $table->foreignId('recipient_company_id')->constrained('companies')->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->boolean('unread')->default(true);
            $table->enum('message_type', ['inquiry', 'quote_response', 'order_update', 'general'])->default('general');
            $table->foreignId('related_quote_id')->nullable()->constrained('quotes')->onDelete('set null');
            $table->foreignId('related_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};

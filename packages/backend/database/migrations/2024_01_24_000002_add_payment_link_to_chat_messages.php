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
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->string('payment_link_id')->nullable()->after('attachments');
            $table->decimal('payment_amount', 10, 2)->nullable()->after('payment_link_id');
            $table->string('payment_currency', 3)->default('USD')->after('payment_amount');
            $table->text('payment_description')->nullable()->after('payment_currency');
            $table->string('payment_status')->default('pending')->after('payment_description'); // pending, paid, expired, cancelled
            $table->timestamp('payment_expires_at')->nullable()->after('payment_status');
            $table->timestamp('payment_paid_at')->nullable()->after('payment_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropColumn([
                'payment_link_id',
                'payment_amount',
                'payment_currency',
                'payment_description',
                'payment_status',
                'payment_expires_at',
                'payment_paid_at'
            ]);
        });
    }
};

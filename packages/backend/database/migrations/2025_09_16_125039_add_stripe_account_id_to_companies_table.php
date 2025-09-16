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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('stripe_account_id')->nullable()->after('verified');
            $table->string('stripe_onboarding_status')->default('pending')->after('stripe_account_id');
            $table->timestamp('stripe_account_created_at')->nullable()->after('stripe_onboarding_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['stripe_account_id', 'stripe_onboarding_status', 'stripe_account_created_at']);
        });
    }
};

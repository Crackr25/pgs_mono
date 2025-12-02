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
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('email');
            $table->string('phone')->nullable()->after('profile_picture');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('country')->default('Philippines')->after('state');
            $table->string('postal_code')->nullable()->after('country');
            $table->text('bio')->nullable()->after('postal_code');
            $table->date('date_of_birth')->nullable()->after('bio');
            $table->string('company_name')->nullable()->after('date_of_birth');
            $table->string('job_title')->nullable()->after('company_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profile_picture',
                'phone',
                'address',
                'city',
                'state',
                'country',
                'postal_code',
                'bio',
                'date_of_birth',
                'company_name',
                'job_title'
            ]);
        });
    }
};

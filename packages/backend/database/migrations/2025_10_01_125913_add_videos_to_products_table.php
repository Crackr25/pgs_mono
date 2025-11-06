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
        Schema::table('products', function (Blueprint $table) {
            $table->json('videos')->nullable()->after('variants');
            $table->string('origin_country')->nullable()->after('hs_code');
            $table->string('brand_name')->nullable()->after('origin_country');
            $table->string('model_number')->nullable()->after('brand_name');
            $table->string('warranty')->nullable()->after('model_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['videos', 'origin_country', 'brand_name', 'model_number', 'warranty']);
        });
    }
};

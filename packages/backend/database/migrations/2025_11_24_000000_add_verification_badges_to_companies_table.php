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
            $table->string('certification_badge')->nullable()->after('verified');
            $table->string('certification_agency')->nullable()->after('certification_badge');
            $table->json('main_categories')->nullable()->after('product_lines');
            $table->string('leading_factory_rank')->nullable()->after('verified');
            $table->boolean('odm_services_available')->default(false)->after('verified');
            $table->string('manufacturer_type')->default('Custom Manufacturer')->after('name');
            $table->integer('years_in_business')->nullable()->after('year_established');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'certification_badge',
                'certification_agency',
                'main_categories',
                'leading_factory_rank',
                'odm_services_available',
                'manufacturer_type',
                'years_in_business'
            ]);
        });
    }
};

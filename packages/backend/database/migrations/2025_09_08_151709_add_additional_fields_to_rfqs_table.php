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
        Schema::table('rfqs', function (Blueprint $table) {
            $table->text('sample_requirements')->nullable()->after('validity_days');
            $table->string('supplier_location_preference')->default('any')->after('sample_requirements');
            $table->text('quality_standards')->nullable()->after('supplier_location_preference');
            $table->json('certifications_required')->nullable()->after('quality_standards');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rfqs', function (Blueprint $table) {
            $table->dropColumn([
                'sample_requirements',
                'supplier_location_preference', 
                'quality_standards',
                'certifications_required'
            ]);
        });
    }
};

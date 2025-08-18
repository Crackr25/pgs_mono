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
            // Document files (Step 2)
            $table->string('dti_sec_certificate')->nullable();
            $table->json('peza_documents')->nullable();
            $table->json('product_certifications')->nullable();
            $table->json('business_permits')->nullable();
            
            // KYC files (Step 3)
            $table->string('kyc_id_front')->nullable();
            $table->string('kyc_id_back')->nullable();
            $table->string('kyc_proof_address')->nullable();
            $table->string('kyc_business_registration')->nullable();
            
            // Factory tour files (Step 4)
            $table->string('factory_overview_video')->nullable();
            $table->json('production_line_photos')->nullable();
            $table->json('quality_control_photos')->nullable();
            $table->json('warehouse_photos')->nullable();
            $table->json('certifications_photos')->nullable();
            
            // Onboarding status tracking
            $table->enum('onboarding_step', ['profile', 'documents', 'kyc', 'factory_tour', 'completed'])->default('profile');
            $table->timestamp('onboarding_completed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'dti_sec_certificate',
                'peza_documents',
                'product_certifications',
                'business_permits',
                'owner_id_front',
                'owner_id_back',
                'proof_of_address',
                'business_registration_cert',
                'factory_overview_video',
                'production_line_photos',
                'quality_control_photos',
                'warehouse_photos',
                'certifications_photos',
                'onboarding_step',
                'onboarding_completed_at'
            ]);
        });
    }
};

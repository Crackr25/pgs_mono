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
        Schema::create('company_storefronts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained()->onDelete('cascade');
            $table->string('slug')->unique()->index();
            $table->foreignId('theme_id')->nullable()->constrained('storefront_themes')->onDelete('set null');
            
            // Branding
            $table->string('banner_image')->nullable();
            $table->string('tagline')->nullable();
            $table->text('about_us')->nullable();
            
            // Styling
            $table->string('primary_color')->default('#FF6600');
            $table->string('secondary_color')->default('#000000');
            $table->string('accent_color')->default('#333333');
            $table->string('font_family')->default('Inter');
            $table->enum('header_layout', ['centered', 'left', 'split'])->default('centered');
            $table->text('custom_css')->nullable();
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            
            // Settings
            $table->boolean('is_active')->default(true);
            $table->boolean('show_contact_form')->default(true);
            $table->boolean('show_products')->default(true);
            $table->json('social_links')->nullable(); // {facebook: '', linkedin: '', etc}
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_storefronts');
    }
};

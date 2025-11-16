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
        Schema::create('storefront_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storefront_id')->constrained('company_storefronts')->onDelete('cascade');
            $table->string('label'); // e.g., "Home", "Products", "About Us"
            $table->string('type')->default('page'); // 'page', 'section', 'external'
            $table->string('target')->nullable(); // page slug or section ID (#products) or external URL
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->boolean('show_dropdown')->default(false); // Show dropdown arrow
            $table->timestamps();
        });

        Schema::create('storefront_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storefront_id')->constrained('company_storefronts')->onDelete('cascade');
            $table->string('slug')->unique(); // e.g., "about-us", "contact"
            $table->string('title'); // Page title
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Link sections to pages instead of just storefront
        Schema::table('storefront_sections', function (Blueprint $table) {
            $table->foreignId('page_id')->nullable()->after('storefront_id')->constrained('storefront_pages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storefront_sections', function (Blueprint $table) {
            $table->dropForeign(['page_id']);
            $table->dropColumn('page_id');
        });
        
        Schema::dropIfExists('storefront_pages');
        Schema::dropIfExists('storefront_menu_items');
    }
};

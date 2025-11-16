<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'featured_products' to the section_type enum
        DB::statement("ALTER TABLE storefront_sections MODIFY COLUMN section_type ENUM('hero', 'products_showcase', 'about', 'contact', 'gallery', 'testimonials', 'certifications', 'team', 'video', 'slider', 'banner', 'heading', 'text', 'image', 'featured_products') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'featured_products' from the section_type enum
        DB::statement("ALTER TABLE storefront_sections MODIFY COLUMN section_type ENUM('hero', 'products_showcase', 'about', 'contact', 'gallery', 'testimonials', 'certifications', 'team', 'video', 'slider', 'banner', 'heading', 'text', 'image') NOT NULL");
    }
};

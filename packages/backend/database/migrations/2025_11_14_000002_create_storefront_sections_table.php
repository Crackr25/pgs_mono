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
        Schema::create('storefront_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storefront_id')->constrained('company_storefronts')->onDelete('cascade');
            $table->enum('section_type', [
                'hero', 'products_showcase', 'about', 'contact', 
                'gallery', 'testimonials', 'certifications', 'team', 'video'
            ]);
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->json('images')->nullable(); // Array of image paths
            $table->json('settings')->nullable(); // Type-specific configuration
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            
            $table->index(['storefront_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storefront_sections');
    }
};

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
        Schema::create('storefront_themes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 'Modern', 'Classic', 'Minimal', 'Industrial'
            $table->text('description')->nullable();
            $table->string('preview_image')->nullable();
            $table->text('css_template')->nullable();
            $table->json('layout_config')->nullable(); // Default section arrangements
            $table->json('color_scheme')->nullable(); // Default colors
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storefront_themes');
    }
};

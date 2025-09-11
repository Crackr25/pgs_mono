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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->json('selected_specifications')->nullable(); // Store selected specs as JSON
            $table->string('specifications_hash')->nullable(); // Hash of specifications for uniqueness
            $table->decimal('unit_price', 10, 2); // Store price at time of adding to cart
            $table->timestamps();
            
            // Ensure a user can't add the same product with same specs multiple times
            $table->unique(['user_id', 'product_id', 'specifications_hash'], 'unique_cart_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};

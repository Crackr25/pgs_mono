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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('specs');
            $table->json('images')->nullable();
            $table->integer('moq'); // Minimum Order Quantity
            $table->string('lead_time');
            $table->string('hs_code')->nullable();
            $table->json('variants')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('category');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('stock_quantity')->default(0);
            $table->string('unit')->default('pieces');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

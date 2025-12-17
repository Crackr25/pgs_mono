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
        Schema::create('product_searches', function (Blueprint $table) {
            $table->id();
            $table->string('search_term');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_type')->nullable(); // buyer, seller, guest
            $table->integer('results_count')->default(0);
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('filters')->nullable(); // category, price range, etc.
            $table->timestamps();

            // Indexes for performance
            $table->index('search_term');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_searches');
    }
};

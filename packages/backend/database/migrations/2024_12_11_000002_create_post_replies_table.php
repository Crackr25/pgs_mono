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
        Schema::create('post_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wall_post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Agent who replied
            $table->foreignId('company_id')->constrained()->onDelete('cascade'); // Agent's company
            $table->text('content');
            $table->json('images')->nullable();
            $table->json('videos')->nullable();
            $table->integer('likes_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('wall_post_id');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_replies');
    }
};

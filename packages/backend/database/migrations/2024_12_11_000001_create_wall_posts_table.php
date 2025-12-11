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
        Schema::create('wall_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Agent who posted
            $table->foreignId('company_id')->constrained()->onDelete('cascade'); // Agent's company
            $table->text('content');
            $table->json('images')->nullable(); // Array of image URLs
            $table->json('videos')->nullable(); // Array of video URLs
            $table->string('post_type')->default('text'); // text, image, video, mixed
            $table->integer('likes_count')->default(0);
            $table->integer('replies_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['created_at', 'is_active']);
            $table->index('company_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wall_posts');
    }
};

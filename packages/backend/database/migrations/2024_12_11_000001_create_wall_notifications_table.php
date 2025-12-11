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
        Schema::create('wall_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who receives the notification
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade'); // Who performed the action
            $table->string('type'); // 'post_like', 'reply_like', 'post_reply'
            $table->foreignId('wall_post_id')->nullable()->constrained('wall_posts')->onDelete('cascade');
            $table->unsignedBigInteger('wall_post_reply_id')->nullable(); // No FK constraint since post_replies may not exist
            $table->text('content')->nullable(); // Optional message content for replies
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index('created_at');
        });

        // Add views_count to wall_posts table
        Schema::table('wall_posts', function (Blueprint $table) {
            $table->integer('views_count')->default(0)->after('replies_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wall_notifications');
        
        Schema::table('wall_posts', function (Blueprint $table) {
            $table->dropColumn('views_count');
        });
    }
};

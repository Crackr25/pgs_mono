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
        Schema::create('agent_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent1_id')->constrained('users')->onDelete('cascade'); // First agent
            $table->foreignId('agent2_id')->constrained('users')->onDelete('cascade'); // Second agent
            $table->foreignId('company1_id')->constrained('companies')->onDelete('cascade'); // First agent's company
            $table->foreignId('company2_id')->constrained('companies')->onDelete('cascade'); // Second agent's company
            $table->timestamp('last_message_at')->nullable();
            $table->integer('agent1_unread_count')->default(0);
            $table->integer('agent2_unread_count')->default(0);
            $table->timestamps();

            // Ensure unique conversation between two agents
            $table->unique(['agent1_id', 'agent2_id']);
            $table->index('last_message_at');
            $table->index('agent1_id');
            $table->index('agent2_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_conversations');
    }
};

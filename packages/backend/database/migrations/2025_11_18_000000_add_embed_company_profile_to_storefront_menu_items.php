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
        Schema::table('storefront_menu_items', function (Blueprint $table) {
            $table->boolean('embed_company_profile')->default(false)->after('show_dropdown');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storefront_menu_items', function (Blueprint $table) {
            $table->dropColumn('embed_company_profile');
        });
    }
};

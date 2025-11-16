<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorefrontTheme;

class StorefrontThemeController extends Controller
{
    /**
     * List all active themes
     */
    public function index()
    {
        $themes = StorefrontTheme::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($themes);
    }

    /**
     * Get a specific theme by ID
     */
    public function show($id)
    {
        $theme = StorefrontTheme::findOrFail($id);
        return response()->json($theme);
    }
}

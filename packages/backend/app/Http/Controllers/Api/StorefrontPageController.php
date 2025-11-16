<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorefrontPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StorefrontPageController extends Controller
{
    /**
     * Get all pages for a storefront
     */
    public function index(Request $request)
    {
        $storefront = $request->user()->company->storefront;
        
        if (!$storefront) {
            return response()->json(['message' => 'Storefront not found'], 404);
        }

        $pages = StorefrontPage::where('storefront_id', $storefront->id)
            ->withCount('sections')
            ->get();

        return response()->json($pages);
    }

    /**
     * Get a single page with its sections
     */
    public function show(Request $request, $slug)
    {
        $storefront = $request->user()->company->storefront;
        
        $page = StorefrontPage::where('storefront_id', $storefront->id)
            ->where('slug', $slug)
            ->with('sections')
            ->firstOrFail();

        return response()->json($page);
    }

    /**
     * Create a new page
     */
    public function store(Request $request)
    {
        $storefront = $request->user()->company->storefront;
        
        if (!$storefront) {
            return response()->json(['message' => 'Storefront not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|min:3|max:100',
            'slug' => 'nullable|string|max:100|regex:/^[a-z0-9-]+$/|unique:storefront_pages,slug',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'title.required' => 'Page title is required',
            'title.min' => 'Page title must be at least 3 characters',
            'title.max' => 'Page title must not exceed 100 characters',
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens',
            'slug.unique' => 'This slug is already in use. Please choose a different one',
            'meta_description.max' => 'Meta description must not exceed 160 characters for optimal SEO',
            'meta_keywords.max' => 'Meta keywords must not exceed 255 characters',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $validated['storefront_id'] = $storefront->id;

        $page = StorefrontPage::create($validated);

        return response()->json($page, 201);
    }

    /**
     * Update a page
     */
    public function update(Request $request, $id)
    {
        $storefront = $request->user()->company->storefront;
        
        $page = StorefrontPage::where('storefront_id', $storefront->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|min:3|max:100',
            'slug' => 'string|max:100|regex:/^[a-z0-9-]+$/|unique:storefront_pages,slug,' . $id,
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'title.min' => 'Page title must be at least 3 characters',
            'title.max' => 'Page title must not exceed 100 characters',
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens',
            'slug.unique' => 'This slug is already in use. Please choose a different one',
            'meta_description.max' => 'Meta description must not exceed 160 characters for optimal SEO',
            'meta_keywords.max' => 'Meta keywords must not exceed 255 characters',
        ]);

        $page->update($validated);

        return response()->json($page);
    }

    /**
     * Delete a page
     */
    public function destroy(Request $request, $id)
    {
        $storefront = $request->user()->company->storefront;
        
        $page = StorefrontPage::where('storefront_id', $storefront->id)
            ->findOrFail($id);

        $page->delete();

        return response()->json(['message' => 'Page deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyStorefront;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorefrontController extends Controller
{
    /**
     * Get the authenticated user's company storefront
     */
    public function index(Request $request)
    {
        // Get the authenticated user's company
        $company = Company::where('user_id', auth()->id())->first();
        
        if (!$company) {
            return response()->json(['message' => 'No company found for this user'], 404);
        }

        $storefront = $company->storefront()->with(['theme', 'sections'])->first();

        // Return null if no storefront exists, not an empty object
        if (!$storefront) {
            return response()->json(null);
        }

        return response()->json($storefront);
    }

    /**
     * Create a new storefront for the authenticated user's company
     */
    public function store(Request $request)
    {
        $company = Company::where('user_id', auth()->id())->first();
        
        if (!$company) {
            return response()->json(['message' => 'No company found'], 404);
        }

        if ($company->storefront) {
            return response()->json(['message' => 'Storefront already exists'], 409);
        }

        $validated = $request->validate([
            'theme_id' => 'nullable|exists:storefront_themes,id',
            'tagline' => 'nullable|string|max:255',
            'about_us' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'font_family' => 'nullable|string',
            'header_layout' => 'nullable|in:centered,left,split',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'show_contact_form' => 'nullable|boolean',
            'show_products' => 'nullable|boolean',
            'social_links' => 'nullable|array',
        ]);

        $validated['company_id'] = $company->id;
        $validated['slug'] = CompanyStorefront::generateUniqueSlug($company->name);

        $storefront = CompanyStorefront::create($validated);

        return response()->json($storefront->load(['theme', 'sections']), 201);
    }

    /**
     * Update an existing storefront
     */
    public function update(Request $request, $id)
    {
        $storefront = CompanyStorefront::findOrFail($id);
        
        // Authorization check
        if ($storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'theme_id' => 'nullable|exists:storefront_themes,id',
            'landing_page_id' => 'nullable|exists:storefront_pages,id',
            'tagline' => 'nullable|string|max:255',
            'about_us' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'font_family' => 'nullable|string',
            'header_layout' => 'nullable|in:centered,left,split',
            'custom_css' => 'nullable|string',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'show_contact_form' => 'nullable|boolean',
            'show_products' => 'nullable|boolean',
            'social_links' => 'nullable|array',
        ]);

        $storefront->update($validated);

        return response()->json($storefront->load(['theme', 'sections']));
    }

    /**
     * Upload banner image for a storefront
     */
    public function uploadBanner(Request $request, $id)
    {
        $storefront = CompanyStorefront::findOrFail($id);
        
        if ($storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'banner' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        // Delete old banner if exists
        if ($storefront->banner_image) {
            Storage::disk('public')->delete($storefront->banner_image);
        }

        $file = $request->file('banner');
        $filename = 'banner_' . $storefront->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('storefronts/banners', $filename, 'public');

        $storefront->update(['banner_image' => $path]);

        return response()->json([
            'message' => 'Banner uploaded successfully',
            'banner_url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Delete a storefront
     */
    public function destroy($id)
    {
        $storefront = CompanyStorefront::findOrFail($id);
        
        if ($storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete banner image
        if ($storefront->banner_image) {
            Storage::disk('public')->delete($storefront->banner_image);
        }

        $storefront->delete();

        return response()->json(['message' => 'Storefront deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorefrontSection;
use App\Models\CompanyStorefront;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorefrontSectionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'storefront_id' => 'required|exists:company_storefronts,id',
            'page_id' => 'nullable|exists:storefront_pages,id',
            'section_type' => 'required|in:banner,hero,heading,text,about,products_showcase,featured_products,gallery,image,video,certifications,testimonials,team,contact,slider',
            'title' => 'nullable|string|max:200',
            'content' => 'nullable|string|max:5000',
            'settings' => 'nullable',
            'sort_order' => 'nullable|integer',
            'is_visible' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|image|mimes:jpeg,jpg,png,webp,gif|max:5120',
            'videos' => 'nullable|array|max:5',
            'videos.*' => 'nullable|file|mimes:mp4,webm,ogg|max:51200',
        ], [
            'section_type.required' => 'Section type is required',
            'section_type.in' => 'Invalid section type selected',
            'title.max' => 'Title must not exceed 200 characters',
            'content.max' => 'Content must not exceed 5000 characters',
            'images.max' => 'You can upload maximum 10 images per section',
            'images.*.image' => 'File must be an image',
            'images.*.mimes' => 'Image must be: JPG, PNG, WebP, or GIF',
            'images.*.max' => 'Each image must not exceed 5MB',
            'videos.max' => 'You can upload maximum 5 videos per section',
            'videos.*.mimes' => 'Video must be: MP4, WebM, or OGG',
            'videos.*.max' => 'Each video must not exceed 50MB',
        ]);

        if (isset($validated['settings'])) {
            if (is_string($validated['settings'])) {
                $validated['settings'] = json_decode($validated['settings'], true) ?? [];
            }
        } else {
            $validated['settings'] = [];
        }

        $storefront = CompanyStorefront::findOrFail($validated['storefront_id']);
        if ($storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $filename = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('storefronts/sections', $filename, 'public');
                $images[] = $path;
            }
            $validated['images'] = $images;
        }

        if ($request->hasFile('videos')) {
            $videos = [];
            foreach ($request->file('videos') as $video) {
                $filename = uniqid() . '_' . time() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('storefronts/sections/videos', $filename, 'public');
                $videos[] = $path;
            }
            if (!isset($validated['settings'])) {
                $validated['settings'] = [];
            }
            $validated['settings']['videos'] = $videos;
        }

        $section = StorefrontSection::create($validated);
        return response()->json($section, 201);
    }

    public function update(Request $request, $id)
    {
        $section = StorefrontSection::findOrFail($id);
        
        if ($section->storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'page_id' => 'nullable|exists:storefront_pages,id',
            'section_type' => 'sometimes|in:banner,hero,heading,text,about,products_showcase,featured_products,gallery,image,video,certifications,testimonials,team,contact,slider',
            'title' => 'nullable|string|max:200',
            'content' => 'nullable|string|max:5000',
            'settings' => 'nullable',
            'sort_order' => 'nullable|integer',
            'is_visible' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|image|mimes:jpeg,jpg,png,webp,gif|max:5120',
            'videos' => 'nullable|array|max:5',
            'videos.*' => 'nullable|file|mimes:mp4,webm,ogg|max:51200',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'nullable|string',
            'delete_videos' => 'nullable|array',
            'delete_videos.*' => 'nullable|string',
        ], [
            'section_type.in' => 'Invalid section type selected',
            'title.max' => 'Title must not exceed 200 characters',
            'content.max' => 'Content must not exceed 5000 characters',
            'images.max' => 'You can upload maximum 10 images per section',
            'images.*.image' => 'File must be an image',
            'images.*.mimes' => 'Image must be: JPG, PNG, WebP, or GIF',
            'images.*.max' => 'Each image must not exceed 5MB',
            'videos.max' => 'You can upload maximum 5 videos per section',
            'videos.*.mimes' => 'Video must be: MP4, WebM, or OGG',
            'videos.*.max' => 'Each video must not exceed 50MB',
        ]);

        if (isset($validated['settings'])) {
            if (is_string($validated['settings'])) {
                $validated['settings'] = json_decode($validated['settings'], true) ?? [];
            }
        }

        $existingImages = $section->images ?? [];

        if ($request->has('delete_images')) {
            $imagesToDelete = $request->input('delete_images');
            foreach ($imagesToDelete as $imageToDelete) {
                Storage::disk('public')->delete($imageToDelete);
                $existingImages = array_diff($existingImages, [$imageToDelete]);
            }
            $existingImages = array_values($existingImages);
        }

        if ($request->hasFile('images')) {
            $newImages = [];
            foreach ($request->file('images') as $image) {
                $filename = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('storefronts/sections', $filename, 'public');
                $newImages[] = $path;
            }
            $existingImages = array_merge($existingImages, $newImages);
        }

        $validated['images'] = $existingImages;

        $existingSettings = $section->settings ?? [];
        $existingVideos = $existingSettings['videos'] ?? [];

        if ($request->has('delete_videos')) {
            $videosToDelete = $request->input('delete_videos');
            foreach ($videosToDelete as $videoToDelete) {
                Storage::disk('public')->delete($videoToDelete);
                $existingVideos = array_diff($existingVideos, [$videoToDelete]);
            }
            $existingVideos = array_values($existingVideos);
        }

        if ($request->hasFile('videos')) {
            $newVideos = [];
            foreach ($request->file('videos') as $video) {
                $filename = uniqid() . '_' . time() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('storefronts/sections/videos', $filename, 'public');
                $newVideos[] = $path;
            }
            $existingVideos = array_merge($existingVideos, $newVideos);
        }

        if (isset($validated['settings'])) {
            if (is_string($validated['settings'])) {
                $validated['settings'] = json_decode($validated['settings'], true) ?? [];
            }
        } else {
            $validated['settings'] = [];
        }
        $validated['settings']['videos'] = $existingVideos;

        unset($validated['delete_images']);
        unset($validated['delete_videos']);

        $section->update($validated);
        return response()->json($section);
    }

    public function destroy($id)
    {
        $section = StorefrontSection::findOrFail($id);
        
        if ($section->storefront->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($section->images) {
            foreach ($section->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        if (isset($section->settings['videos']) && is_array($section->settings['videos'])) {
            foreach ($section->settings['videos'] as $video) {
                Storage::disk('public')->delete($video);
            }
        }

        $section->delete();
        return response()->json(['message' => 'Section deleted successfully']);
    }
}

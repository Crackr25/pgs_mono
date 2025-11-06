<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        
       $company = Company::where('user_id', auth()->id())->first();
        
        if (!$company) {
            // Either return empty list or 404 — choose your UX
            return response()->json(['data' => []]); 
            // or: return response()->json(['message' => 'No company found'], 404);
        }
    
        $query = Product::with(['company', 'images', 'mainImage'])->where('company_id', $company->id);
        
  
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        
        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }
        
        // Search by name or specs
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('specs', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        
        // Pagination settings (align with Quotes controller)
        $perPage = (int) $request->get('per_page', 10);
        $allowedPerPage = [10, 15, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }
        
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        // First, get all input data
        $input = $request->all();
        
        // Convert variants from JSON string to array if it exists and is a string
        if (isset($input['variants']) && is_string($input['variants'])) {
            $input['variants'] = json_decode($input['variants'], true);
        }
        
        // Now validate the processed data
        $validated = validator($input, [
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'specs' => 'required|string',
            'image' => 'nullable|string',
            'moq' => 'required|integer|min:1',
            'lead_time' => 'required|string',
            'hs_code' => 'nullable|string',
            'variants' => 'nullable|array', // This now expects an array
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit' => 'nullable|string'
        ])->validate();

        // Check if user owns the company
        $company = Company::findOrFail($validated['company_id']);
        if ($company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::create($validated);
        
        // Handle image uploads if provided
        if (isset($validated['images']) && is_array($validated['images'])) {
            foreach ($validated['images'] as $index => $imageData) {
                if (isset($imageData['file']) || isset($imageData['image_path'])) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['image_path'] ?? $imageData['file'],
                        'is_main' => $imageData['isMain'] ?? ($index === 0),
                        'sort_order' => $index,
                        'alt_text' => $product->name . ' - Image ' . ($index + 1)
                    ]);
                }
            }
        }
        
        return response()->json($product->load(['company', 'images', 'mainImage', 'additionalImages']), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['company', 'quotes', 'images', 'mainImage', 'additionalImages']));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'specs' => 'sometimes|string',
            'images' => 'nullable|array',
            'moq' => 'sometimes|integer|min:1',
            'lead_time' => 'sometimes|string',
            'hs_code' => 'nullable|string',
            'variants' => 'nullable|array',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit' => 'nullable|string'
        ]);

        $product->update($validated);
        
        // Handle image updates if provided
        if (isset($validated['images']) && is_array($validated['images'])) {
            // Delete existing images that are not in the new set
            $existingImageIds = $product->images->pluck('id')->toArray();
            $newImageIds = collect($validated['images'])->pluck('id')->filter()->toArray();
            $imagesToDelete = array_diff($existingImageIds, $newImageIds);
            
            if (!empty($imagesToDelete)) {
                ProductImage::whereIn('id', $imagesToDelete)->delete();
            }
            
            // Update or create images
            foreach ($validated['images'] as $index => $imageData) {
                if (isset($imageData['id'])) {
                    // Update existing image
                    ProductImage::where('id', $imageData['id'])
                        ->where('product_id', $product->id)
                        ->update([
                            'is_main' => $imageData['isMain'] ?? false,
                            'sort_order' => $index,
                            'alt_text' => $product->name . ' - Image ' . ($index + 1)
                        ]);
                } elseif (isset($imageData['file']) || isset($imageData['image_path'])) {
                    // Create new image
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['image_path'] ?? $imageData['file'],
                        'is_main' => $imageData['isMain'] ?? false,
                        'sort_order' => $index,
                        'alt_text' => $product->name . ' - Image ' . ($index + 1)
                    ]);
                }
            }
        }
        
        return response()->json($product->load(['company', 'images', 'mainImage', 'additionalImages']));
    }

    public function destroy(Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();
        
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Debug logging
        \Log::info('Upload request received', [
            'has_files' => $request->hasFile('images'),
            'all_files' => $request->allFiles(),
            'all_input' => $request->all()
        ]);

        try {
            $request->validate([
                'images' => 'required|array|max:10', // Max 10 images
                'images.*' => 'image|mimes:jpeg,jpg,png|max:5120', // 5MB max per image
                'main_image_index' => 'nullable|integer|min:0'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        $uploadedImages = [];
        $mainImageIndex = $request->input('main_image_index', 0);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                
                \Log::info('Image stored', [
                    'filename' => $filename,
                    'path' => $path,
                    'full_path' => storage_path('app/public/' . $path)
                ]);
                
                $productImage = ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_main' => $index === $mainImageIndex,
                    'sort_order' => $index,
                    'alt_text' => $product->name . ' - Image ' . ($index + 1)
                ]);

                $uploadedImages[] = $productImage;
            }
        } else {
            \Log::warning('No images found in request');
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'data' => [
                'product' => $product->fresh()->load(['images', 'mainImage', 'additionalImages']),
                'uploaded_images' => $uploadedImages
            ]
        ]);
    }

    public function uploadVideos(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Debug logging
        \Log::info('Video upload request received', [
            'has_files' => $request->hasFile('videos'),
            'all_files' => $request->allFiles(),
            'all_input' => $request->all()
        ]);

        try {
            $request->validate([
                'videos' => 'required|array|max:3', // Max 3 videos
                'videos.*' => 'mimes:mp4,mov,avi,webm|max:51200', // 50MB max per video
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Video validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        $uploadedVideos = [];

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $index => $video) {
                $filename = time() . '_' . uniqid() . '.' . $video->getClientOriginalExtension();
                $path = $video->storeAs('products/videos', $filename, 'public');
                
                \Log::info('Video stored', [
                    'filename' => $filename,
                    'path' => $path,
                    'full_path' => storage_path('app/public/' . $path)
                ]);
                
                // For now, we'll store video info in the product's videos JSON field
                // until we create the ProductVideo model
                $videoData = [
                    'name' => $video->getClientOriginalName(),
                    'path' => $path,
                    'size' => $video->getSize(),
                    'type' => $video->getMimeType(),
                    'sort_order' => $index,
                    'created_at' => now()->toISOString()
                ];
                
                $uploadedVideos[] = $videoData;
            }
            
            // Get existing videos and merge with new ones
            $existingVideos = $product->videos ? json_decode($product->videos, true) : [];
            $allVideos = array_merge($existingVideos, $uploadedVideos);
            
            // Update product with videos
            $product->update(['videos' => json_encode($allVideos)]);
        } else {
            \Log::warning('No videos found in request');
        }

        return response()->json([
            'message' => 'Videos uploaded successfully',
            'data' => [
                'product' => $product->fresh(),
                'uploaded_videos' => $uploadedVideos
            ]
        ]);
    }

    public function updateImageOrder(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'image_orders' => 'required|array',
            'image_orders.*.id' => 'required|exists:product_images,id',
            'image_orders.*.sort_order' => 'required|integer|min:0',
            'main_image_id' => 'nullable|exists:product_images,id'
        ]);

        // Update sort orders
        foreach ($request->image_orders as $imageOrder) {
            ProductImage::where('id', $imageOrder['id'])
                ->where('product_id', $product->id)
                ->update(['sort_order' => $imageOrder['sort_order']]);
        }

        // Update main image
        if ($request->has('main_image_id')) {
            // Reset all images to not main
            ProductImage::where('product_id', $product->id)->update(['is_main' => false]);
            
            // Set new main image
            ProductImage::where('id', $request->main_image_id)
                ->where('product_id', $product->id)
                ->update(['is_main' => true]);
        }

        return response()->json([
            'message' => 'Image order updated successfully',
            'data' => $product->fresh()->load(['images', 'mainImage', 'additionalImages'])
        ]);
    }

    public function deleteImage(Request $request, Product $product, ProductImage $image): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if image belongs to this product
        if ($image->product_id !== $product->id) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        // Delete file from storage
        if (\Storage::disk('public')->exists($image->image_path)) {
            \Storage::disk('public')->delete($image->image_path);
        }

        // If this was the main image, set another image as main
        $wasMain = $image->is_main;
        $image->delete();

        if ($wasMain) {
            $nextImage = ProductImage::where('product_id', $product->id)
                ->orderBy('sort_order')
                ->first();
            
            if ($nextImage) {
                $nextImage->update(['is_main' => true]);
            }
        }

        return response()->json([
            'message' => 'Image deleted successfully',
            'data' => $product->fresh()->load(['images', 'mainImage', 'additionalImages'])
        ]);
    }

    public function deleteVideo(Request $request, Product $product, $videoIndex): JsonResponse
    {
        // Check if user owns the company that owns this product
        if ($product->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $videos = $product->videos ? json_decode($product->videos, true) : [];
        
        if (!isset($videos[$videoIndex])) {
            return response()->json(['message' => 'Video not found'], 404);
        }

        $videoToDelete = $videos[$videoIndex];
        
        // Delete file from storage
        if (isset($videoToDelete['path']) && \Storage::disk('public')->exists($videoToDelete['path'])) {
            \Storage::disk('public')->delete($videoToDelete['path']);
        }

        // Remove from array and reindex
        unset($videos[$videoIndex]);
        $videos = array_values($videos); // Reindex array
        
        // Update product
        $product->update(['videos' => json_encode($videos)]);

        return response()->json([
            'message' => 'Video deleted successfully',
            'data' => $product->fresh()
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarketplaceController extends Controller
{
    /**
     * Get random products for buyer marketplace with pagination
     * Returns 30 products per page with only 1 image per product
     */
    public function getRandomProducts(Request $request): JsonResponse
    {
        $perPage = 12; // Reduced from 30 to 12 to make pagination more visible
        $page = $request->get('page', 1);
        
        // Get random products with their company and main image
        $query = Product::with([
            'company:user_id,id,name,location,verified',
            'mainImage:id,product_id,image_path'
        ])
        ->where('active', true)
        ->inRandomOrder();
        
        // Apply filters if provided
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('location') && $request->location) {
            $query->whereHas('company', function($q) use ($request) {
                $q->where('location', 'like', '%' . $request->location . '%');
            });
        }
        
        if ($request->has('min_price') && $request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price') && $request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        $products = $query->paginate($perPage);
        
        // Transform the data to include only one image and add placeholder if none
        $products->getCollection()->transform(function ($product) {
            // Get the main image or first available image
            $image = $product->mainImage;
            if (!$image) {
                $image = $product->images()->first();
            }
            
            // Set image URL or placeholder
            $imageUrl = $image ? asset('storage/' . $image->image_path) : null;
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'unit' => $product->unit,
                'moq' => $product->moq,
                'category' => $product->category,
                'lead_time' => $product->lead_time,
                'stock_quantity' => $product->stock_quantity,
                'image' => $imageUrl,
                'has_image' => !is_null($imageUrl),
                'company' => [
                    'id' => $product->company->id,
                    'user_id' => $product->company->user_id,
                    'name' => $product->company->name,
                    'location' => $product->company->location,
                    'verified' => $product->company->verified ?? false,
                ],
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });
        
        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'from' => $products->firstItem(),
            'to' => $products->lastItem(),
            'path' => $products->path(),
            'next_page_url' => $products->nextPageUrl(),
            'prev_page_url' => $products->previousPageUrl(),
        ]);
    }
    
    /**
     * Get product categories for filtering
     */
    public function getCategories(): JsonResponse
    {
        $categories = Product::where('active', true)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();
            
        return response()->json([
            'data' => $categories
        ]);
    }
    
    /**
     * Get supplier locations for filtering
     */
    public function getLocations(): JsonResponse
    {
        $locations = Product::with('company:id,location')
            ->where('active', true)
            ->get()
            ->pluck('company.location')
            ->filter()
            ->unique()
            ->sort()
            ->values();
            
        return response()->json([
            'data' => $locations
        ]);
    }

    /**
     * Get detailed product information for product page
     */
    public function getProductDetails($id): JsonResponse
    {
        try {
            $product = Product::with([
                'company:user_id,id,name,location,verified,description,year_established,email,phone,website',
                'images:id,product_id,image_path,is_main,sort_order,alt_text'
            ])
            ->where('active', 1)
            ->findOrFail($id);

            // Get all images, prioritizing main image first
            $images = $product->images()
                ->orderBy('is_main', 'desc')
                ->orderBy('sort_order', 'asc')
                ->get()
                ->map(function ($image) {
                    return asset('storage/' . $image->image_path);
                });

            // Mock reviews data (replace with actual reviews from database later)
            $productReviews = [
                [
                    'id' => 1,
                    'reviewer' => 'John Construction Co.',
                    'rating' => 5,
                    'date' => '2024-01-15',
                    'comment' => 'Excellent quality product. Very satisfied with the purchase.',
                    'verified_purchase' => true
                ],
                [
                    'id' => 2,
                    'reviewer' => 'Industrial Solutions Ltd.',
                    'rating' => 4,
                    'date' => '2024-01-10',
                    'comment' => 'Good product overall. Would recommend.',
                    'verified_purchase' => true
                ]
            ];

            $companyReviews = [
                [
                    'id' => 1,
                    'reviewer' => 'ABC Manufacturing',
                    'rating' => 5,
                    'date' => '2024-01-20',
                    'comment' => 'Outstanding service and fast delivery.',
                    'verified_purchase' => true
                ],
                [
                    'id' => 2,
                    'reviewer' => 'XYZ Industries',
                    'rating' => 4,
                    'date' => '2024-01-18',
                    'comment' => 'Reliable supplier with good quality products.',
                    'verified_purchase' => true
                ]
            ];

            return response()->json([
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'unit' => $product->unit,
                'moq' => (int) $product->moq,
                'category' => $product->category,
                'lead_time' => $product->lead_time,
                'stock_quantity' => (int) $product->stock_quantity,
                'hs_code' => $product->hs_code,
                'specifications' => $product->specs ? json_decode($product->specs, true) : [],
                'images' => $images->toArray(),
                'company' => [
                    'id' => $product->company->id,
                    'name' => $product->company->name,
                    'location' => $product->company->location,
                    'verified' => $product->company->verified ?? false,
                    'rating' => 4.8, // Mock rating - replace with actual calculation
                    'total_reviews' => 156, // Mock count - replace with actual count
                    'established' => $product->company->year_established ?? '2015',
                    'response_time' => '< 2 hours',
                    'about' => $product->company->description ?? 'Leading manufacturer with years of experience.',
                    'contact' => [
                        'email' => $product->company->email,
                        'phone' => $product->company->phone,
                        'website' => $product->company->website
                    ],
                    'certifications' => ['ISO 9001', 'CE', 'RoHS'] // Mock certifications
                ],
                'reviews' => [
                    'product_reviews' => $productReviews,
                    'company_reviews' => $companyReviews
                ],
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at
            ]);

        } catch (\Exception $e) {
            // return $e;
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Product not found'
            ], 404);
        }
    }

    /**
     * Submit product inquiry
     */
    public function submitInquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'quantity' => 'nullable|integer|min:1',
            'message' => 'required|string|max:2000',
            'urgency' => 'required|in:low,normal,high,urgent'
        ]);

        try {
            // Get product and company details
            $product = Product::with('company')->findOrFail($validated['product_id']);

            // For now, we'll just log the inquiry and return success
            // Later, you can save to database and send email notifications
            \Log::info('Product Inquiry Submitted', [
                'product_id' => $validated['product_id'],
                'product_name' => $product->name,
                'company_id' => $product->company->id,
                'company_name' => $product->company->name,
                'inquiry_data' => $validated
            ]);

            // TODO: Save inquiry to database
            // TODO: Send email notification to supplier
            // TODO: Send confirmation email to buyer

            return response()->json([
                'message' => 'Inquiry submitted successfully! The supplier will contact you soon.',
                'inquiry_id' => uniqid() // Mock inquiry ID
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit inquiry. Please try again.'
            ], 500);
        }
    }
}

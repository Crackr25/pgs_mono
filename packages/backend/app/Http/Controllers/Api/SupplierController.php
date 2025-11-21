<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SupplierController extends Controller
{
    /**
     * Get detailed supplier information including delivery rates and metrics.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::with(['products', 'user'])
                ->findOrFail($id);


            // Calculate metrics
            $totalProducts = $company->products()->count();
            $totalOrders = $this->calculateTotalOrders($company);
            $totalCustomers = $this->calculateTotalCustomers($company);
            $deliveryRate = $this->calculateDeliveryRate($company);
            $ratingBreakdown = $this->calculateRatingBreakdown($company);

            $supplierData = [
                'id' => $company->id,
                'name' => $company->name,
                'about' => $company->about,
                'location' => $company->location,
                'address' => $company->address,
                'company_banner' => $company->company_banner,
                'established' => $company->year_established,
                'verified' => $company->verified,
                'rating' => $company->rating ?? 4.2,
                'total_reviews' => $company->total_reviews ?? 0,
                'response_time' => $company->response_time ?? '< 2 hours',
                
                // Contact information
                'contact' => [
                    'email' => $company->email,
                    'phone' => $company->phone,
                    'website' => $company->website,
                ],
                
                // Business metrics
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'delivery_rate' => $deliveryRate,
                'rating_breakdown' => $ratingBreakdown,
                
                // Business details
                'employee_count' => $company->employees ?? '50-100',
                'export_countries' => $company->export_countries ?? '15+',
                'main_products' => $company->main_products ?? 'Electronics, Components',
                'trade_type' => $company->trade_type ?? 'Manufacturer, Exporter',
                'payment_terms' => $company->payment_terms ?? 'T/T, L/C, PayPal',
                'delivery_terms' => $company->delivery_terms ?? 'FOB, CIF, EXW',
                'min_order_value' => $company->min_order_value ?? 1000,
                
                // Certifications
                'certifications' => $company->certifications ?? [
                    'ISO 9001:2015',
                    'CE Certification',
                    'RoHS Compliance',
                    'FCC Certification'
                ],
                
                // Document files - Company Documents & Media (matching company-profile.js logic)
                'documents' => [
                    'business' => $this->getBusinessDocuments($company),
                    'certifications' => $this->getCertificationDocuments($company),
                    'kyc' => $this->getKycDocuments($company),
                    'factory' => $this->getFactoryDocuments($company)
                ],
                
                'created_at' => $company->created_at,
                'updated_at' => $company->updated_at,
            ];

            return response()->json($supplierData);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch supplier details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier's products with pagination.
     */
    public function products(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $perPage = $request->get('per_page', 12);
            $search = $request->get('search', '');
            
            $productsQuery = $company->products()
                ->with([
                    'company:user_id,id,name,location,verified',
                    'mainImage:id,product_id,image_path'
                ])
                ->when($search, function ($query, $search) {
                    return $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('category', 'like', "%{$search}%");
                    });
                })
                ->orderBy('created_at', 'desc');

            $products = $productsQuery->paginate($perPage);

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

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch supplier products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier reviews (both company and product reviews).
     */
    public function reviews(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $perPage = $request->get('per_page', 10);
            $type = $request->get('type', 'all'); // all, company, product
            
            // Fetch real reviews from database with product relationship
            $reviewsQuery = $company->reviews()
                ->with('product:id,name,category,image')
                ->orderBy('created_at', 'desc');
            
            // Apply filters if needed
            if ($request->has('rating')) {
                $reviewsQuery->where('rating', $request->get('rating'));
            }
            
            if ($request->has('verified_only') && $request->get('verified_only') === 'true') {
                $reviewsQuery->where('verified', true);
            }
            
            // Paginate reviews
            $reviews = $reviewsQuery->paginate($perPage);
            
            // Transform reviews to match frontend format
            $transformedReviews = $reviews->map(function ($review) {
                $reviewData = [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer_name,
                    'reviewer_company' => $review->reviewer_company,
                    'reviewer_email' => $review->reviewer_email,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'verified' => $review->verified,
                    'response' => $review->response,
                    'response_date' => $review->response_date ? $review->response_date->format('Y-m-d') : null,
                    'date' => $review->created_at->format('Y-m-d'),
                    'created_at' => $review->created_at->toIso8601String(),
                    'formatted_date' => $review->created_at->format('M d, Y'),
                    'order_id' => $review->order_id,
                ];

                // Include product information if available
                if ($review->product) {
                    $reviewData['product'] = [
                        'id' => $review->product->id,
                        'name' => $review->product->name,
                        'category' => $review->product->category,
                        'image' => $review->product->image,
                    ];
                }

                return $reviewData;
            });
            
            return response()->json([
                'data' => $transformedReviews,
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'from' => $reviews->firstItem(),
                'to' => $reviews->lastItem()
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch supplier reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier review statistics.
     */
    public function reviewStats(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $totalReviews = $company->reviews()->count();
            $averageRating = $company->reviews()->avg('rating') ?? 0;
            $ratingBreakdown = $this->calculateRatingBreakdown($company);
            
            // Calculate percentage breakdown
            $ratingPercentage = [];
            foreach ($ratingBreakdown as $stars => $count) {
                $ratingPercentage[$stars] = $totalReviews > 0 
                    ? round(($count / $totalReviews) * 100, 1) 
                    : 0;
            }
            
            // Get verified reviews count
            $verifiedCount = $company->reviews()->where('verified', true)->count();
            
            return response()->json([
                'total_reviews' => $totalReviews,
                'average_rating' => round($averageRating, 1),
                'rating_breakdown' => $ratingBreakdown,
                'rating_percentage' => $ratingPercentage,
                'verified_reviews' => $verifiedCount,
                'verified_percentage' => $totalReviews > 0 
                    ? round(($verifiedCount / $totalReviews) * 100, 1) 
                    : 0
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch review statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate total orders for a company (mock calculation).
     */
    private function calculateTotalOrders(Company $company): int
    {
        // In a real app, you'd query the orders table
        return rand(50, 500);
    }

    /**
     * Calculate total customers for a company (mock calculation).
     */
    private function calculateTotalCustomers(Company $company): int
    {
        // In a real app, you'd query unique buyers from orders
        return rand(20, 150);
    }

    /**
     * Calculate delivery rate for a company (mock calculation).
     */
    private function calculateDeliveryRate(Company $company): float
    {
        // In a real app, you'd calculate from order delivery data
        return round(rand(85, 98) + (rand(0, 9) / 10), 1);
    }

    /**
     * Calculate rating breakdown for a company from real reviews.
     */
    private function calculateRatingBreakdown(Company $company): array
    {
        // Calculate from actual reviews in database
        $breakdown = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        
        $ratings = $company->reviews()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();
        
        foreach ($ratings as $rating => $count) {
            if (isset($breakdown[$rating])) {
                $breakdown[$rating] = $count;
            }
        }
        
        return $breakdown;
    }

    /**
     * Submit a review for a supplier (public endpoint).
     */
    public function submitReview(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            // Validate review data
            $validated = $request->validate([
                'reviewer_name' => 'required|string|max:255',
                'reviewer_email' => 'required|email|max:255',
                'reviewer_company' => 'nullable|string|max:255',
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'required|string|max:2000',
                'order_id' => 'nullable|integer|exists:orders,id'
            ]);
            
            // Create the review
            $review = new Review();
            $review->company_id = $company->id;
            $review->reviewer_name = $validated['reviewer_name'];
            $review->reviewer_email = $validated['reviewer_email'];
            $review->reviewer_company = $validated['reviewer_company'] ?? null;
            $review->rating = $validated['rating'];
            $review->title = $validated['title'] ?? null;
            $review->comment = $validated['comment'];
            $review->order_id = $validated['order_id'] ?? null;
            $review->verified = false; // Reviews are not verified by default
            $review->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully! It will appear after verification.',
                'data' => [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer_name,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s')
                ]
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate mock reviews for a company.
     */
    private function generateMockReviews(Company $company, string $type = 'all'): array
    {
        $reviews = [];
        $reviewCount = rand(5, 20);
        
        $sampleReviews = [
            [
                'reviewer_name' => 'John Smith',
                'rating' => 5,
                'comment' => 'Excellent supplier with high-quality products. Fast delivery and great customer service.',
                'verified_purchase' => true,
                'type' => 'company'
            ],
            [
                'reviewer_name' => 'Maria Garcia',
                'rating' => 4,
                'comment' => 'Good quality products and reasonable prices. Communication could be improved.',
                'verified_purchase' => true,
                'type' => 'product',
                'product_name' => 'LED Light Fixture'
            ],
            [
                'reviewer_name' => 'David Chen',
                'rating' => 5,
                'comment' => 'Outstanding service and product quality. Highly recommended for bulk orders.',
                'verified_purchase' => true,
                'type' => 'company'
            ],
            [
                'reviewer_name' => 'Sarah Johnson',
                'rating' => 4,
                'comment' => 'Professional supplier with competitive pricing. Delivery was on time.',
                'verified_purchase' => false,
                'type' => 'product',
                'product_name' => 'Industrial Components'
            ],
            [
                'reviewer_name' => 'Ahmed Hassan',
                'rating' => 5,
                'comment' => 'Very satisfied with the quality and service. Will order again.',
                'verified_purchase' => true,
                'type' => 'company'
            ]
        ];

        for ($i = 0; $i < $reviewCount; $i++) {
            $review = $sampleReviews[array_rand($sampleReviews)];
            $review['id'] = $i + 1;
            $review['date'] = date('Y-m-d', strtotime('-' . rand(1, 365) . ' days'));
            
            if ($type === 'all' || $review['type'] === $type) {
                $reviews[] = $review;
            }
        }

        // Sort by date (newest first)
        usort($reviews, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return $reviews;
    }

    private function getBusinessDocuments($company)
    {
        $documents = [];

        if (!empty($company->dti_sec_certificate)) {
            $documents[] = [
                'name' => 'DTI/SEC Certificate',
                'url' => $company->dti_sec_certificate
            ];
        }

        if (!empty($company->peza_documents)) {
            $pezaDocs = is_string($company->peza_documents) 
                ? json_decode($company->peza_documents, true) 
                : $company->peza_documents;
            if (is_array($pezaDocs)) {
                foreach ($pezaDocs as $file) {
                    $documents[] = [
                        'name' => 'PEZA Document',
                        'url' => $file
                    ];
                }
            }
        }

        if (!empty($company->business_permits)) {
            $permitFiles = is_string($company->business_permits) 
                ? json_decode($company->business_permits, true) 
                : $company->business_permits;
            if (is_array($permitFiles)) {
                foreach ($permitFiles as $file) {
                    $documents[] = [
                        'name' => 'Business Permit',
                        'url' => $file
                    ];
                }
            }
        }

        return $documents;
    }

    private function getCertificationDocuments($company)
    {
        $documents = [];

        if (!empty($company->product_certifications)) {
            $certFiles = is_string($company->product_certifications) 
                ? json_decode($company->product_certifications, true) 
                : $company->product_certifications;
            if (is_array($certFiles)) {
                foreach ($certFiles as $file) {
                    $documents[] = [
                        'name' => 'Product Certification',
                        'url' => $file
                    ];
                }
            }
        }

        return $documents;
    }

    private function getKycDocuments($company)
    {
        $documents = [];

        if (!empty($company->owner_id_front)) {
            $documents[] = [
                'name' => 'Owner ID (Front)',
                'url' => $company->owner_id_front
            ];
        }

        if (!empty($company->owner_id_back)) {
            $documents[] = [
                'name' => 'Owner ID (Back)',
                'url' => $company->owner_id_back
            ];
        }

        if (!empty($company->proof_of_address)) {
            $documents[] = [
                'name' => 'Proof of Address',
                'url' => $company->proof_of_address
            ];
        }

        if (!empty($company->business_registration_cert)) {
            $documents[] = [
                'name' => 'Business Registration Certificate',
                'url' => $company->business_registration_cert
            ];
        }

        return $documents;
    }

    private function getFactoryDocuments($company)
    {
        $documents = [];

        if (!empty($company->factory_overview_video)) {
            $documents[] = [
                'name' => 'Factory Overview Video',
                'url' => $company->factory_overview_video
            ];
        }

        if (!empty($company->production_line_photos)) {
            $photos = is_string($company->production_line_photos) 
                ? json_decode($company->production_line_photos, true) 
                : $company->production_line_photos;
            if (is_array($photos)) {
                foreach ($photos as $file) {
                    $documents[] = [
                        'name' => 'Production Line Photo',
                        'url' => $file
                    ];
                }
            }
        }

        if (!empty($company->quality_control_photos)) {
            $photos = is_string($company->quality_control_photos) 
                ? json_decode($company->quality_control_photos, true) 
                : $company->quality_control_photos;
            if (is_array($photos)) {
                foreach ($photos as $file) {
                    $documents[] = [
                        'name' => 'Quality Control Photo',
                        'url' => $file
                    ];
                }
            }
        }

        if (!empty($company->warehouse_photos)) {
            $photos = is_string($company->warehouse_photos) 
                ? json_decode($company->warehouse_photos, true) 
                : $company->warehouse_photos;
            if (is_array($photos)) {
                foreach ($photos as $file) {
                    $documents[] = [
                        'name' => 'Warehouse Photo',
                        'url' => $file
                    ];
                }
            }
        }

        if (!empty($company->certifications_photos)) {
            $photos = is_string($company->certifications_photos) 
                ? json_decode($company->certifications_photos, true) 
                : $company->certifications_photos;
            if (is_array($photos)) {
                foreach ($photos as $file) {
                    $documents[] = [
                        'name' => 'Certification Photo',
                        'url' => $file
                    ];
                }
            }
        }

        return $documents;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Product;
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
                'established' => $company->established,
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
                'employee_count' => $company->employee_count ?? '50-100',
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
                ->when($search, function ($query, $search) {
                    return $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('category', 'like', "%{$search}%");
                    });
                })
                ->orderBy('created_at', 'desc');

            $products = $productsQuery->paginate($perPage);

            return response()->json($products);

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
            
            // Mock reviews data - in a real app, you'd have a reviews table
            $mockReviews = $this->generateMockReviews($company, $type);
            
            // Simulate pagination
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            $paginatedReviews = array_slice($mockReviews, $offset, $perPage);
            
            $paginationData = [
                'data' => $paginatedReviews,
                'current_page' => $page,
                'last_page' => ceil(count($mockReviews) / $perPage),
                'per_page' => $perPage,
                'total' => count($mockReviews),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, count($mockReviews))
            ];

            return response()->json($paginationData);

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
     * Calculate rating breakdown for a company (mock calculation).
     */
    private function calculateRatingBreakdown(Company $company): array
    {
        // In a real app, you'd calculate from actual reviews
        return [
            5 => rand(40, 60),
            4 => rand(20, 30),
            3 => rand(5, 15),
            2 => rand(2, 8),
            1 => rand(0, 5)
        ];
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
}

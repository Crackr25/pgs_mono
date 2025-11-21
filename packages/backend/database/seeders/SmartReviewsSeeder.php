<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Company;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SmartReviewsSeeder extends Seeder
{
    /**
     * Realistic B2B buyer profiles with authentic email domains
     */
    private $buyers = [
        ['name' => 'Michael Chen', 'company' => 'Pacific Trading International', 'email' => 'michael.chen@pacifictrade.com'],
        ['name' => 'Sarah Martinez', 'company' => 'Global Sourcing Solutions', 'email' => 'sarah.m@globalsourcing.com'],
        ['name' => 'David Thompson', 'company' => 'American Wholesale Group', 'email' => 'david.thompson@amwholesale.com'],
        ['name' => 'Jennifer Wong', 'company' => 'Asia Pacific Imports Ltd', 'email' => 'jennifer.wong@asiapacific.com.hk'],
        ['name' => 'Robert Anderson', 'company' => 'Industrial Supply Corp', 'email' => 'robert.a@industrialsupply.com'],
        ['name' => 'Lisa Park', 'company' => 'Tech Components Trading', 'email' => 'lisa.park@techcomponents.com'],
        ['name' => 'Ahmed Al-Rashid', 'company' => 'Middle East Trading Co', 'email' => 'ahmed@metrading.ae'],
        ['name' => 'Maria Santos', 'company' => 'Philippines Distribution Network', 'email' => 'maria.santos@phdistribution.ph'],
        ['name' => 'John Patterson', 'company' => 'North America Distributors', 'email' => 'john.patterson@nadist.com'],
        ['name' => 'Yuki Tanaka', 'company' => 'Tokyo Import Export', 'email' => 'yuki.tanaka@tokyoie.co.jp'],
        ['name' => 'Carlos Rodriguez', 'company' => 'Latin America Traders', 'email' => 'carlos.r@latraders.mx'],
        ['name' => 'Emma Williams', 'company' => 'European Wholesale Hub', 'email' => 'emma.williams@eurowhub.eu'],
        ['name' => 'Zhang Wei', 'company' => 'China Sourcing Network', 'email' => 'zhang.wei@chinasourcing.cn'],
        ['name' => 'Fatima Hassan', 'company' => 'Dubai Trading House', 'email' => 'fatima.hassan@dubaitrading.ae'],
        ['name' => 'James Miller', 'company' => 'Retail Supply Partners', 'email' => 'james.miller@retailsupply.com'],
        ['name' => 'Priya Sharma', 'company' => 'India Import Solutions', 'email' => 'priya.sharma@indiaims.in'],
        ['name' => 'Antonio Rossi', 'company' => 'Mediterranean Trading Group', 'email' => 'antonio.rossi@medtrade.it'],
        ['name' => 'Sophie Laurent', 'company' => 'France Distribution Network', 'email' => 'sophie.laurent@frdist.fr'],
        ['name' => 'Kim Min-jun', 'company' => 'Korea Global Trade', 'email' => 'kim.minjun@koreatrade.kr'],
        ['name' => 'Mohammed Ibrahim', 'company' => 'Saudi Import Company', 'email' => 'mohammed.i@saudiimport.sa'],
    ];

    /**
     * Product-specific positive review templates
     */
    private function getProductReviewTemplates($category, $productName, $rating)
    {
        $templates = [
            'apparel' => [
                5 => [
                    "Excellent quality {product}! The fabric is soft and durable. Our customers love the fit and style. Will definitely order more for next season.",
                    "Outstanding {product}! Perfect for our retail chain. The materials are high-quality and the stitching is impeccable. Highly recommend this supplier!",
                    "Best {product} we've sourced! Great attention to detail, comfortable fabric, and true to size. Our repeat order rate is very high.",
                ],
                4 => [
                    "Good quality {product}. Slight color variation from sample but overall satisfied. Fast shipping and good packaging.",
                    "The {product} meets our expectations. Quality is good for the price point. Would order again with minor adjustments.",
                    "Solid {product}. Fabric quality is decent and customers are satisfied. Minor issues with sizing but supplier was responsive.",
                ],
                3 => [
                    "Average quality {product}. Acceptable for mid-range market but could improve fabric thickness.",
                    "The {product} is okay. Met basic requirements but not exceptional. Delivery was on time though.",
                ],
            ],
            'electronics' => [
                5 => [
                    "Exceptional {product}! All units tested and working perfectly. Build quality exceeds expectations. Great supplier for electronics!",
                    "Premium quality {product}. Very well-packaged, no defects in our 500-unit order. Customer service is responsive and professional.",
                    "Top-tier {product}! Battery life is excellent, build is solid. Our customers are extremely satisfied. Will place larger orders.",
                ],
                4 => [
                    "Good {product}. One or two units had minor issues but supplier replaced them quickly. Overall satisfied with the order.",
                    "Quality {product} for the price. Performance is good, packaging could be better. Would recommend with minor reservations.",
                    "Solid {product}. Meets specifications, delivery was fast. Minor discrepancy in accessories but manageable.",
                ],
                3 => [
                    "Average {product}. Works as described but build quality could be improved. Acceptable for budget market.",
                    "The {product} is functional. Had some quality control issues (5% defect rate) but supplier offered compensation.",
                ],
            ],
            'conductor' => [
                5 => [
                    "Excellent quality {product}! Copper purity meets specifications, insulation is durable. Perfect for our electrical projects.",
                    "Outstanding {product}! Consistent gauge throughout the entire spool. Zero defects in our large order. Highly professional supplier!",
                    "Premium {product}! Tested all samples - conductivity is perfect, no breaks or weak points. Best wire supplier we've found.",
                ],
                4 => [
                    "Good quality {product}. Minor inconsistency in one spool but overall excellent. Fast shipping and well-packaged.",
                    "Quality {product} that meets our needs. Slight color difference but performance is solid. Would order again.",
                ],
                3 => [
                    "Average {product}. Acceptable for basic applications. Had some issues with insulation thickness on a few meters.",
                ],
            ],
            'furniture' => [
                5 => [
                    "Amazing {product}! Solid construction, beautiful finish. Customers praise the quality. Zero assembly issues in 50+ units.",
                    "Exceptional {product}! Sturdy build, premium materials. Packaging was excellent - no damage. Will definitely reorder!",
                    "Top quality {product}! Easy assembly, strong joints, attractive design. Our showroom sales increased significantly.",
                ],
                4 => [
                    "Good {product}. Minor scratches on 2 pieces but supplier sent replacements. Overall satisfied with the quality.",
                    "Quality {product} for the price. Assembly instructions could be clearer but final result is solid.",
                ],
                3 => [
                    "Average {product}. Acceptable quality but had some loose screws. Need better quality control.",
                ],
            ],
            'hair_clipper' => [
                5 => [
                    "Professional grade {product}! Powerful motor, sharp blades, long battery life. Our barbershop clients love it!",
                    "Excellent {product}! Zero-gap blade adjustment works perfectly. Quiet motor, ergonomic design. Best clipper we've sourced.",
                    "Outstanding {product}! Cordless convenience with professional performance. Customers report 2+ hours battery life.",
                ],
                4 => [
                    "Good quality {product}. Blade sharpness is good but could improve battery indicator. Overall satisfied.",
                    "Solid {product} for the price. Works well for most hair types. Minor vibration at high speed but manageable.",
                ],
                3 => [
                    "Average {product}. Functional but motor gets warm after 30 minutes. Acceptable for budget segment.",
                ],
            ],
            'metal' => [
                5 => [
                    "Premium quality {product}! Precise dimensions, clean edges, rust-resistant coating. Perfect for our manufacturing needs.",
                    "Excellent {product}! Consistent thickness throughout, no warping. Welds beautifully. Professional industrial supplier!",
                    "Top-grade {product}! Meets all ASTM standards. Surface finish is smooth. Zero defects in large order.",
                ],
                4 => [
                    "Good {product}. Minor surface scratches on a few pieces but supplier offered discount. Overall quality is solid.",
                    "Quality {product} that meets our specs. Slight variation in thickness but within tolerance. Would order again.",
                ],
                3 => [
                    "Average {product}. Acceptable for non-critical applications. Had some rust spots on edges.",
                ],
            ],
            'machinery' => [
                5 => [
                    "Exceptional {product}! Well-engineered, smooth operation, durable construction. Technical support is excellent!",
                    "Outstanding {product}! Exceeded performance specs. Installation was straightforward. Great value for industrial use.",
                    "Premium {product}! Heavy-duty build, precise machining. Running 24/7 with zero issues. Highly recommend!",
                ],
                4 => [
                    "Good {product}. Minor calibration needed on arrival but works great now. Supplier provided good support.",
                    "Quality {product} for the price. Performance is solid, maintenance manual could be more detailed.",
                ],
                3 => [
                    "Average {product}. Functional but had some loose bolts on arrival. Needs better quality control.",
                ],
            ],
        ];

        // Default template for uncategorized products
        $defaultTemplates = [
            5 => [
                "Excellent {product}! Quality exceeds expectations. Professional service and fast shipping. Highly recommend!",
                "Outstanding {product}! Great value for money. Our customers are very satisfied. Will order again!",
                "Premium quality {product}! Well-packaged, no defects. Supplier is responsive and professional.",
            ],
            4 => [
                "Good {product}. Minor issues but overall satisfied. Supplier was quick to resolve concerns.",
                "Quality {product} for the price. Met our basic requirements. Would consider ordering again.",
            ],
            3 => [
                "Average {product}. Acceptable but room for improvement. Delivery was on time.",
            ],
        ];

        $categoryTemplates = $templates[strtolower($category)] ?? $defaultTemplates;
        $ratingTemplates = $categoryTemplates[$rating] ?? $defaultTemplates[$rating] ?? $defaultTemplates[5];
        
        $template = $ratingTemplates[array_rand($ratingTemplates)];
        return str_replace('{product}', $productName, $template);
    }

    /**
     * Generate review title based on rating
     */
    private function getReviewTitle($rating)
    {
        $titles = [
            5 => [
                'Excellent Quality and Service',
                'Highly Recommended Supplier',
                'Outstanding Products',
                'Professional and Reliable',
                'Top-Tier Quality',
                'Best Supplier Experience',
                'Exceeded Expectations',
                'Five Stars All Around',
            ],
            4 => [
                'Good Quality Products',
                'Satisfied with Purchase',
                'Reliable Supplier',
                'Good Value for Money',
                'Would Order Again',
                'Solid Performance',
            ],
            3 => [
                'Average Quality',
                'Acceptable Products',
                'Room for Improvement',
                'Mixed Experience',
            ],
        ];

        return $titles[$rating][array_rand($titles[$rating])];
    }

    /**
     * Generate supplier response based on rating
     */
    private function getSupplierResponse($rating, $buyerName)
    {
        if ($rating >= 4 && rand(0, 100) < 70) { // 70% chance for good ratings
            $responses = [
                "Thank you {buyer} for your continued trust! We're committed to maintaining the highest quality standards.",
                "We appreciate your business, {buyer}! Looking forward to serving you again.",
                "Thank you for the positive feedback, {buyer}! We're glad we could meet your expectations.",
                "We're thrilled to hear this, {buyer}! Your satisfaction is our top priority.",
                "Thank you {buyer}! We look forward to a long-term partnership.",
            ];
            return str_replace('{buyer}', explode(' ', $buyerName)[0], $responses[array_rand($responses)]);
        } elseif ($rating == 3 && rand(0, 100) < 90) { // 90% chance for average ratings
            $responses = [
                "Thank you for your feedback. We're working on improvements and hope to serve you better next time.",
                "We appreciate your honest review. We'll address the issues you mentioned.",
                "Thank you for bringing this to our attention. We're committed to improving our service.",
            ];
            return $responses[array_rand($responses)];
        }
        
        return null;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("🌱 Starting Smart Reviews Seeding...");
        $this->command->newLine();

        // Get all companies with products
        $companies = Company::whereHas('products')->with('products')->get();
        
        if ($companies->isEmpty()) {
            $this->command->error('❌ No companies with products found. Please add products first.');
            return;
        }

        $totalReviewsCreated = 0;
        $companiesProcessed = 0;

        foreach ($companies as $company) {
            $products = $company->products;
            
            if ($products->isEmpty()) {
                continue;
            }

            // Generate 3-10 reviews per company (based on how many products they have)
            $reviewCount = min(rand(3, 10), $products->count() * 3);
            
            $this->command->info("📊 {$company->name}: Generating {$reviewCount} reviews...");
            
            $usedBuyers = [];
            $reviewsForCompany = 0;

            for ($i = 0; $i < $reviewCount; $i++) {
                // Select random buyer (avoid repeats for same company)
                do {
                    $buyer = $this->buyers[array_rand($this->buyers)];
                } while (in_array($buyer['email'], $usedBuyers) && count($usedBuyers) < count($this->buyers));
                
                $usedBuyers[] = $buyer['email'];

                // Select random product from this company
                $product = $products->random();

                // Generate rating (weighted towards higher ratings - 70% are 4-5 stars)
                $rand = rand(1, 100);
                if ($rand <= 50) {
                    $rating = 5;
                } elseif ($rand <= 85) {
                    $rating = 4;
                } else {
                    $rating = 3;
                }

                // Generate review
                $comment = $this->getProductReviewTemplates($product->category, $product->name, $rating);
                $title = $this->getReviewTitle($rating);
                $response = $this->getSupplierResponse($rating, $buyer['name']);

                // Random date within last 6 months
                $daysAgo = rand(1, 180);
                $createdAt = Carbon::now()->subDays($daysAgo);
                
                // If there's a response, it should be a few days after the review
                $responseDate = null;
                if ($response) {
                    $responseDate = $createdAt->copy()->addDays(rand(1, 7));
                }

                // 80% verified for purchases
                $verified = rand(1, 100) <= 80;

                Review::create([
                    'company_id' => $company->id,
                    'product_id' => $product->id, // Link to specific product
                    'order_id' => null, // Can be linked to orders later
                    'reviewer_name' => $buyer['name'],
                    'reviewer_email' => $buyer['email'],
                    'reviewer_company' => $buyer['company'],
                    'rating' => $rating,
                    'title' => $title,
                    'comment' => $comment,
                    'verified' => $verified,
                    'response' => $response,
                    'response_date' => $responseDate,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $reviewsForCompany++;
                $totalReviewsCreated++;
            }

            // Display statistics for this company
            $avgRating = Review::where('company_id', $company->id)->avg('rating');
            $verifiedCount = Review::where('company_id', $company->id)->where('verified', true)->count();
            
            $this->command->info("   ✅ Created {$reviewsForCompany} reviews");
            $this->command->info("   ⭐ Average Rating: " . round($avgRating, 1) . "/5");
            $this->command->info("   ✓ Verified: {$verifiedCount}/{$reviewsForCompany}");
            $this->command->newLine();

            $companiesProcessed++;
        }

        $this->command->newLine();
        $this->command->info("🎉 Seeding Complete!");
        $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->command->info("📈 Total Reviews Created: {$totalReviewsCreated}");
        $this->command->info("🏢 Companies with Reviews: {$companiesProcessed}");
        $this->command->info("⭐ Overall Average Rating: " . round(Review::avg('rating'), 1) . "/5");
        $this->command->info("✓ Total Verified Reviews: " . Review::where('verified', true)->count());
        $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
}

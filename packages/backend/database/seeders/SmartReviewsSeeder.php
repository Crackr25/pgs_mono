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
     * Generate high rating (4.5-5.0) with weighted distribution
     */
    private function getHighRating()
    {
        $ratings = [
            4.5 => 5,   // 5% chance
            4.6 => 8,   // 8% chance
            4.7 => 12,  // 12% chance
            4.8 => 20,  // 20% chance
            4.9 => 25,  // 25% chance
            5.0 => 30   // 30% chance
        ];

        $weighted = [];
        foreach ($ratings as $rating => $weight) {
            $weighted = array_merge($weighted, array_fill(0, $weight, $rating));
        }

        return $weighted[array_rand($weighted)];
    }

    /**
     * Product-specific positive review templates
     */
    private function getProductReviewTemplates($category, $productName, $rating)
    {
        $templates = [
            'apparel' => [
                5.0 => [
                    "Excellent quality {product}! The fabric is soft and durable. Our customers love the fit and style. Will definitely order more for next season.",
                    "Outstanding {product}! Perfect for our retail chain. The materials are high-quality and the stitching is impeccable. Highly recommend this supplier!",
                    "Best {product} we've sourced! Great attention to detail, comfortable fabric, and true to size. Our repeat order rate is very high.",
                ],
                4.9 => [
                    "Excellent {product}! Top-tier quality fabric and stitching. Customers consistently praise the comfort and durability.",
                    "Outstanding {product}! Premium materials and craftsmanship. Our retail partners keep requesting more inventory.",
                ],
                4.8 => [
                    "Exceptional {product}! Superior quality and attention to detail. Very satisfied with this order.",
                    "Top quality {product}! Excellent fabric and finish. Our customers are very happy with the purchase.",
                ],
                4.7 => [
                    "Excellent {product}! Great quality and design. Very satisfied with this purchase and will order again.",
                    "Impressive {product}! High-quality materials and construction. Customers appreciate the value.",
                ],
                4.6 => [
                    "Very good {product}. High quality materials and good finishing. Minor color variation but overall excellent.",
                    "Great quality {product}! Slight difference from sample but performance and durability are solid.",
                ],
                4.5 => [
                    "Good quality {product}. Slight color variation from sample but overall satisfied. Fast shipping and good packaging.",
                    "The {product} meets our expectations. Quality is good for the price point. Would order again with minor adjustments.",
                ],
            ],
            'electronics' => [
                5.0 => [
                    "Exceptional {product}! All units tested and working perfectly. Build quality exceeds expectations. Great supplier for electronics!",
                    "Premium quality {product}. Very well-packaged, no defects in our 500-unit order. Customer service is responsive and professional.",
                    "Top-tier {product}! Battery life is excellent, build is solid. Our customers are extremely satisfied. Will place larger orders.",
                ],
                4.9 => [
                    "Outstanding {product}! Excellent build quality and performance. Zero defects in our large order. Highly professional supplier!",
                    "Professional grade {product}! Superior performance and reliability. Our clients are extremely satisfied.",
                ],
                4.8 => [
                    "Exceptional {product}! High-quality components and excellent assembly. Very impressed with consistency.",
                    "Top quality {product}! Performs beyond specifications. Great value for professional use.",
                ],
                4.7 => [
                    "Excellent {product}! Great performance and build quality. Very satisfied with this supplier.",
                    "Impressive {product}! Solid construction and reliable operation. Will definitely reorder.",
                ],
                4.6 => [
                    "Very good {product}. Excellent performance with minor packaging improvements needed. Overall highly satisfied.",
                    "Great quality {product}! Performance is solid. One unit had cosmetic issue but supplier replaced immediately.",
                ],
                4.5 => [
                    "Good {product}. One or two units had minor issues but supplier replaced them quickly. Overall satisfied with the order.",
                    "Solid {product}. Meets specifications, delivery was fast. Minor discrepancy in accessories but manageable.",
                ],
            ],
            'conductor' => [
                5.0 => [
                    "Excellent quality {product}! Copper purity meets specifications, insulation is durable. Perfect for our electrical projects.",
                    "Outstanding {product}! Consistent gauge throughout the entire spool. Zero defects in our large order. Highly professional supplier!",
                    "Premium {product}! Tested all samples - conductivity is perfect, no breaks or weak points. Best wire supplier we've found.",
                ],
                4.9 => [
                    "Exceptional {product}! Superior conductivity and insulation quality. Professional-grade materials throughout.",
                    "Outstanding {product}! Excellent consistency and quality control. Will be our primary supplier.",
                ],
                4.8 => [
                    "Top quality {product}! Excellent conductivity and durability. Very satisfied with this purchase.",
                    "Premium {product}! Great specifications and consistent quality throughout the order.",
                ],
                4.7 => [
                    "Excellent {product}! High-quality materials and good consistency. Very pleased with the results.",
                    "Impressive {product}! Solid performance and reliable quality. Highly recommend.",
                ],
                4.6 => [
                    "Very good {product}. Excellent quality with minor packaging concerns. Product itself is top-notch.",
                    "Great quality {product}! Slight variation in one section but overall excellent performance.",
                ],
                4.5 => [
                    "Good quality {product}. Minor inconsistency in one spool but overall excellent. Fast shipping and well-packaged.",
                    "Quality {product} that meets our needs. Slight color difference but performance is solid. Would order again.",
                ],
            ],
            'furniture' => [
                5.0 => [
                    "Amazing {product}! Solid construction, beautiful finish. Customers praise the quality. Zero assembly issues in 50+ units.",
                    "Exceptional {product}! Sturdy build, premium materials. Packaging was excellent - no damage. Will definitely reorder!",
                    "Top quality {product}! Easy assembly, strong joints, attractive design. Our showroom sales increased significantly.",
                ],
                4.9 => [
                    "Outstanding {product}! Excellent craftsmanship and premium materials. Customers are thrilled with the quality.",
                    "Exceptional {product}! Superior build quality and beautiful design. Zero complaints from customers.",
                ],
                4.8 => [
                    "Top-tier {product}! Excellent construction and materials. Very impressed with the quality control.",
                    "Premium {product}! Great craftsmanship and sturdy build. Customers love the design.",
                ],
                4.7 => [
                    "Excellent {product}! High-quality construction and attractive finish. Very satisfied with this order.",
                    "Impressive {product}! Solid build and good materials. Will definitely order more.",
                ],
                4.6 => [
                    "Very good {product}. Excellent quality with minor cosmetic issue on one piece. Supplier replaced promptly.",
                    "Great quality {product}! Sturdy construction. Minor packaging issue but product is perfect.",
                ],
                4.5 => [
                    "Good {product}. Minor scratches on 2 pieces but supplier sent replacements. Overall satisfied with the quality.",
                    "Quality {product} for the price. Assembly instructions could be clearer but final result is solid.",
                ],
            ],
            'hair_clipper' => [
                5.0 => [
                    "Professional grade {product}! Powerful motor, sharp blades, long battery life. Our barbershop clients love it!",
                    "Excellent {product}! Zero-gap blade adjustment works perfectly. Quiet motor, ergonomic design. Best clipper we've sourced.",
                    "Outstanding {product}! Cordless convenience with professional performance. Customers report 2+ hours battery life.",
                ],
                4.9 => [
                    "Exceptional {product}! Professional-grade performance and build quality. Battery life exceeds 2 hours consistently.",
                    "Outstanding {product}! Superior motor power and blade sharpness. Our professional clients are extremely satisfied.",
                ],
                4.8 => [
                    "Top quality {product}! Excellent performance and ergonomics. Battery life is impressive.",
                    "Premium {product}! Great motor power and blade quality. Very satisfied with this purchase.",
                ],
                4.7 => [
                    "Excellent {product}! High performance and good build quality. Very pleased with the results.",
                    "Impressive {product}! Solid performance and comfortable grip. Highly recommend.",
                ],
                4.6 => [
                    "Very good {product}. Excellent performance with minor ergonomic improvements possible. Overall great clipper.",
                    "Great quality {product}! Performance is solid. Battery indicator could be better but functionality is excellent.",
                ],
                4.5 => [
                    "Good quality {product}. Blade sharpness is good but could improve battery indicator. Overall satisfied.",
                    "Solid {product} for the price. Works well for most hair types. Minor vibration at high speed but manageable.",
                ],
            ],
            'metal' => [
                5.0 => [
                    "Premium quality {product}! Precise dimensions, clean edges, rust-resistant coating. Perfect for our manufacturing needs.",
                    "Excellent {product}! Consistent thickness throughout, no warping. Welds beautifully. Professional industrial supplier!",
                    "Top-grade {product}! Meets all ASTM standards. Surface finish is smooth. Zero defects in large order.",
                ],
                4.9 => [
                    "Outstanding {product}! Exceptional precision and quality. Surface finish is flawless. Professional-grade supplier!",
                    "Excellent {product}! Superior quality and consistency. Meets all specifications perfectly.",
                ],
                4.8 => [
                    "Top quality {product}! Excellent precision and finish. Very satisfied with this order.",
                    "Premium {product}! Great consistency and quality control throughout the shipment.",
                ],
                4.7 => [
                    "Excellent {product}! High-quality materials and good finish. Very pleased with the results.",
                    "Impressive {product}! Solid quality and precise dimensions. Highly recommend.",
                ],
                4.6 => [
                    "Very good {product}. Excellent quality with minor edge roughness on few pieces. Overall top-notch.",
                    "Great quality {product}! Slight variation in finish but performance and durability are solid.",
                ],
                4.5 => [
                    "Good {product}. Minor surface scratches on a few pieces but supplier offered discount. Overall quality is solid.",
                    "Quality {product} that meets our specs. Slight variation in thickness but within tolerance. Would order again.",
                ],
            ],
            'machinery' => [
                5.0 => [
                    "Exceptional {product}! Well-engineered, smooth operation, durable construction. Technical support is excellent!",
                    "Outstanding {product}! Exceeded performance specs. Installation was straightforward. Great value for industrial use.",
                    "Premium {product}! Heavy-duty build, precise machining. Running 24/7 with zero issues. Highly recommend!",
                ],
                4.9 => [
                    "Outstanding {product}! Exceptional build quality and performance. Zero downtime since installation.",
                    "Excellent {product}! Superior engineering and reliability. Technical support is outstanding.",
                ],
                4.8 => [
                    "Top-tier {product}! Excellent performance and durability. Very impressed with the engineering.",
                    "Premium {product}! Great build quality and smooth operation. Highly satisfied.",
                ],
                4.7 => [
                    "Excellent {product}! High-quality construction and reliable operation. Very pleased with this purchase.",
                    "Impressive {product}! Solid performance and good engineering. Will order more.",
                ],
                4.6 => [
                    "Very good {product}. Excellent performance with minor setup adjustments needed. Overall great machine.",
                    "Great quality {product}! Performance is solid. Manual could be more detailed but machine works perfectly.",
                ],
                4.5 => [
                    "Good {product}. Minor calibration needed on arrival but works great now. Supplier provided good support.",
                    "Quality {product} for the price. Performance is solid, maintenance manual could be more detailed.",
                ],
            ],
        ];

        // Default template for uncategorized products
        $defaultTemplates = [
            5.0 => [
                "Excellent {product}! Quality exceeds expectations. Professional service and fast shipping. Highly recommend!",
                "Outstanding {product}! Great value for money. Our customers are very satisfied. Will order again!",
                "Premium quality {product}! Well-packaged, no defects. Supplier is responsive and professional.",
            ],
            4.9 => [
                "Exceptional {product}! Top-tier quality and excellent service. Highly satisfied with this purchase.",
                "Outstanding {product}! Superior quality and professional packaging. Will definitely reorder.",
            ],
            4.8 => [
                "Top quality {product}! Excellent craftsmanship and materials. Very impressed.",
                "Premium {product}! Great quality control and fast delivery. Highly satisfied.",
            ],
            4.7 => [
                "Excellent {product}! High quality and good value. Very pleased with this order.",
                "Impressive {product}! Solid quality and reliable supplier. Recommend.",
            ],
            4.6 => [
                "Very good {product}. Excellent quality with minor improvements possible. Overall great.",
                "Great quality {product}! Performance is solid. Very satisfied overall.",
            ],
            4.5 => [
                "Good {product}. Minor issues but overall satisfied. Supplier was quick to resolve concerns.",
                "Quality {product} for the price. Met our basic requirements. Would consider ordering again.",
            ],
        ];

        $categoryTemplates = $templates[strtolower($category)] ?? $defaultTemplates;
        $ratingTemplates = $categoryTemplates[$rating] ?? $defaultTemplates[$rating] ?? $defaultTemplates[5.0];
        
        $template = $ratingTemplates[array_rand($ratingTemplates)];
        return str_replace('{product}', $productName, $template);
    }

    /**
     * Generate review title based on rating
     */
    private function getReviewTitle($rating)
    {
        $titles = [
            5.0 => [
                'Excellent Quality and Service',
                'Highly Recommended Supplier',
                'Outstanding Products',
                'Professional and Reliable',
                'Top-Tier Quality',
                'Best Supplier Experience',
                'Exceeded Expectations',
                'Five Stars All Around',
                'Perfect in Every Way',
                'Absolutely Recommended',
            ],
            4.9 => [
                'Exceptional Quality',
                'Highly Recommended',
                'Top Quality Products',
                'Excellent Service',
                'Outstanding Experience',
                'Five Stars',
            ],
            4.8 => [
                'Outstanding Products',
                'Exceptional Quality',
                'Highly Recommended',
                'Top Quality',
                'Premium Product',
                'Excellent Value',
            ],
            4.7 => [
                'Excellent Product',
                'Very Satisfied',
                'Great Quality',
                'Impressive Product',
                'Superior Quality',
                'Outstanding Value',
            ],
            4.6 => [
                'Very Good Quality',
                'Great Product',
                'Highly Satisfied',
                'Good Experience',
                'Quality Product',
                'Reliable Quality',
            ],
            4.5 => [
                'Good Quality Products',
                'Satisfied with Purchase',
                'Good Value for Money',
                'Would Order Again',
                'Reliable Supplier',
                'Solid Performance',
            ],
        ];

        return $titles[$rating][array_rand($titles[$rating])];
    }

    /**
     * Generate supplier response based on rating (all high ratings now)
     */
    private function getSupplierResponse($rating, $buyerName)
    {
        // 75% chance for ratings 4.7 and above, 60% for 4.5-4.6
        $responseChance = $rating >= 4.7 ? 75 : 60;
        
        if (rand(0, 100) < $responseChance) {
            $responses = [
                "Thank you {buyer} for your continued trust! We're committed to maintaining the highest quality standards.",
                "We appreciate your business, {buyer}! Looking forward to serving you again.",
                "Thank you for the positive feedback, {buyer}! We're glad we could meet your expectations.",
                "We're thrilled to hear this, {buyer}! Your satisfaction is our top priority.",
                "Thank you {buyer}! We look forward to a long-term partnership.",
                "We appreciate your kind words, {buyer}! Quality is our commitment to every client.",
                "Thank you {buyer}! We're honored to be your trusted supplier.",
            ];
            return str_replace('{buyer}', explode(' ', $buyerName)[0], $responses[array_rand($responses)]);
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

                // Generate high rating (4.5-5.0 only)
                $rating = $this->getHighRating();

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

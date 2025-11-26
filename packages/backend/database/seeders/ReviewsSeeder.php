<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Company;
use Carbon\Carbon;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first company (or change this to your specific company)
        $company = Company::first();
        
        if (!$company) {
            $this->command->error('No company found. Please create a company first.');
            return;
        }
        
        $this->command->info("Seeding reviews for company: {$company->company_name}");
        
        $reviews = [
            [
                'reviewer_name' => 'John Smith',
                'reviewer_email' => 'john.smith@abcmfg.com',
                'reviewer_company' => 'ABC Manufacturing Co.',
                'rating' => 5,
                'title' => 'Excellent Quality and Service',
                'comment' => 'We have been sourcing from this supplier for over 2 years now. Their product quality is consistently excellent, and their customer service team is always responsive. Highly recommended for bulk orders!',
                'verified' => true,
                'response' => 'Thank you for your continued trust in our products! We\'re happy to serve you.',
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'reviewer_name' => 'Maria Garcia',
                'reviewer_email' => 'maria.g@techsolutions.com',
                'reviewer_company' => 'Tech Solutions Ltd.',
                'rating' => 4,
                'title' => 'Good Products, Fast Shipping',
                'comment' => 'The products arrived well-packaged and on time. Quality meets our expectations. Would order again. Only minor issue was communication delay during holidays.',
                'verified' => true,
                'response' => null,
                'created_at' => Carbon::now()->subDays(12),
            ],
            [
                'reviewer_name' => 'David Chen',
                'reviewer_email' => 'david@globaltrading.com',
                'reviewer_company' => 'Global Trading Corp',
                'rating' => 5,
                'title' => 'Outstanding Supplier Partner',
                'comment' => 'Professional team, competitive pricing, and excellent after-sales support. They helped us customize products to meet our specific requirements. 10/10 would recommend.',
                'verified' => true,
                'response' => 'We appreciate your business and look forward to continuing our partnership!',
                'created_at' => Carbon::now()->subDays(20),
            ],
            [
                'reviewer_name' => 'Sarah Johnson',
                'reviewer_email' => 'sarah.j@industryplus.com',
                'reviewer_company' => 'Industry Plus Inc.',
                'rating' => 4,
                'title' => 'Reliable Supplier',
                'comment' => 'We placed a large order and everything went smoothly. The quality control is clearly visible in their products. Delivery was on schedule.',
                'verified' => false,
                'response' => null,
                'created_at' => Carbon::now()->subDays(30),
            ],
            [
                'reviewer_name' => 'Ahmed Hassan',
                'reviewer_email' => 'ahmed@middleeastimports.com',
                'reviewer_company' => 'Middle East Imports',
                'rating' => 5,
                'title' => 'Best in the Industry',
                'comment' => 'After trying multiple suppliers, we finally found the right one. Their attention to detail and commitment to quality is unmatched. The products exceed our expectations every time.',
                'verified' => true,
                'response' => 'Thank you for choosing us! We\'re committed to maintaining the highest standards.',
                'created_at' => Carbon::now()->subDays(45),
            ],
            [
                'reviewer_name' => 'Emily Brown',
                'reviewer_email' => 'emily@constructionpro.com',
                'reviewer_company' => 'Construction Pro LLC',
                'rating' => 3,
                'title' => 'Decent Quality, Average Service',
                'comment' => 'Products are okay for the price. Shipping took longer than expected. Customer service could be more proactive in updates.',
                'verified' => true,
                'response' => 'We apologize for the delay. We\'re working on improving our logistics and communication.',
                'created_at' => Carbon::now()->subDays(60),
            ],
            [
                'reviewer_name' => 'Robert Wilson',
                'reviewer_email' => 'robert@innovativesystems.com',
                'reviewer_company' => 'Innovative Systems',
                'rating' => 5,
                'title' => 'Highly Professional',
                'comment' => 'Their sales team was very helpful in guiding us through the product selection process. The final products were exactly what we needed. Great experience overall!',
                'verified' => true,
                'response' => null,
                'created_at' => Carbon::now()->subDays(75),
            ],
            [
                'reviewer_name' => 'Lisa Anderson',
                'reviewer_email' => 'lisa@retailchain.com',
                'reviewer_company' => 'Retail Chain Group',
                'rating' => 4,
                'title' => 'Good for Wholesale Orders',
                'comment' => 'We ordered a large quantity for our retail stores. Products arrived in good condition, pricing was competitive, and quality was consistent across all units.',
                'verified' => false,
                'response' => 'Thank you! We\'re glad we could meet your wholesale needs.',
                'created_at' => Carbon::now()->subDays(90),
            ],
            [
                'reviewer_name' => 'Michael Taylor',
                'reviewer_email' => 'michael@engineeringworks.com',
                'reviewer_company' => 'Engineering Works Ltd.',
                'rating' => 5,
                'title' => 'Technical Excellence',
                'comment' => 'As engineers, we have strict quality requirements. This supplier consistently delivers products that meet our technical specifications. Their quality control process is impressive.',
                'verified' => true,
                'response' => 'We take pride in our quality standards. Thank you for recognizing our efforts!',
                'created_at' => Carbon::now()->subDays(105),
            ],
            [
                'reviewer_name' => 'Jennifer Lee',
                'reviewer_email' => 'jennifer@distributioncenter.com',
                'reviewer_company' => 'Distribution Center Asia',
                'rating' => 4,
                'title' => 'Solid Partnership',
                'comment' => 'We have been working with them for several months now. Consistent quality, fair pricing, and good communication. Looking forward to a long-term partnership.',
                'verified' => true,
                'response' => null,
                'created_at' => Carbon::now()->subDays(120),
            ],
        ];
        
        $count = 0;
        foreach ($reviews as $reviewData) {
            $reviewData['company_id'] = $company->id;
            Review::create($reviewData);
            $count++;
        }
        
        $this->command->info("Successfully seeded {$count} reviews for company: {$company->company_name}");
        
        // Display statistics
        $avgRating = Review::where('company_id', $company->id)->avg('rating');
        $verifiedCount = Review::where('company_id', $company->id)->where('verified', true)->count();
        
        $this->command->info("Average Rating: " . round($avgRating, 1));
        $this->command->info("Verified Reviews: {$verifiedCount}/{$count}");
    }
}

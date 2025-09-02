<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\Company;
use App\Models\Product;
use Carbon\Carbon;

class QuoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing companies and products for relationships
        $companies = Company::all();
        $products = Product::all();

        if ($companies->isEmpty()) {
            $this->command->warn('No companies found. Creating sample companies first...');
            // Create some sample companies if none exist
            $companies = Company::factory(10)->create();
        }

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Creating sample products first...');
            // Create some sample products if none exist
            $products = Product::factory(20)->create();
        }

        $this->command->info('Creating sample quotes...');

        // Create 50 quotes with different statuses
        
        // 20 pending quotes
        Quote::factory(20)
            ->pending()
            ->create([
                'company_id' => $companies->random()->id,
                'product_id' => $products->random()->id,
            ]);

        // 15 responded quotes
        Quote::factory(15)
            ->responded()
            ->create([
                'company_id' => $companies->random()->id,
                'product_id' => $products->random()->id,
            ]);

        // 10 accepted quotes
        Quote::factory(10)
            ->accepted()
            ->create([
                'company_id' => $companies->random()->id,
                'product_id' => $products->random()->id,
            ]);

        // 5 rejected quotes
        Quote::factory(5)->create([
            'company_id' => $companies->random()->id,
            'product_id' => $products->random()->id,
            'status' => 'rejected',
            'response_message' => 'Thank you for your inquiry. Unfortunately, we cannot meet your requirements at this time.',
            'quoted_price' => null,
            'quoted_lead_time' => null,
        ]);

        // Create some specific sample quotes with realistic data
        $sampleQuotes = [
            [
                'buyer_name' => 'John Smith',
                'buyer_email' => 'john.smith@techcorp.com',
                'buyer_company' => 'TechCorp Solutions',
                'quantity' => 1000,
                'target_price' => 25.50,
                'message' => 'We need 1000 units of custom electronic components for our new product line. Please provide your best quote including tooling costs.',
                'status' => 'pending',
                'deadline' => Carbon::now()->addDays(30),
            ],
            [
                'buyer_name' => 'Sarah Johnson',
                'buyer_email' => 'sarah.j@globalmanuf.com',
                'buyer_company' => 'Global Manufacturing Inc.',
                'quantity' => 5000,
                'target_price' => 12.75,
                'message' => 'Looking for a long-term supplier for industrial machinery parts. Volume discounts expected.',
                'status' => 'responded',
                'response_message' => 'Thank you for your inquiry. We can offer $11.50 per unit for quantities over 5000 units with a lead time of 3-4 weeks.',
                'quoted_price' => 11.50,
                'quoted_lead_time' => '3-4 weeks',
                'deadline' => Carbon::now()->addDays(45),
            ],
            [
                'buyer_name' => 'Michael Chen',
                'buyer_email' => 'm.chen@pacifictrading.com',
                'buyer_company' => 'Pacific Trading Co.',
                'quantity' => 500,
                'target_price' => 89.99,
                'message' => 'Urgent requirement for textile machinery components. Quality certifications required.',
                'status' => 'accepted',
                'response_message' => 'We can provide high-quality components meeting all your specifications. Price: $85.00 per unit.',
                'quoted_price' => 85.00,
                'quoted_lead_time' => '2-3 weeks',
                'deadline' => Carbon::now()->addDays(15),
            ],
        ];

        foreach ($sampleQuotes as $quoteData) {
            Quote::create(array_merge($quoteData, [
                'company_id' => $companies->random()->id,
                'product_id' => $products->random()->id,
            ]));
        }

        $this->command->info('Quote seeding completed successfully!');
        $this->command->info('Created:');
        $this->command->info('- 20 pending quotes');
        $this->command->info('- 15 responded quotes');
        $this->command->info('- 10 accepted quotes');
        $this->command->info('- 5 rejected quotes');
        $this->command->info('- 3 specific sample quotes');
        $this->command->info('Total: ' . Quote::count() . ' quotes');
    }
}

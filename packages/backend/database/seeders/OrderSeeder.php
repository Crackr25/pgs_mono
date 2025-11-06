<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Company;
use App\Models\Quote;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing companies and quotes for relationships
        $companies = Company::all();
        $quotes = Quote::all();

        if ($companies->isEmpty()) {
            $this->command->warn('No companies found. Please run CompanySeeder first.');
            return;
        }

        $orderStatuses = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'];
        $paymentStatuses = ['pending', 'partial', 'paid', 'refunded'];
        
        $sampleProducts = [
            'Custom Electronic Components',
            'Industrial Machinery Parts',
            'Textile Products',
            'Automotive Components',
            'Medical Device Components',
            'Food Processing Equipment',
            'Packaging Materials',
            'Construction Hardware',
            'Furniture Components',
            'Plastic Injection Molded Parts'
        ];

        $sampleBuyerCompanies = [
            'TechCorp Solutions',
            'Global Manufacturing Inc.',
            'Industrial Dynamics Ltd.',
            'Pacific Trading Co.',
            'Metro Electronics',
            'Advanced Systems Corp.',
            'Premier Industries',
            'Apex Manufacturing',
            'Delta Components',
            'Omega Technologies'
        ];

        $sampleAddresses = [
            '123 Business District, Makati City, Metro Manila, Philippines',
            '456 Industrial Ave, Quezon City, Metro Manila, Philippines',
            '789 Commerce Street, Cebu City, Cebu, Philippines',
            '321 Trade Center, Davao City, Davao del Sur, Philippines',
            '654 Export Zone, Laguna, Calabarzon, Philippines',
            '987 Manufacturing Hub, Bataan, Central Luzon, Philippines',
            '147 Technology Park, Iloilo City, Western Visayas, Philippines',
            '258 Business Plaza, Cagayan de Oro, Northern Mindanao, Philippines'
        ];

        // Create 50 sample orders
        for ($i = 1; $i <= 50; $i++) {
            $company = $companies->random();
            $quote = $quotes->where('company_id', $company->id)->first();
            $status = fake()->randomElement($orderStatuses);
            $paymentStatus = fake()->randomElement($paymentStatuses);
            $quantity = fake()->numberBetween(100, 10000);
            $unitPrice = fake()->randomFloat(2, 5, 500);
            $totalAmount = $quantity * $unitPrice;
            
            // Set progress based on status
            $progress = match($status) {
                'pending' => fake()->numberBetween(0, 10),
                'confirmed' => fake()->numberBetween(10, 25),
                'in_production' => fake()->numberBetween(25, 80),
                'shipped' => fake()->numberBetween(80, 95),
                'delivered' => 100,
                'cancelled' => fake()->numberBetween(0, 50),
                default => 0
            };

            // Set estimated delivery based on status
            $estimatedDelivery = match($status) {
                'pending', 'confirmed' => Carbon::now()->addDays(fake()->numberBetween(30, 90)),
                'in_production' => Carbon::now()->addDays(fake()->numberBetween(15, 60)),
                'shipped' => Carbon::now()->addDays(fake()->numberBetween(1, 14)),
                'delivered' => Carbon::now()->subDays(fake()->numberBetween(1, 30)),
                'cancelled' => null,
                default => Carbon::now()->addDays(fake()->numberBetween(30, 90))
            };

            Order::create([
                'quote_id' => $quote ? $quote->id : null,
                'company_id' => $company->id,
                'order_number' => 'ORD-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'product_name' => fake()->randomElement($sampleProducts),
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'estimated_delivery' => $estimatedDelivery,
                'progress' => $progress,
                'buyer_name' => fake()->name(),
                'buyer_email' => fake()->companyEmail(),
                'buyer_company' => fake()->randomElement($sampleBuyerCompanies),
                'shipping_address' => fake()->randomElement($sampleAddresses),
                'notes' => fake()->optional(0.7)->paragraph(),
                'created_at' => Carbon::now()->subDays(fake()->numberBetween(1, 180)),
                'updated_at' => Carbon::now()->subDays(fake()->numberBetween(0, 30))
            ]);
        }

        $this->command->info('Created 50 sample orders successfully!');
    }
}

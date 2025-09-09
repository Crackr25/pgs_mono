<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RfqResponse;
use App\Models\Rfq;
use App\Models\User;

class RfqResponseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some RFQs and users to create responses for
        $rfqs = Rfq::take(3)->get();
        $suppliers = User::take(3)->get(); // Just use any users for now

        if ($rfqs->isEmpty() || $suppliers->isEmpty()) {
            $this->command->info('No RFQs or suppliers found. Please seed them first.');
            return;
        }

        foreach ($rfqs as $rfq) {
            // Create 2-4 responses per RFQ
            $responseCount = rand(2, 4);
            $selectedSuppliers = $suppliers->random(min($responseCount, $suppliers->count()));

            foreach ($selectedSuppliers as $supplier) {
                RfqResponse::create([
                    'rfq_id' => $rfq->id,
                    'supplier_id' => $supplier->id,
                    'supplier_company_name' => $supplier->company_name ?? $supplier->name . ' Ltd.',
                    'quoted_price' => rand($rfq->budget_min * 100, $rfq->budget_max * 100) / 100,
                    'lead_time_days' => rand(7, 45),
                    'message' => 'We are pleased to submit our competitive quote for your requirements. We guarantee high quality products with timely delivery.',
                    'terms_conditions' => '30% advance payment, 70% on delivery. Standard warranty applies.',
                    'status' => 'pending',
                    'supplier_rating' => rand(350, 500) / 100, // 3.5 to 5.0 rating
                    'total_orders' => rand(5, 150),
                    'submitted_at' => now()->subDays(rand(1, 7))
                ]);
            }
        }

        $this->command->info('RFQ responses seeded successfully!');
    }
}

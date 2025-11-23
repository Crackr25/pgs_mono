<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class AddSampleLogosSeeder extends Seeder
{
    /**
     * Add sample logo URLs for companies
     */
    public function run(): void
    {
        $this->command->info('Adding sample logos to companies...');

        // You can use placeholder images or real logo URLs
        $companies = Company::whereNull('logo')->take(10)->get();

        foreach ($companies as $index => $company) {
            // Using placeholder service - you can replace with actual logos
            $logoUrl = "https://ui-avatars.com/api/?name=" . urlencode($company->name) . "&size=200&background=random";
            
            $company->update([
                'logo' => $logoUrl
            ]);

            $this->command->info("✓ Added logo to {$company->name}");
        }

        $this->command->info('✅ Sample logos added!');
    }
}

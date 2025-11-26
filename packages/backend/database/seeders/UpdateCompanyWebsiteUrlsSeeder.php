<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\CompanyStorefront;

class UpdateCompanyWebsiteUrlsSeeder extends Seeder
{
    /**
     * Update company website URLs to point to their storefronts
     */
    public function run(): void
    {
        $this->command->info('Updating company website URLs to point to storefronts...');

        $companies = Company::whereHas('storefront')->with('storefront')->get();
        $updated = 0;

        foreach ($companies as $company) {
            if ($company->storefront && $company->storefront->slug) {
                $storefrontUrl = config('app.url') . '/store/' . $company->storefront->slug;
                
                $company->update([
                    'website' => $storefrontUrl
                ]);

                $this->command->info("✓ Updated {$company->name} -> {$storefrontUrl}");
                $updated++;
            }
        }

        $this->command->info("✅ Updated {$updated} company website URLs!");
    }
}

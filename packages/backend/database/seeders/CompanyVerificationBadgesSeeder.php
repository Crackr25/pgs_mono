<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanyVerificationBadgesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Adding verification badges and enhanced info to companies...');

        $certificationAgencies = [
            'TÜVRheinland',
            'SGS',
            'Bureau Veritas',
            'Intertek',
            'DNV GL',
            'UL',
            'TÜV SÜD',
            'BSI Group'
        ];

        $mainCategoriesOptions = [
            ['Hair Clipper', 'Pet Hair Clipper', 'Pet Nail Grinder', 'Pet Grooming Kit', 'Hair Shaver'],
            ['Electronics', 'Consumer Electronics', 'Home Appliances', 'Smart Devices'],
            ['Industrial Equipment', 'Manufacturing Machinery', 'Automation Systems'],
            ['Medical Devices', 'Healthcare Equipment', 'Diagnostic Tools'],
            ['Textile Products', 'Fabrics', 'Garments', 'Fashion Accessories'],
            ['Automotive Parts', 'Car Accessories', 'Vehicle Components'],
            ['Construction Materials', 'Building Supplies', 'Hardware'],
            ['Food Processing Equipment', 'Packaging Machinery', 'Industrial Kitchen'],
            ['Furniture', 'Office Furniture', 'Home Decor', 'Custom Furniture'],
            ['Chemical Products', 'Industrial Chemicals', 'Specialty Chemicals']
        ];

        $manufacturerTypes = [
            'Custom Manufacturer',
            'OEM Manufacturer',
            'ODM Manufacturer',
            'Contract Manufacturer',
            'Private Label Manufacturer'
        ];

        $leadingFactoryRanks = [
            '#1 leading factory for Personal Care & Beauty Appliances',
            '#2 leading factory for Electronics',
            '#3 leading factory for Industrial Equipment',
            'Top 10 factory for Medical Devices',
            'Leading supplier in region'
        ];

        $certificationBadges = [
            'ISO 9001:2015',
            'ISO 13485',
            'CE Certified',
            'FDA Approved',
            'RoHS Compliant',
            'GMP Certified'
        ];

        $companies = Company::all();

        foreach ($companies as $index => $company) {
            // Calculate years in business
            $yearsInBusiness = $company->year_established 
                ? date('Y') - $company->year_established 
                : rand(5, 20);

            // Update 80% of companies with enhanced data
            if ($index % 5 !== 4) { // Skip every 5th company to have variety
                $company->update([
                    'manufacturer_type' => $manufacturerTypes[array_rand($manufacturerTypes)],
                    'years_in_business' => $yearsInBusiness,
                    'verified' => true,
                    'certification_agency' => $certificationAgencies[array_rand($certificationAgencies)],
                    'certification_badge' => $certificationBadges[array_rand($certificationBadges)],
                    'main_categories' => $mainCategoriesOptions[array_rand($mainCategoriesOptions)],
                    'leading_factory_rank' => rand(1, 100) > 70 ? $leadingFactoryRanks[array_rand($leadingFactoryRanks)] : null,
                    'odm_services_available' => rand(1, 100) > 50,
                    'country' => $company->country ?? 'Philippines'
                ]);

                $this->command->info("✓ Updated {$company->name}");
            }
        }

        $this->command->info('✅ Company verification badges seeding completed!');
    }
}

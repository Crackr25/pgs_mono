<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanyVerificationBadgesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    /**
     * Get realistic certification agencies based on category
     */
    private function getCertificationAgency($category)
    {
        $agencies = [
            'electronics' => ['TÜV Rheinland', 'Intertek', 'UL', 'SGS', 'TÜV SÜD'],
            'medical' => ['TÜV SÜD', 'BSI Group', 'SGS', 'Intertek', 'Bureau Veritas'],
            'industrial' => ['TÜV Rheinland', 'Bureau Veritas', 'SGS', 'DNV GL', 'Intertek'],
            'textile' => ['SGS', 'Bureau Veritas', 'Intertek', 'TÜV SÜD'],
            'automotive' => ['TÜV Rheinland', 'TÜV SÜD', 'SGS', 'Bureau Veritas'],
            'construction' => ['SGS', 'Bureau Veritas', 'Intertek', 'TÜV Rheinland'],
            'food' => ['SGS', 'Bureau Veritas', 'Intertek', 'TÜV SÜD'],
            'furniture' => ['SGS', 'Bureau Veritas', 'Intertek', 'TÜV Rheinland'],
            'chemical' => ['SGS', 'Bureau Veritas', 'TÜV Rheinland', 'Intertek'],
            'personal_care' => ['Intertek', 'SGS', 'TÜV Rheinland', 'Bureau Veritas']
        ];

        return $agencies[$category][array_rand($agencies[$category])];
    }

    /**
     * Get realistic certification badges based on category
     */
    private function getCertificationBadges($category)
    {
        $badges = [
            'electronics' => [
                ['ISO 9001:2015', 'CE Certified', 'RoHS Compliant'],
                ['ISO 9001:2015', 'CE Certified', 'FCC Certified'],
                ['ISO 9001:2015', 'RoHS Compliant', 'UL Certified'],
                ['CE Certified', 'RoHS Compliant', 'ISO 14001']
            ],
            'medical' => [
                ['ISO 13485:2016', 'CE Certified', 'FDA Registered'],
                ['ISO 13485:2016', 'ISO 9001:2015', 'CE Certified'],
                ['ISO 13485:2016', 'FDA 510(k)', 'GMP Certified'],
                ['ISO 13485:2016', 'CE Certified', 'Health Canada']
            ],
            'industrial' => [
                ['ISO 9001:2015', 'ISO 14001:2015', 'OHSAS 18001'],
                ['ISO 9001:2015', 'CE Certified', 'ISO 14001'],
                ['ISO 9001:2015', 'ISO 45001', 'CE Certified'],
                ['ISO 9001:2015', 'API Certified', 'CE Certified']
            ],
            'textile' => [
                ['ISO 9001:2015', 'OEKO-TEX', 'BSCI Certified'],
                ['ISO 9001:2015', 'WRAP Certified', 'GOTS'],
                ['ISO 9001:2015', 'BSCI Certified', 'Sedex'],
                ['OEKO-TEX', 'ISO 14001', 'BSCI Certified']
            ],
            'automotive' => [
                ['ISO 9001:2015', 'IATF 16949', 'ISO 14001'],
                ['IATF 16949', 'ISO 9001:2015', 'VDA 6.3'],
                ['ISO 9001:2015', 'IATF 16949', 'CE Certified'],
                ['IATF 16949', 'ISO 14001', 'ISO 45001']
            ],
            'construction' => [
                ['ISO 9001:2015', 'CE Certified', 'EN Standards'],
                ['ISO 9001:2015', 'ISO 14001', 'OHSAS 18001'],
                ['CE Certified', 'ISO 9001:2015', 'ASTM Standards'],
                ['ISO 9001:2015', 'ISO 14001', 'CE Certified']
            ],
            'food' => [
                ['ISO 9001:2015', 'HACCP', 'FDA Registered'],
                ['ISO 22000', 'HACCP', 'GMP Certified'],
                ['ISO 9001:2015', 'ISO 22000', 'BRC Certified'],
                ['HACCP', 'GMP Certified', 'FDA Registered']
            ],
            'furniture' => [
                ['ISO 9001:2015', 'FSC Certified', 'CARB P2'],
                ['ISO 9001:2015', 'ISO 14001', 'FSC Certified'],
                ['FSC Certified', 'CARB P2', 'CE Certified'],
                ['ISO 9001:2015', 'CE Certified', 'ISO 14001']
            ],
            'chemical' => [
                ['ISO 9001:2015', 'ISO 14001', 'REACH Compliant'],
                ['ISO 9001:2015', 'GMP Certified', 'ISO 14001'],
                ['ISO 9001:2015', 'REACH Compliant', 'RoHS Compliant'],
                ['ISO 14001', 'REACH Compliant', 'ISO 45001']
            ],
            'personal_care' => [
                ['ISO 9001:2015', 'GMP Certified', 'FDA Registered'],
                ['ISO 22716', 'GMP Certified', 'CE Certified'],
                ['ISO 9001:2015', 'ISO 22716', 'CPNP Registered'],
                ['GMP Certified', 'ISO 22716', 'FDA Registered']
            ]
        ];

        return $badges[$category][array_rand($badges[$category])];
    }

    /**
     * Determine category type from main categories
     */
    private function determineCategoryType($mainCategories)
    {
        $firstCategory = strtolower($mainCategories[0]);
        
        if (str_contains($firstCategory, 'hair clipper') || str_contains($firstCategory, 'grooming') || str_contains($firstCategory, 'shaver')) {
            return 'personal_care';
        } elseif (str_contains($firstCategory, 'electronic') || str_contains($firstCategory, 'smart device') || str_contains($firstCategory, 'appliance')) {
            return 'electronics';
        } elseif (str_contains($firstCategory, 'medical') || str_contains($firstCategory, 'healthcare') || str_contains($firstCategory, 'diagnostic')) {
            return 'medical';
        } elseif (str_contains($firstCategory, 'industrial') || str_contains($firstCategory, 'machinery') || str_contains($firstCategory, 'automation')) {
            return 'industrial';
        } elseif (str_contains($firstCategory, 'textile') || str_contains($firstCategory, 'fabric') || str_contains($firstCategory, 'garment') || str_contains($firstCategory, 'fashion')) {
            return 'textile';
        } elseif (str_contains($firstCategory, 'automotive') || str_contains($firstCategory, 'car') || str_contains($firstCategory, 'vehicle')) {
            return 'automotive';
        } elseif (str_contains($firstCategory, 'construction') || str_contains($firstCategory, 'building') || str_contains($firstCategory, 'hardware')) {
            return 'construction';
        } elseif (str_contains($firstCategory, 'food') || str_contains($firstCategory, 'packaging') || str_contains($firstCategory, 'kitchen')) {
            return 'food';
        } elseif (str_contains($firstCategory, 'furniture') || str_contains($firstCategory, 'office furniture') || str_contains($firstCategory, 'decor')) {
            return 'furniture';
        } elseif (str_contains($firstCategory, 'chemical')) {
            return 'chemical';
        }
        
        return 'industrial'; // default
    }

    public function run(): void
    {
        $this->command->info('Adding verification badges and enhanced info to companies...');

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
            'OEM Manufacturer',
            'ODM Manufacturer',
            'OEM & ODM Manufacturer',
            'Custom Manufacturer',
            'Contract Manufacturer',
        ];

        $leadingFactoryRanks = [
            '#1 leading factory for Personal Care & Beauty Appliances',
            '#2 leading factory for Electronics',
            '#3 leading factory for Home Appliances',
            'Top 5 factory for Industrial Equipment',
            'Top 10 factory for Medical Devices',
            'Leading supplier for Textile Products',
            'Top-rated manufacturer in region'
        ];

        $companies = Company::all();

        foreach ($companies as $index => $company) {
            // Calculate years in business
            $yearsInBusiness = $company->year_established 
                ? date('Y') - $company->year_established 
                : rand(8, 25);

            // Update 85% of companies with enhanced data (more realistic)
            if (rand(1, 100) <= 85) {
                // Select main categories
                $mainCategories = $mainCategoriesOptions[array_rand($mainCategoriesOptions)];
                
                // Determine category type
                $categoryType = $this->determineCategoryType($mainCategories);
                
                // Get realistic certification agency and badges
                $certificationAgency = $this->getCertificationAgency($categoryType);
                $certificationBadges = $this->getCertificationBadges($categoryType);
                
                // Leading factory rank - only 30% get this prestigious designation
                $leadingRank = null;
                if (rand(1, 100) <= 30 && $yearsInBusiness >= 10) {
                    $leadingRank = $leadingFactoryRanks[array_rand($leadingFactoryRanks)];
                }

                $company->update([
                    'manufacturer_type' => $manufacturerTypes[array_rand($manufacturerTypes)],
                    'years_in_business' => $yearsInBusiness,
                    'verified' => true,
                    'certification_agency' => $certificationAgency,
                    'certification_badge' => implode(', ', $certificationBadges),
                    'main_categories' => $mainCategories,
                    'leading_factory_rank' => $leadingRank,
                    'odm_services_available' => in_array($company->manufacturer_type ?? $manufacturerTypes[array_rand($manufacturerTypes)], ['ODM Manufacturer', 'OEM & ODM Manufacturer']) || rand(1, 100) > 60,
                    'country' => $company->country ?? 'Philippines'
                ]);

                $this->command->info("✓ Updated {$company->name} - {$categoryType} ({$certificationAgency})");
            } else {
                // 15% remain unverified for realism
                $mainCategories = $mainCategoriesOptions[array_rand($mainCategoriesOptions)];
                
                $company->update([
                    'manufacturer_type' => $manufacturerTypes[array_rand($manufacturerTypes)],
                    'years_in_business' => $yearsInBusiness,
                    'verified' => false,
                    'main_categories' => $mainCategories,
                    'odm_services_available' => rand(1, 100) > 50,
                    'country' => $company->country ?? 'Philippines'
                ]);
                
                $this->command->info("○ Updated {$company->name} - Unverified");
            }
        }

        $this->command->info('✅ Company verification badges seeding completed!');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;

class ComprehensiveQuoteRFQSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating comprehensive B2B RFQ and Quote data...');

        // Get existing relationships
        $companies = Company::all();
        $products = Product::all();

        if ($companies->isEmpty()) {
            $this->command->warn('No companies found. Creating sample companies first...');
            $companies = Company::factory(15)->create();
        }

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Creating sample products first...');
            $products = Product::factory(25)->create();
        }

        // Create detailed B2B RFQs (these represent buyer requests to suppliers)
        $this->createDetailedRFQs($companies, $products);

        $this->command->info('B2B seeding completed successfully!');
        $this->command->info('Created realistic B2B RFQs with:');
        $this->command->info('- Detailed product specifications');
        $this->command->info('- Technical requirements');
        $this->command->info('- Business terms and conditions');
        $this->command->info('- Certification requirements');
        $this->command->info('- Volume pricing and delivery terms');
    }

    private function createDetailedRFQs($companies, $products)
    {
        $detailedRFQs = [
            [
                'buyer_name' => 'Sarah Chen',
                'buyer_email' => 'procurement@retailchain.com',
                'buyer_company' => 'Retail Chain Corp',
                'quantity' => 8136,
                'target_price' => 42.50,
                'deadline' => Carbon::now()->addDays(15),
                'status' => 'pending',
                'message' => 'We require premium quality Wireless Bluetooth Speakers for our retail chain. Must have:
- Bluetooth 5.0 compatibility minimum
- Minimum 10-hour battery life
- Water resistance IPX6 or higher
- Custom packaging with our logo
- FCC and CE certifications required
- Color options: Black, White, Blue
- Retail-ready packaging with UPC codes
- Quality is more important than lowest price
- Looking for long-term partnership opportunity
- Delivery to Los Angeles, CA, USA
- Payment terms: 30% advance, 70% on delivery
- Sample required for testing before bulk order',
                'product_category' => 'Consumer Electronics',
                'technical_specs' => json_encode([
                    'power_output' => '20W minimum',
                    'frequency_response' => '20Hz-20KHz',
                    'battery_capacity' => '3000mAh minimum',
                    'charging_time' => '3 hours maximum',
                    'dimensions' => '200x100x80mm approximate',
                    'weight' => '500g maximum',
                    'connectivity' => 'Bluetooth 5.0, 3.5mm aux',
                    'features' => ['Voice assistant support', 'Hands-free calling', 'LED indicators']
                ]),
                'certifications_required' => json_encode(['FCC', 'CE', 'RoHS', 'Energy Star']),
                'delivery_terms' => 'CIF Los Angeles',
                'annual_volume' => 25000,
                'priority' => 'high'
            ],
            [
                'buyer_name' => 'Michael Rodriguez',
                'buyer_email' => 'm.rodriguez@industrialsolutions.com',
                'buyer_company' => 'Industrial Solutions Inc',
                'quantity' => 2500,
                'target_price' => 125.00,
                'deadline' => Carbon::now()->addDays(10),
                'status' => 'pending',
                'message' => 'High-precision CNC machined parts for industrial equipment manufacturing:
- Material: 316L Stainless Steel only
- Tolerance: ±0.001" (±0.025mm)
- Surface finish: Ra 0.8µm maximum
- Heat treatment: Solution annealed
- Full dimensional inspection report required
- ISO 9001 certified manufacturer mandatory
- Previous supplier failed quality inspection
- Need reliable partner with aerospace experience
- Delivery to Toronto, ON, Canada
- Payment terms: 50% advance, 50% on delivery
- Material certificates and test reports required',
                'product_category' => 'Industrial Machinery',
                'technical_specs' => json_encode([
                    'material_grade' => '316L Stainless Steel',
                    'hardness' => '85 HRB maximum',
                    'dimensions' => 'Per technical drawing (provided separately)',
                    'surface_treatment' => 'Passivated per ASTM A967',
                    'testing_required' => '100% CMM inspection',
                    'packaging' => 'Individual protective wrapping',
                    'documentation' => 'Full traceability records required'
                ]),
                'quality_standards' => json_encode(['ISO 9001:2015', 'AS9100D', 'IATF 16949']),
                'delivery_terms' => 'DDP Toronto',
                'tooling_budget' => 15000,
                'priority' => 'medium'
            ],
            [
                'buyer_name' => 'Emma Thompson',
                'buyer_email' => 'sourcing@electronicsuk.com',
                'buyer_company' => 'Electronics Distributor UK',
                'quantity' => 10000,
                'target_price' => 45.00,
                'deadline' => Carbon::now()->addDays(20),
                'status' => 'pending',
                'message' => 'Indoor LED display modules for digital signage applications:
- Pixel pitch: 2.5mm exactly
- Resolution: 128x128 pixels per module
- Brightness: 1200 nits minimum
- Viewing angle: 160° horizontal, 140° vertical
- Operating temperature: -20°C to +60°C
- Lifespan: 100,000 hours minimum guaranteed
- Modular design for easy maintenance
- Looking for European distributor rights
- Volume will increase significantly if successful
- Delivery to Hamburg, Germany
- Payment: Letter of Credit preferred
- CE marking and RoHS compliance mandatory',
                'product_category' => 'Electronic Components',
                'technical_specs' => json_encode([
                    'pixel_pitch' => '2.5mm',
                    'module_size' => '320x160mm',
                    'resolution_per_module' => '128x64 pixels',
                    'brightness' => '1500 nits',
                    'color_temperature' => '6500K',
                    'refresh_rate' => '3840Hz minimum',
                    'grayscale' => '16-bit',
                    'led_type' => 'SMD2121 or equivalent',
                    'control_system' => 'Nova or Linsn compatible'
                ]),
                'environmental_specs' => json_encode([
                    'operating_temp' => '-20°C to +60°C',
                    'humidity' => '10% to 90% RH',
                    'protection_rating' => 'IP40 front, IP20 rear'
                ]),
                'delivery_terms' => 'FOB Hamburg',
                'annual_forecast' => 50000,
                'priority' => 'medium'
            ],
            [
                'buyer_name' => 'David Park',
                'buyer_email' => 'david.park@techinnovate.com',
                'buyer_company' => 'Tech Innovate Solutions',
                'quantity' => 5000,
                'target_price' => 189.99,
                'deadline' => Carbon::now()->addDays(25),
                'status' => 'pending',
                'message' => 'Smart IoT sensors for industrial monitoring systems:
- WiFi and Bluetooth connectivity required
- Temperature range: -40°C to +85°C
- Humidity sensing: 0-100% RH
- Battery life: Minimum 2 years
- IP67 waterproof rating mandatory
- Mobile app integration required
- Cloud dashboard included
- Custom firmware development needed
- White label manufacturing preferred
- Delivery to San Francisco, CA, USA
- Payment: 40% advance, 60% against shipment
- FDA and FCC approvals required',
                'product_category' => 'IoT Devices',
                'technical_specs' => json_encode([
                    'sensors' => ['Temperature', 'Humidity', 'Pressure', 'Vibration'],
                    'connectivity' => ['WiFi 802.11n', 'Bluetooth 5.0', 'LoRaWAN'],
                    'power_source' => 'Lithium battery + solar panel',
                    'data_logging' => '10,000 data points internal storage',
                    'transmission_range' => '100m WiFi, 1km LoRaWAN',
                    'enclosure' => 'IP67 rated polycarbonate',
                    'mounting' => 'Wall mount and pole mount options'
                ]),
                'software_requirements' => json_encode([
                    'mobile_app' => 'iOS and Android native apps',
                    'web_dashboard' => 'Real-time monitoring and alerts',
                    'api_access' => 'RESTful API for integration',
                    'cloud_service' => 'AWS or Azure hosted'
                ]),
                'delivery_terms' => 'DDP San Francisco',
                'customization_budget' => 25000,
                'priority' => 'high'
            ],
            [
                'buyer_name' => 'Lisa Wang',
                'buyer_email' => 'lisa.wang@automotiveparts.com',
                'buyer_company' => 'Automotive Parts International',
                'quantity' => 15000,
                'target_price' => 67.50,
                'deadline' => Carbon::now()->addDays(30),
                'status' => 'pending',
                'message' => 'Automotive brake components for electric vehicles:
- Material: High-carbon steel with ceramic coating
- Working temperature: -40°C to +200°C
- Brake force: 2000N minimum
- Corrosion resistance: 1000 hours salt spray test
- ECE R90 certification required
- IATF 16949 certified facility mandatory
- Zero defect quality requirement
- Just-in-time delivery capability needed
- Delivery to Detroit, MI, USA
- Payment: 45 days net after delivery
- PPAP documentation required
- Annual volume potential: 100,000 units',
                'product_category' => 'Automotive Components',
                'technical_specs' => json_encode([
                    'material_composition' => 'High-carbon steel, ceramic friction material',
                    'dimensions' => 'Per automotive drawing specifications',
                    'performance_specs' => [
                        'friction_coefficient' => '0.35-0.45',
                        'wear_rate' => 'Maximum 0.25mm per 10,000 cycles',
                        'noise_level' => 'Below 70dB at 50km/h'
                    ],
                    'testing_requirements' => [
                        'Dynamometer testing',
                        'Environmental testing',
                        'Corrosion testing',
                        'Fatigue testing'
                    ]
                ]),
                'automotive_standards' => json_encode(['ECE R90', 'SAE J2521', 'ISO/TS 16949']),
                'delivery_terms' => 'FOB Detroit',
                'quality_requirements' => 'Zero defect, SPC monitoring, PPAP Level 3',
                'priority' => 'high'
            ]
        ];

        // Create detailed RFQs in the database
        foreach ($detailedRFQs as $index => $rfqData) {
            Quote::create([
                'product_id' => $products->random()->id,
                'company_id' => $companies->random()->id,
                'buyer_name' => $rfqData['buyer_name'],
                'buyer_email' => $rfqData['buyer_email'],
                'buyer_company' => $rfqData['buyer_company'],
                'quantity' => $rfqData['quantity'],
                'target_price' => $rfqData['target_price'],
                'deadline' => $rfqData['deadline'],
                'status' => $rfqData['status'],
                'message' => $rfqData['message'],
                'response_message' => null,
                'quoted_price' => null,
                'quoted_lead_time' => null,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }

        // Create some responded quotes
        $this->createRespondedQuotes($companies, $products);
        
        // Create some accepted/rejected quotes
        $this->createAcceptedRejectedQuotes($companies, $products);
    }

    private function createRespondedQuotes($companies, $products)
    {
        $respondedQuotes = [
            [
                'buyer_name' => 'James Miller',
                'buyer_email' => 'james@globaltrading.com',
                'buyer_company' => 'Global Trading Solutions',
                'quantity' => 3000,
                'target_price' => 89.99,
                'deadline' => Carbon::now()->addDays(45),
                'status' => 'responded',
                'message' => 'We need high-quality textile machinery components with quality certifications.',
                'response_message' => 'Thank you for your inquiry. We can provide premium textile machinery components meeting all your specifications:

QUOTE DETAILS:
- Unit Price: $82.50 (8% below your target)
- Total Value: $247,500 for 3000 units
- Lead Time: 21-25 business days
- Payment Terms: 30% T/T advance, 70% against B/L copy

TECHNICAL SPECIFICATIONS:
- Material: High-grade alloy steel with protective coating
- Precision: ±0.05mm tolerance guaranteed
- Quality Certifications: ISO 9001:2015, CE marking included
- Testing: 100% functional testing before shipment

VALUE-ADDED SERVICES:
- Free technical consultation
- 18-month warranty coverage
- Installation support available
- Volume discounts for future orders

We have 15+ years experience in textile machinery and serve major brands worldwide. Samples available within 7 days for your approval.

Best regards,
Manufacturing Team',
                'quoted_price' => 82.50,
                'quoted_lead_time' => '21-25 business days'
            ],
            [
                'buyer_name' => 'Anna Rodriguez',
                'buyer_email' => 'anna@medicaldevices.com',
                'buyer_company' => 'Medical Devices Corp',
                'quantity' => 1200,
                'target_price' => 156.00,
                'deadline' => Carbon::now()->addDays(60),
                'status' => 'responded',
                'message' => 'Medical grade components needed with FDA compliance and sterile packaging.',
                'response_message' => 'We are pleased to quote for your medical grade components:

QUOTATION SUMMARY:
- Unit Price: $149.75 per piece
- Total Investment: $179,700 for 1200 units
- Manufacturing Time: 28-35 days
- Delivery: DDP to your facility

COMPLIANCE & CERTIFICATIONS:
- FDA 510(k) cleared facility
- ISO 13485:2016 medical device quality
- Clean room Class 10,000 manufacturing
- Sterile packaging per ISO 11607

TECHNICAL SPECIFICATIONS:
- Material: Medical grade stainless steel 316LVM
- Surface finish: Electropolished to <0.4µm Ra
- Biocompatibility: USP Class VI certified
- Traceability: Full lot traceability provided

QUALITY ASSURANCE:
- 100% dimensional inspection
- Material certificates included
- Sterility validation documentation
- Certificate of compliance provided

We specialize in medical components for 20+ years with zero recalls.

Medical Manufacturing Division',
                'quoted_price' => 149.75,
                'quoted_lead_time' => '28-35 business days'
            ]
        ];

        foreach ($respondedQuotes as $quote) {
            Quote::create([
                'product_id' => $products->random()->id,
                'company_id' => $companies->random()->id,
                'buyer_name' => $quote['buyer_name'],
                'buyer_email' => $quote['buyer_email'],
                'buyer_company' => $quote['buyer_company'],
                'quantity' => $quote['quantity'],
                'target_price' => $quote['target_price'],
                'deadline' => $quote['deadline'],
                'status' => $quote['status'],
                'message' => $quote['message'],
                'response_message' => $quote['response_message'],
                'quoted_price' => $quote['quoted_price'],
                'quoted_lead_time' => $quote['quoted_lead_time'],
                'created_at' => Carbon::now()->subDays(rand(15, 45)),
                'updated_at' => Carbon::now()->subDays(rand(1, 10)),
            ]);
        }
    }

    private function createAcceptedRejectedQuotes($companies, $products)
    {
        // Accepted quotes
        $acceptedQuote = [
            'buyer_name' => 'Robert Chen',
            'buyer_email' => 'robert@electronicsmanuf.com',
            'buyer_company' => 'Electronics Manufacturing Ltd',
            'quantity' => 7500,
            'target_price' => 34.99,
            'deadline' => Carbon::now()->addDays(90),
            'status' => 'accepted',
            'message' => 'We need electronic components for our Q4 production run.',
            'response_message' => 'We are delighted to provide premium electronic components for your Q4 production:

FINAL QUOTE:
- Unit Price: $31.75 (9% savings for you!)
- Total Order Value: $238,125
- Production Schedule: 18-22 business days
- Shipping: FOB destination included

PRODUCT SPECIFICATIONS:
- Grade A components with 99.9% reliability
- RoHS and REACH compliant
- Temperature rating: -40°C to +105°C
- Moisture sensitivity level: MSL-1

BUSINESS TERMS:
- Payment: 25% advance, 75% against shipping docs
- Warranty: 24 months manufacturer warranty
- Quality: Zero defect guarantee
- Packaging: Anti-static tubes, moisture barrier bags

Thank you for choosing us as your trusted partner!',
            'quoted_price' => 31.75,
            'quoted_lead_time' => '18-22 business days'
        ];

        Quote::create([
            'product_id' => $products->random()->id,
            'company_id' => $companies->random()->id,
            'buyer_name' => $acceptedQuote['buyer_name'],
            'buyer_email' => $acceptedQuote['buyer_email'],
            'buyer_company' => $acceptedQuote['buyer_company'],
            'quantity' => $acceptedQuote['quantity'],
            'target_price' => $acceptedQuote['target_price'],
            'deadline' => $acceptedQuote['deadline'],
            'status' => $acceptedQuote['status'],
            'message' => $acceptedQuote['message'],
            'response_message' => $acceptedQuote['response_message'],
            'quoted_price' => $acceptedQuote['quoted_price'],
            'quoted_lead_time' => $acceptedQuote['quoted_lead_time'],
            'created_at' => Carbon::now()->subDays(rand(30, 60)),
            'updated_at' => Carbon::now()->subDays(rand(5, 20)),
        ]);

        // Rejected quotes
        $rejectedQuotes = [
            [
                'buyer_name' => 'Susan Lee',
                'buyer_email' => 'susan@constructionparts.com',
                'buyer_company' => 'Construction Parts Inc',
                'quantity' => 2000,
                'target_price' => 78.00,
                'deadline' => Carbon::now()->subDays(15),
                'status' => 'rejected',
                'message' => 'Heavy duty construction hardware needed urgently.',
                'response_message' => 'Thank you for your inquiry. Unfortunately, we cannot meet your delivery timeline of 2 weeks for this quantity. Our current production schedule would require 6-8 weeks lead time. We apologize for any inconvenience.',
                'quoted_price' => null,
                'quoted_lead_time' => null
            ],
            [
                'buyer_name' => 'Mark Thompson',
                'buyer_email' => 'mark@packagingsupply.com',
                'buyer_company' => 'Packaging Supply Co',
                'quantity' => 50000,
                'target_price' => 2.50,
                'deadline' => Carbon::now()->subDays(30),
                'status' => 'rejected',
                'message' => 'Food grade packaging materials with custom printing.',
                'response_message' => 'We appreciate your business inquiry. After careful review, we must decline this project as the target price point of $2.50 per unit would not allow us to maintain our quality standards for food-grade materials with custom printing. Our minimum viable price would be $3.75 per unit.',
                'quoted_price' => null,
                'quoted_lead_time' => null
            ]
        ];

        foreach ($rejectedQuotes as $quote) {
            Quote::create([
                'product_id' => $products->random()->id,
                'company_id' => $companies->random()->id,
                'buyer_name' => $quote['buyer_name'],
                'buyer_email' => $quote['buyer_email'],
                'buyer_company' => $quote['buyer_company'],
                'quantity' => $quote['quantity'],
                'target_price' => $quote['target_price'],
                'deadline' => $quote['deadline'],
                'status' => $quote['status'],
                'message' => $quote['message'],
                'response_message' => $quote['response_message'],
                'quoted_price' => $quote['quoted_price'],
                'quoted_lead_time' => $quote['quoted_lead_time'],
                'created_at' => Carbon::now()->subDays(rand(45, 90)),
                'updated_at' => Carbon::now()->subDays(rand(15, 45)),
            ]);
        }
    }
}

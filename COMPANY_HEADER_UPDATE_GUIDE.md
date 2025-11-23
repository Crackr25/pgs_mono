# Quick Reference: Update Company Header Information

## How to Update Company Data for Enhanced Header

### Option 1: Using Tinker (Quick Test)

```bash
cd packages/backend
php artisan tinker
```

Then run:
```php
$company = App\Models\Company::where('name', 'YOUR_COMPANY_NAME')->first();

$company->update([
    'manufacturer_type' => 'Custom Manufacturer',
    'verified' => true,
    'certification_agency' => 'TÜVRheinland',
    'certification_badge' => 'ISO 9001:2015',
    'years_in_business' => 8,
    'location' => 'Zhejiang, China',
    'country' => 'China',
    'main_categories' => [
        'Hair Clipper',
        'Pet Hair Clipper',
        'Pet Nail Grinder',
        'Pet Grooming Kit',
        'Hair Shaver'
    ],
    'leading_factory_rank' => '#3 leading factory for Personal Care & Beauty Appliances',
    'odm_services_available' => true
]);
```

### Option 2: Using Seeder (All Companies)

Run the provided seeder:
```bash
cd packages/backend
php artisan db:seed --class=CompanyVerificationBadgesSeeder
```

### Option 3: Via API (Frontend/Backend Integration)

Add these fields to your company update form:

**Example API Request:**
```javascript
PUT /api/companies/{id}

{
  "manufacturer_type": "Custom Manufacturer",
  "certification_agency": "TÜVRheinland",
  "certification_badge": "ISO 9001:2015",
  "years_in_business": 8,
  "main_categories": [
    "Hair Clipper",
    "Pet Hair Clipper",
    "Pet Nail Grinder",
    "Pet Grooming Kit"
  ],
  "leading_factory_rank": "#3 leading factory for Personal Care & Beauty Appliances",
  "odm_services_available": true
}
```

## Field Reference

### manufacturer_type
**Type:** String  
**Options:**
- "Custom Manufacturer"
- "OEM Manufacturer"
- "ODM Manufacturer"
- "Contract Manufacturer"
- "Private Label Manufacturer"

**Display:** Highlighted in blue next to company name

---

### certification_agency
**Type:** String  
**Options:**
- "TÜVRheinland"
- "SGS"
- "Bureau Veritas"
- "Intertek"
- "DNV GL"
- "UL"
- "TÜV SÜD"
- "BSI Group"

**Display:** Blue badge at top "Verified by {agency}"

---

### certification_badge
**Type:** String  
**Options:**
- "ISO 9001:2015"
- "ISO 13485"
- "CE Certified"
- "FDA Approved"
- "RoHS Compliant"
- "GMP Certified"

**Display:** Small text next to verification badge

---

### years_in_business
**Type:** Integer  
**Example:** 8, 12, 5

**Display:** Shows as "{X} yrs"

**Note:** If not set, automatically calculated from `year_established`

---

### main_categories
**Type:** JSON Array  
**Example:**
```json
[
  "Hair Clipper",
  "Pet Hair Clipper",
  "Pet Nail Grinder",
  "Pet Grooming Kit",
  "Hair Shaver"
]
```

**Display:** Shows first 4 categories, then "+X more"

---

### leading_factory_rank
**Type:** String  
**Options:**
- "#1 leading factory for {category}"
- "#2 leading factory for {category}"
- "#3 leading factory for {category}"
- "Top 10 factory for {category}"
- "Leading supplier in {region}"

**Display:** Orange badge with text

**Note:** Leave null if not applicable

---

### odm_services_available
**Type:** Boolean  
**Options:** true/false

**Display:** White badge with checkmark "✓ ODM services available"

---

## Testing Your Changes

1. Update a company with the fields above
2. Visit the storefront: `http://localhost:3000/store/{company-slug}`
3. You should see the enhanced header with all badges and information

## Example: Full Company Setup

```php
// Create or update a company with full header information
App\Models\Company::updateOrCreate(
    ['registration' => 'REG-2024-001'],
    [
        'name' => 'Ningbo Iclipper Electric Appliance Co., Ltd.',
        'manufacturer_type' => 'Custom Manufacturer',
        'verified' => true,
        'certification_agency' => 'TÜVRheinland',
        'certification_badge' => 'ISO 9001:2015',
        'year_established' => 2016,
        'years_in_business' => 8,
        'location' => 'Zhejiang',
        'country' => 'China',
        'main_categories' => [
            'Hair Clipper',
            'Pet Hair Clipper',
            'Pet Nail Grinder',
            'Pet Grooming Kit',
            'Hair Shaver'
        ],
        'leading_factory_rank' => '#3 leading factory for Personal Care & Beauty Appliances',
        'odm_services_available' => true,
        'description' => 'Leading manufacturer of personal care appliances...',
        'email' => 'contact@iclipper.com',
        'phone' => '+86 123 456 7890',
        'website' => 'https://www.iclipper.com',
        // ... other fields
    ]
);
```

## Visual Result

After setting these fields, your storefront header will display:

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  [✓ Verified by TÜVRheinland]  [ISO 9001:2015]     │
│                                                             │
│         Ningbo Iclipper Electric Appliance Co., Ltd. ▼     │
│                                                             │
│         📋 Custom Manufacturer • 8yrs • Zhejiang, China    │
│                                              [Contact       │
│         Main categories: Hair Clipper, Pet Hair Clipper,   │  supplier]
│         Pet Nail Grinder, Pet Grooming Kit, Hair Shaver    │
│                                              [Chat now]     │
│         [#3 leading factory...] [✓ ODM services available] │
└────────────────────────────────────────────────────────────┘
```

## Common Certification Agencies

- **TÜVRheinland** - German certification body
- **SGS** - Swiss multinational company
- **Bureau Veritas** - French testing and certification company
- **Intertek** - British certification company
- **UL** - American safety certification
- **DNV GL** - Norwegian certification body

## Common Certification Badges

- **ISO 9001:2015** - Quality management systems
- **ISO 13485** - Medical devices quality management
- **CE** - European Conformity
- **FDA Approved** - US Food and Drug Administration
- **RoHS** - Restriction of Hazardous Substances
- **GMP** - Good Manufacturing Practice

Choose certifications that are relevant to your industry and region!

<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        $companyTypes = [
            'Electronics Manufacturing',
            'Textile Production',
            'Automotive Parts',
            'Industrial Machinery',
            'Medical Devices',
            'Food Processing',
            'Packaging Solutions',
            'Construction Materials',
            'Furniture Manufacturing',
            'Chemical Processing'
        ];

        $locations = [
            'Manila, Philippines',
            'Cebu, Philippines',
            'Davao, Philippines',
            'Makati, Philippines',
            'Quezon City, Philippines',
            'Taguig, Philippines',
            'Pasig, Philippines',
            'Mandaluyong, Philippines',
            'Laguna, Philippines',
            'Cavite, Philippines'
        ];

        $companyName = $this->faker->company();
        
        return [
            'user_id' => User::factory(),
            'name' => $companyName,
            'registration' => $this->faker->unique()->numerify('REG-########'),
            'peza_id' => $this->faker->optional(0.3)->numerify('PEZA-######'),
            'location' => $this->faker->randomElement($locations),
            'year_established' => $this->faker->numberBetween(1980, 2020),
            'factory_size' => $this->faker->randomElement(['Small (< 1000 sqm)', 'Medium (1000-5000 sqm)', 'Large (> 5000 sqm)']),
            'product_lines' => $this->faker->randomElement($companyTypes),
            'employees' => $this->faker->numberBetween(10, 500),
            'description' => $this->faker->paragraph(3),
            'website' => $this->faker->optional(0.7)->url(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'verified' => $this->faker->boolean(80), // 80% verified
            'status' => $this->faker->randomElement(['active', 'pending', 'suspended']),
            // Optional file fields - leaving null for factory
            'dti_sec_certificate' => null,
            'bir_certificate' => null,
            'mayor_permit' => null,
            'fire_permit' => null,
            'peza_certificate' => null,
            'iso_certificate' => null,
            'fda_license' => null,
            'business_photos' => null,
            'logo' => null,
        ];
    }

    public function verified()
    {
        return $this->state(function (array $attributes) {
            return [
                'verified' => true,
                'status' => 'active',
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'verified' => false,
                'status' => 'pending',
            ];
        });
    }
}

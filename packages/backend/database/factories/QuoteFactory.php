<?php

namespace Database\Factories;

use App\Models\Quote;
use App\Models\Product;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    protected $model = Quote::class;

    public function definition(): array
    {
        $buyerCompanies = [
            'TechCorp Solutions',
            'Global Manufacturing Inc.',
            'Industrial Dynamics Ltd.',
            'Pacific Trading Co.',
            'Metro Electronics',
            'Advanced Systems Corp.',
            'Premier Industries',
            'Innovation Labs',
            'Future Tech Holdings',
            'Digital Solutions Group'
        ];

        $sampleMessages = [
            'We are looking for a reliable supplier for this product. Please provide your best quote including shipping to our facility.',
            'Interested in a long-term partnership for bulk orders. Can you provide volume discounts?',
            'Need urgent quotation for immediate production. What is your fastest lead time?',
            'Looking for high-quality components for our new product line. Quality certifications required.',
            'We need samples first for testing. What is your sample policy and pricing?',
            'Expanding to new markets and need competitive pricing. Can you match current supplier rates?',
            'Custom specifications required. Please confirm if you can manufacture according to our drawings.',
            'Seasonal order planning. Need quotes for Q1 production schedule.',
            'Quality audit passed. Ready to proceed with large volume orders.',
            'Emergency replacement needed for discontinued parts. Can you provide alternatives?'
        ];

        $targetPrice = $this->faker->randomFloat(2, 1, 1000);
        $deadline = $this->faker->dateTimeBetween('now', '+90 days');

        return [
            'product_id' => Product::factory(),
            'company_id' => Company::factory(),
            'buyer_name' => $this->faker->name(),
            'buyer_email' => $this->faker->unique()->safeEmail(),
            'buyer_company' => $this->faker->randomElement($buyerCompanies),
            'quantity' => $this->faker->numberBetween(10, 10000),
            'target_price' => $targetPrice,
            'deadline' => $deadline,
            'status' => $this->faker->randomElement(['pending', 'responded', 'accepted', 'rejected']),
            'message' => $this->faker->randomElement($sampleMessages),
            'response_message' => $this->faker->optional(0.6)->paragraph(),
            'quoted_price' => $this->faker->optional(0.7)->randomFloat(2, $targetPrice * 0.8, $targetPrice * 1.2),
            'quoted_lead_time' => $this->faker->optional(0.7)->randomElement(['3-5 days', '1-2 weeks', '2-4 weeks', '4-6 weeks', '6-8 weeks']),
        ];
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'response_message' => null,
                'quoted_price' => null,
                'quoted_lead_time' => null,
            ];
        });
    }

    public function responded()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'responded',
                'response_message' => $this->faker->paragraph(),
                'quoted_price' => $this->faker->randomFloat(2, $attributes['target_price'] * 0.8, $attributes['target_price'] * 1.2),
                'quoted_lead_time' => $this->faker->randomElement(['3-5 days', '1-2 weeks', '2-4 weeks', '4-6 weeks']),
            ];
        });
    }

    public function accepted()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'accepted',
                'response_message' => $this->faker->paragraph(),
                'quoted_price' => $this->faker->randomFloat(2, $attributes['target_price'] * 0.9, $attributes['target_price'] * 1.1),
                'quoted_lead_time' => $this->faker->randomElement(['1-2 weeks', '2-4 weeks', '4-6 weeks']),
            ];
        });
    }

    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'rejected',
                'response_message' => $this->faker->optional(0.8)->paragraph(),
                'quoted_price' => $this->faker->optional(0.5)->randomFloat(2, $attributes['target_price'] * 1.2, $attributes['target_price'] * 1.5),
                'quoted_lead_time' => $this->faker->optional(0.5)->randomElement(['4-6 weeks', '6-8 weeks', '8-12 weeks']),
            ];
        });
    }
}

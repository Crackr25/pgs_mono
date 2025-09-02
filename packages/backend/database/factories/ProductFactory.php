<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $productCategories = [
            'Electronics',
            'Automotive',
            'Textile',
            'Industrial',
            'Medical',
            'Food Processing',
            'Packaging',
            'Construction',
            'Furniture',
            'Chemical'
        ];

        $productNames = [
            'Custom Electronic Components',
            'Industrial Machinery Parts',
            'Automotive Brake Components',
            'Medical Device Housing',
            'Textile Weaving Equipment',
            'Food Processing Conveyor',
            'Packaging Machinery Parts',
            'Construction Hardware',
            'Office Furniture Components',
            'Chemical Processing Valves',
            'LED Display Modules',
            'Motor Assembly Parts',
            'Injection Molded Components',
            'Precision Machined Parts',
            'Cable Assembly Products',
            'Sensor Housing Units',
            'Control Panel Enclosures',
            'Hydraulic System Parts',
            'Pneumatic Components',
            'Custom Metal Fabrication'
        ];

        $units = ['pieces', 'sets', 'kg', 'meters', 'liters', 'boxes'];
        $leadTimes = ['1-2 weeks', '2-3 weeks', '3-4 weeks', '4-6 weeks', '6-8 weeks'];

        return [
            'company_id' => Company::factory(),
            'name' => $this->faker->randomElement($productNames),
            'specs' => $this->faker->text(200),
            'image' => null, // Can be added later
            'moq' => $this->faker->numberBetween(10, 1000),
            'lead_time' => $this->faker->randomElement($leadTimes),
            'hs_code' => $this->faker->numerify('####.##.##'),
            'variants' => [
                'colors' => $this->faker->randomElements(['Red', 'Blue', 'Green', 'Black', 'White'], rand(1, 3)),
                'sizes' => $this->faker->randomElements(['Small', 'Medium', 'Large'], rand(1, 2)),
            ],
            'price' => $this->faker->randomFloat(2, 5, 500),
            'category' => $this->faker->randomElement($productCategories),
            'description' => $this->faker->paragraph(2),
            'active' => $this->faker->boolean(90), // 90% active
            'stock_quantity' => $this->faker->numberBetween(0, 1000),
            'unit' => $this->faker->randomElement($units),
        ];
    }

    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'active' => true,
            ];
        });
    }

    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'active' => false,
            ];
        });
    }

    public function electronics()
    {
        return $this->state(function (array $attributes) {
            return [
                'category' => 'Electronics',
                'name' => $this->faker->randomElement([
                    'Custom PCB Assembly',
                    'LED Display Module',
                    'Electronic Control Unit',
                    'Sensor Housing',
                    'Cable Assembly'
                ]),
            ];
        });
    }

    public function automotive()
    {
        return $this->state(function (array $attributes) {
            return [
                'category' => 'Automotive',
                'name' => $this->faker->randomElement([
                    'Brake Component',
                    'Engine Mount',
                    'Dashboard Assembly',
                    'Door Handle',
                    'Mirror Housing'
                ]),
            ];
        });
    }
}

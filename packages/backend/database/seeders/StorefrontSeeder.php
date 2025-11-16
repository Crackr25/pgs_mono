<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StorefrontTheme;

class StorefrontSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create themes
        $themes = [
            [
                'name' => 'Modern',
                'description' => 'Clean, contemporary design with bold typography',
                'color_scheme' => [
                    'primary' => '#3B82F6',
                    'secondary' => '#1E293B',
                    'accent' => '#F59E0B',
                ],
                'layout_config' => [
                    'header_style' => 'centered',
                    'section_spacing' => 'large',
                ],
                'sort_order' => 1,
            ],
            [
                'name' => 'Classic',
                'description' => 'Traditional, professional layout',
                'color_scheme' => [
                    'primary' => '#1F2937',
                    'secondary' => '#6B7280',
                    'accent' => '#DC2626',
                ],
                'layout_config' => [
                    'header_style' => 'left',
                    'section_spacing' => 'medium',
                ],
                'sort_order' => 2,
            ],
            [
                'name' => 'Minimal',
                'description' => 'Simple, elegant design with lots of whitespace',
                'color_scheme' => [
                    'primary' => '#000000',
                    'secondary' => '#6B7280',
                    'accent' => '#10B981',
                ],
                'layout_config' => [
                    'header_style' => 'centered',
                    'section_spacing' => 'extra-large',
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($themes as $theme) {
            StorefrontTheme::create($theme);
        }

        $this->command->info('Storefront themes seeded successfully!');
    }
}

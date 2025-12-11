<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
use App\Models\CompanyAgent;
use Illuminate\Support\Facades\Hash;

class TestAgentSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Find or create a test company
        $company = Company::first();
        
        if (!$company) {
            echo "No company found. Please create a company first.\n";
            return;
        }

        // Create test agent user
        $agent = User::firstOrCreate(
            ['email' => 'agent@test.com'],
            [
                'name' => 'Test Agent',
                'password' => Hash::make('password'),
                'usertype' => 'agent',
            ]
        );

        // Create company agent record
        $companyAgent = CompanyAgent::firstOrCreate(
            [
                'user_id' => $agent->id,
                'company_id' => $company->id,
            ],
            [
                'role' => 'sales',
                'permissions' => [
                    'messages' => ['read', 'reply', 'initiate'],
                    'products' => ['view', 'discuss'],
                    'quotes' => ['create', 'modify'],
                    'orders' => ['view', 'update']
                ],
                'is_active' => true,
                'joined_at' => now(),
            ]
        );

        echo "Test agent created successfully!\n";
        echo "Email: agent@test.com\n";
        echo "Password: password\n";
        echo "Company: {$company->name}\n";
    }
}

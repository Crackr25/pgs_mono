<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $adminExists = User::where('email', 'admin@pinoyglobalsupply.com')->exists();

        if (!$adminExists) {
            User::create([
                'name' => 'Super Admin',
                'email' => 'admin@pinoyglobalsupply.com',
                'password' => Hash::make('Admin@123456'),
                'usertype' => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->command->info('✓ Admin account created successfully!');
            $this->command->info('  Email: admin@pinoyglobalsupply.com');
            $this->command->info('  Password: Admin@123456');
            $this->command->warn('  ⚠ Please change the password after first login!');
        } else {
            $this->command->info('Admin account already exists.');
        }
    }
}

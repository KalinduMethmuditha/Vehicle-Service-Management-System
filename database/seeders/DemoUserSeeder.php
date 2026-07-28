<?php

namespace Database\Seeders;

use App\Models\Mechanic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $admin->syncRoles(['Admin']);

        $advisor = User::updateOrCreate(
            ['email' => 'advisor@example.com'],
            [
                'name' => 'Service Advisor',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $advisor->syncRoles(['Service Advisor']);

        $mechanicUser = User::updateOrCreate(
            ['email' => 'mechanic@example.com'],
            [
                'name' => 'Demo Mechanic',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $mechanicUser->syncRoles(['Mechanic']);

        Mechanic::updateOrCreate(
            ['employee_id' => 'MEC-0001'],
            [
                'user_id' => $mechanicUser->id,
                'name' => 'Demo Mechanic',
                'specialization' => 'General Maintenance',
                'contact' => '0712345678',
                'is_active' => true,
            ]
        );
    }
}
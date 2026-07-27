<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',

            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',

            'vehicles.view',
            'vehicles.create',
            'vehicles.update',
            'vehicles.delete',

            'mechanics.view',
            'mechanics.create',
            'mechanics.update',
            'mechanics.delete',

            'parts.view',
            'parts.create',
            'parts.update',
            'parts.delete',

            'bookings.view',
            'bookings.create',
            'bookings.update',
            'bookings.delete',

            'jobs.view',
            'jobs.update',
            'jobs.assign',

            'invoices.view',
            'invoices.create',
            'invoices.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $advisor = Role::firstOrCreate([
            'name' => 'Service Advisor',
            'guard_name' => 'web',
        ]);

        $mechanic = Role::firstOrCreate([
            'name' => 'Mechanic',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions(Permission::all());

        $advisor->syncPermissions([
            'dashboard.view',
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',
            'vehicles.view',
            'vehicles.create',
            'vehicles.update',
            'vehicles.delete',
            'mechanics.view',
            'parts.view',
            'bookings.view',
            'bookings.create',
            'bookings.update',
            'bookings.delete',
            'jobs.view',
            'jobs.assign',
            'jobs.update',
            'invoices.view',
            'invoices.create',
            'invoices.update',
        ]);

        $mechanic->syncPermissions([
            'dashboard.view',
            'jobs.view',
            'jobs.update',
            'parts.view',
        ]);
    }
}
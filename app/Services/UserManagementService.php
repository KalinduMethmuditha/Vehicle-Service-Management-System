<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserManagementService
{
    public const SYSTEM_ROLES = [
        'Admin',
        'Service Advisor',
        'Mechanic',
    ];

    public function update(
        User $currentAdmin,
        User $managedUser,
        array $data
    ): User {
        return DB::transaction(function () use (
            $currentAdmin,
            $managedUser,
            $data
        ) {
            if (
                $currentAdmin->is($managedUser)
                && $data['role'] !== 'Admin'
            ) {
                throw ValidationException::withMessages([
                    'role' => 'You cannot remove your own Admin role.',
                ]);
            }

            if (
                $managedUser->hasRole('Admin')
                && $data['role'] !== 'Admin'
                && User::role('Admin')->count() <= 1
            ) {
                throw ValidationException::withMessages([
                    'role' => 'The system must have at least one Admin.',
                ]);
            }

            $managedUser->update([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            $managedUser->syncRoles([$data['role']]);

            return $managedUser->refresh()->load('roles');
        });
    }

    public function delete(
        User $currentAdmin,
        User $managedUser
    ): void {
        DB::transaction(function () use (
            $currentAdmin,
            $managedUser
        ) {
            if ($currentAdmin->is($managedUser)) {
                throw ValidationException::withMessages([
                    'user' => 'You cannot delete your own account.',
                ]);
            }

            if (
                $managedUser->hasRole('Admin')
                && User::role('Admin')->count() <= 1
            ) {
                throw ValidationException::withMessages([
                    'user' => 'The last Admin account cannot be deleted.',
                ]);
            }

            $managedUser->delete();
        });
    }
}
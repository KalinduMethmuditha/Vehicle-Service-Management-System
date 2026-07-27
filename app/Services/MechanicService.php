<?php

namespace App\Services;

use App\Models\Mechanic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MechanicService
{
    public function create(array $data): Mechanic
    {
        return DB::transaction(function () use ($data) {
            $mechanic = Mechanic::create($data);

            if ($mechanic->user_id) {
                $mechanic->user->assignRole('Mechanic');
            }

            return $mechanic->load('user');
        });
    }

    public function update(
        Mechanic $mechanic,
        array $data
    ): Mechanic {
        return DB::transaction(function () use ($mechanic, $data) {
            $previousUser = $mechanic->user;
            $newUserId = $data['user_id'] ?? null;

            $mechanic->update($data);

            if (
                $previousUser &&
                $previousUser->id !== (int) $newUserId
            ) {
                $previousUser->removeRole('Mechanic');
            }

            if ($newUserId) {
                User::findOrFail($newUserId)
                    ->assignRole('Mechanic');
            }

            return $mechanic->refresh()->load('user');
        });
    }

    public function delete(Mechanic $mechanic): void
    {
        DB::transaction(function () use ($mechanic) {
            if ($mechanic->jobCards()->exists()) {
                throw ValidationException::withMessages([
                    'mechanic' =>
                        'This mechanic has assigned jobs and cannot be deleted.',
                ]);
            }

            $user = $mechanic->user;

            $mechanic->delete();

            if ($user && $user->hasRole('Mechanic')) {
                $user->removeRole('Mechanic');
            }
        });
    }
}
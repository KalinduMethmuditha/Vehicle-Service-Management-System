<?php

namespace App\Policies;

use App\Models\Mechanic;
use App\Models\User;

class MechanicPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('mechanics.view');
    }

    public function view(
        User $user,
        Mechanic $mechanic
    ): bool {
        return $user->can('mechanics.view');
    }

    public function create(User $user): bool
    {
        return $user->can('mechanics.create');
    }

    public function update(
        User $user,
        Mechanic $mechanic
    ): bool {
        return $user->can('mechanics.update');
    }

    public function delete(
        User $user,
        Mechanic $mechanic
    ): bool {
        return $user->can('mechanics.delete');
    }
}
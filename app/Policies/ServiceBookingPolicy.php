<?php

namespace App\Policies;

use App\Models\ServiceBooking;
use App\Models\User;

class ServiceBookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('bookings.view');
    }

    public function view(User $user, ServiceBooking $booking): bool
    {
        return $user->can('bookings.view');
    }

    public function create(User $user): bool
    {
        return $user->can('bookings.create');
    }

    public function update(User $user, ServiceBooking $booking): bool
    {
        return $user->can('bookings.update');
    }

    public function delete(User $user, ServiceBooking $booking): bool
    {
        return $user->can('bookings.delete');
    }
}
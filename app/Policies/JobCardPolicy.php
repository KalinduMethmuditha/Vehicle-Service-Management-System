<?php

namespace App\Policies;

use App\Models\JobCard;
use App\Models\User;

class JobCardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('jobs.view');
    }

    public function view(User $user, JobCard $jobCard): bool
    {
        if ($user->hasAnyRole(['Admin', 'Service Advisor'])) {
            return $user->can('jobs.view');
        }

        return $user->hasRole('Mechanic')
            && $user->can('jobs.view')
            && $this->isAssignedMechanic($user, $jobCard);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Service Advisor'])
            && $user->can('jobs.assign');
    }

    public function update(User $user, JobCard $jobCard): bool
    {
        if ($user->hasAnyRole(['Admin', 'Service Advisor'])) {
            return $user->can('jobs.assign')
                || $user->can('jobs.update');
        }

        return $user->hasRole('Mechanic')
            && $user->can('jobs.update')
            && $this->isAssignedMechanic($user, $jobCard);
    }

    public function updateStatus(
        User $user,
        JobCard $jobCard
    ): bool {
        if ($user->hasAnyRole(['Admin', 'Service Advisor'])) {
            return $user->can('jobs.update');
        }

        return $user->hasRole('Mechanic')
            && $user->can('jobs.update')
            && $this->isAssignedMechanic($user, $jobCard);
    }

    public function delete(User $user, JobCard $jobCard): bool
    {
        return $user->hasRole('Admin')
            && $user->can('jobs.assign');
    }

    private function isAssignedMechanic(
        User $user,
        JobCard $jobCard
    ): bool {
        return $jobCard->mechanics()
            ->where('user_id', $user->id)
            ->exists();
    }
}
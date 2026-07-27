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

        return $user->can('jobs.view') &&
            $jobCard->mechanics()
                ->where('user_id', $user->id)
                ->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('jobs.assign');
    }

    public function update(User $user, JobCard $jobCard): bool
    {
        return $user->can('jobs.assign');
    }

    public function updateStatus(User $user, JobCard $jobCard): bool
    {
        if ($user->hasAnyRole(['Admin', 'Service Advisor'])) {
            return $user->can('jobs.update');
        }

        return $user->can('jobs.update') &&
            $jobCard->mechanics()
                ->where('user_id', $user->id)
                ->exists();
    }

    public function delete(User $user, JobCard $jobCard): bool
    {
        return $user->can('jobs.assign');
    }
}
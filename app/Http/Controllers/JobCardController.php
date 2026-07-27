<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\JobStatus;
use App\Http\Requests\StoreJobCardRequest;
use App\Http\Requests\UpdateJobCardRequest;
use App\Http\Requests\UpdateJobStatusRequest;
use App\Models\JobCard;
use App\Models\Mechanic;
use App\Models\Part;
use App\Models\ServiceBooking;
use App\Services\JobCardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class JobCardController extends Controller
{
    public function __construct(
        private readonly JobCardService $jobCardService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', JobCard::class);

        $baseQuery = JobCard::query()
            ->when(
                $request->user()->hasRole('Mechanic'),
                fn ($query) => $query->whereHas(
                    'mechanics',
                    fn ($query) => $query->where(
                        'user_id',
                        $request->user()->id
                    )
                )
            );

        $jobCards = (clone $baseQuery)
            ->with([
                'serviceBooking.vehicle.customer',
                'mechanics',
                'parts',
            ])
            ->when(
                $request->input('status'),
                fn ($query, $status) =>
                    $query->where('status', $status)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $canAssign = $request->user()->can('jobs.assign');

        return Inertia::render('JobCards/Index', [
            'jobCards' => $jobCards,

            'mechanics' => $canAssign
                ? Mechanic::where('is_active', true)
                    ->orderBy('name')
                    ->get()
                : [],

            'parts' => $canAssign
                ? Part::available()
                    ->orderBy('name')
                    ->get()
                : [],

            'availableBookings' => $canAssign
                ? ServiceBooking::query()
                    ->with('vehicle.customer')
                    ->whereDoesntHave('jobCard')
                    ->whereNotIn('status', [
                        BookingStatus::Completed->value,
                        BookingStatus::Cancelled->value,
                    ])
                    ->orderBy('starts_at')
                    ->get()
                : [],

            'statuses' => JobStatus::cases(),

            'statistics' => [
                'pending' => (clone $baseQuery)
                    ->where('status', JobStatus::Pending->value)
                    ->count(),

                'in_progress' => (clone $baseQuery)
                    ->where('status', JobStatus::InProgress->value)
                    ->count(),

                'completed' => (clone $baseQuery)
                    ->where('status', JobStatus::Completed->value)
                    ->count(),
            ],

            'filters' => $request->only('status'),
        ]);
    }

    public function store(
        StoreJobCardRequest $request
    ): RedirectResponse {
        $this->jobCardService->create($request->validated());

        return to_route('job-cards.index')
            ->with('success', 'Job card created successfully.');
    }

    public function update(
        UpdateJobCardRequest $request,
        JobCard $jobCard
    ): RedirectResponse {
        Gate::authorize('update', $jobCard);

        $this->jobCardService->update(
            $jobCard,
            $request->validated()
        );

        return to_route('job-cards.index')
            ->with('success', 'Job card updated successfully.');
    }

    public function updateStatus(
        UpdateJobStatusRequest $request,
        JobCard $jobCard
    ): RedirectResponse {
        $this->jobCardService->updateStatus(
            $jobCard,
            JobStatus::from($request->validated('status'))
        );

        return to_route('job-cards.index')
            ->with('success', 'Job status updated successfully.');
    }

    public function destroy(JobCard $jobCard): RedirectResponse
    {
        Gate::authorize('delete', $jobCard);

        $this->jobCardService->delete($jobCard);

        return to_route('job-cards.index')
            ->with('success', 'Job card deleted successfully.');
    }
}
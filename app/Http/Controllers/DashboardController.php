<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\JobStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\Part;
use App\Models\ServiceBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->user()->hasRole('Mechanic')) {
            return $this->mechanicDashboard($request->user());
        }

        if (
            $request->user()->hasAnyRole([
                'Admin',
                'Service Advisor',
            ])
        ) {
            return $this->adminDashboard();
        }

        abort(403, 'Your account does not have a system role.');
    }

    private function adminDashboard(): Response
    {
        $todayBookings = ServiceBooking::query()
            ->with([
                'vehicle.customer:id,name,phone',
            ])
            ->whereDate('starts_at', today())
            ->where(
                'status',
                '!=',
                BookingStatus::Cancelled->value
            )
            ->orderBy('starts_at')
            ->get();

        $lowStockParts = Part::query()
            ->where('is_active', true)
            ->lowStock()
            ->orderBy('stock_quantity')
            ->limit(6)
            ->get([
                'id',
                'part_number',
                'name',
                'stock_quantity',
                'minimum_stock_level',
            ]);

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => [
                'todayBookings' => $todayBookings->count(),

                'activeJobs' => JobCard::query()
                    ->where(
                        'status',
                        JobStatus::InProgress->value
                    )
                    ->count(),

                'lowStock' => Part::query()
                    ->where('is_active', true)
                    ->lowStock()
                    ->count(),

                'dailyRevenue' => Invoice::query()
                    ->where(
                        'payment_status',
                        PaymentStatus::Paid->value
                    )
                    ->whereDate('paid_at', today())
                    ->sum('total_amount'),
            ],

            'todayBookings' => $todayBookings,
            'lowStockParts' => $lowStockParts,
        ]);
    }

    private function mechanicDashboard(User $user): Response
    {
        $assignedJobs = JobCard::query()
            ->whereHas(
                'mechanics',
                fn ($query) => $query->where(
                    'mechanics.user_id',
                    $user->id
                )
            );

        $activeAssignedJobs = (clone $assignedJobs)
            ->with([
                'serviceBooking.vehicle.customer:id,name,phone',
                'parts:id,part_number,name',
            ])
            ->whereIn('status', [
                JobStatus::Pending->value,
                JobStatus::InProgress->value,
            ])
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Dashboard/MechanicDashboard', [
            'stats' => [
                'todayJobs' => (clone $assignedJobs)
                    ->whereHas(
                        'serviceBooking',
                        fn ($query) => $query->whereDate(
                            'starts_at',
                            today()
                        )
                    )
                    ->count(),

                'pendingJobs' => (clone $assignedJobs)
                    ->where(
                        'status',
                        JobStatus::Pending->value
                    )
                    ->count(),

                'inProgressJobs' => (clone $assignedJobs)
                    ->where(
                        'status',
                        JobStatus::InProgress->value
                    )
                    ->count(),

                'completedToday' => (clone $assignedJobs)
                    ->where(
                        'status',
                        JobStatus::Completed->value
                    )
                    ->whereDate('completed_at', today())
                    ->count(),
            ],

            'assignedJobs' => $activeAssignedJobs,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Http\Requests\StoreServiceBookingRequest;
use App\Http\Requests\UpdateServiceBookingRequest;
use App\Models\ServiceBooking;
use App\Models\Vehicle;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use DomainException;

class ServiceBookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ServiceBooking::class);

        $bookings = ServiceBooking::query()
            ->with([
                'vehicle:id,customer_id,registration_no,make,model',
                'vehicle.customer:id,name,phone',
                'advisor:id,name',
            ])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where(
                        'booking_number',
                        'like',
                        "%{$search}%"
                    )
                        ->orWhereHas(
                            'vehicle',
                            fn ($query) =>
                                $query->where(
                                    'registration_no',
                                    'like',
                                    "%{$search}%"
                                )
                        )
                        ->orWhereHas(
                            'vehicle.customer',
                            fn ($query) =>
                                $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                        );
                });
            })
            ->when(
                $request->input('status'),
                fn ($query, $status) =>
                    $query->where('status', $status)
            )
            ->when(
                $request->input('date'),
                fn ($query, $date) =>
                    $query->whereDate('starts_at', $date)
            )
            ->orderBy('starts_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,

            'vehicles' => Vehicle::query()
                ->with('customer:id,name')
                ->orderBy('registration_no')
                ->get([
                    'id',
                    'customer_id',
                    'registration_no',
                    'make',
                    'model',
                ]),

            'statuses' => array_map(
                fn (BookingStatus $status) => [
                    'label' => ucfirst($status->value),
                    'value' => $status->value,
                ],
                BookingStatus::cases()
            ),

            'statistics' => [
                'today' => ServiceBooking::whereDate(
                    'starts_at',
                    today()
                )->count(),

                'scheduled' => ServiceBooking::where(
                    'status',
                    BookingStatus::Scheduled->value
                )->count(),

                'confirmed' => ServiceBooking::where(
                    'status',
                    BookingStatus::Confirmed->value
                )->count(),
            ],

            'filters' => $request->only([
                'search',
                'status',
                'date',
            ]),
        ]);
    }

    public function store(
        StoreServiceBookingRequest $request
    ): RedirectResponse {
        $this->bookingService->create(
            $request->validated(),
            $request->user()
        );

        return to_route('bookings.index')
            ->with('success', 'Booking created successfully.');
    }

    public function update(
        UpdateServiceBookingRequest $request,
        ServiceBooking $booking
    ): RedirectResponse {
        $this->bookingService->update(
            $booking,
            $request->validated()
        );

        return to_route('bookings.index')
            ->with('success', 'Booking updated successfully.');
    }

    public function destroy(
      ServiceBooking $booking
    ): RedirectResponse {
      Gate::authorize('delete', $booking);

      try {
        $this->bookingService->delete($booking);
      } catch (DomainException $exception) {
        return to_route('bookings.index')
            ->with('error', $exception->getMessage());
      }

      return to_route('bookings.index')
        ->with('success', 'Booking deleted successfully.');
    }
}
<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Models\ServiceBooking;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use DomainException;

class BookingService
{
    public function create(array $data, User $advisor): ServiceBooking
    {
        return DB::transaction(function () use ($data, $advisor) {
            $status = $data['status']
                ?? BookingStatus::Scheduled->value;

            if (
                $this->hasConflict(
                    (int) $data['vehicle_id'],
                    $data['starts_at'],
                    $data['ends_at']
                )
            ) {
                throw ValidationException::withMessages([
                    'starts_at' =>
                        'This vehicle already has a booking during this time.',
                ]);
            }

            $booking = ServiceBooking::create([
                ...$data,
                'advisor_id' => $advisor->id,
                'status' => $status,
            ]);

            $booking->update([
                'booking_number' =>
                    'BKG-' .
                    now()->format('Ymd') .
                    '-' .
                    str_pad(
                        (string) $booking->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
            ]);

            return $booking->refresh()->load([
                'vehicle.customer',
                'advisor',
            ]);
        });
    }

    public function update(
        ServiceBooking $booking,
        array $data
    ): ServiceBooking {
        return DB::transaction(function () use ($booking, $data) {
            if ($booking->status === BookingStatus::Completed) {
                throw ValidationException::withMessages([
                    'status' => 'Completed bookings cannot be edited.',
                ]);
            }

            $newStatus = $data['status']
                ?? $booking->status->value;

            if (
                $newStatus !== BookingStatus::Cancelled->value &&
                $this->hasConflict(
                    (int) $data['vehicle_id'],
                    $data['starts_at'],
                    $data['ends_at'],
                    $booking->id
                )
            ) {
                throw ValidationException::withMessages([
                    'starts_at' =>
                        'This vehicle already has a booking during this time.',
                ]);
            }

            $booking->update($data);

            return $booking->refresh()->load([
                'vehicle.customer',
                'advisor',
            ]);
        });
    }

    public function delete(
       ServiceBooking $booking
    ): void {
       if ($booking->jobCard()->exists()) {
         throw new DomainException(
            'This booking cannot be permanently deleted because it has a job card.'
        );
     }

      $booking->forceDelete();
    }
    private function hasConflict(
        int $vehicleId,
        string $startsAt,
        string $endsAt,
        ?int $ignoreBookingId = null
    ): bool {
        return ServiceBooking::query()
            ->where('vehicle_id', $vehicleId)
            ->whereNot('status', BookingStatus::Cancelled->value)
            ->when(
                $ignoreBookingId,
                fn ($query) =>
                    $query->whereKeyNot($ignoreBookingId)
            )
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->lockForUpdate()
            ->exists();
    }
}
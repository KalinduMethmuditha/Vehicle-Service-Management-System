<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\JobStatus;
use App\Models\JobCard;
use App\Models\Mechanic;
use App\Models\Part;
use App\Models\ServiceBooking;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobCardService
{
    public function create(array $data): JobCard
    {
        return DB::transaction(function () use ($data) {
            $mechanicIds = $data['mechanic_ids'];
            $parts = $data['parts'];

            unset($data['mechanic_ids'], $data['parts']);

            $booking = ServiceBooking::query()
                ->lockForUpdate()
                ->findOrFail($data['service_booking_id']);

            if (
                in_array($booking->status, [
                    BookingStatus::Cancelled,
                    BookingStatus::Completed,
                ], true)
            ) {
                throw ValidationException::withMessages([
                    'service_booking_id' =>
                        'This booking cannot receive a job card.',
                ]);
            }

            $this->validateMechanics(
                $mechanicIds,
                $booking
            );

            $partSync = $this->buildPartSync($parts);

            $jobCard = JobCard::create([
                ...$data,
                'status' => JobStatus::Pending->value,
            ]);

            $jobCard->update([
                'job_number' =>
                    'JOB-' .
                    now()->format('Ymd') .
                    '-' .
                    str_pad(
                        (string) $jobCard->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
            ]);

            $jobCard->mechanics()->sync($mechanicIds);
            $jobCard->parts()->sync($partSync);

            $booking->update([
                'status' => BookingStatus::Confirmed->value,
            ]);

            return $jobCard->refresh()->load([
                'serviceBooking.vehicle.customer',
                'mechanics',
                'parts',
            ]);
        });
    }

    public function update(
        JobCard $jobCard,
        array $data
    ): JobCard {
        return DB::transaction(function () use ($jobCard, $data) {
            $jobCard = JobCard::query()
                ->lockForUpdate()
                ->findOrFail($jobCard->id);

            if (
                in_array($jobCard->status, [
                    JobStatus::Completed,
                    JobStatus::Cancelled,
                ], true)
            ) {
                throw ValidationException::withMessages([
                    'job' => 'Completed or cancelled jobs cannot be edited.',
                ]);
            }

            $mechanicIds = $data['mechanic_ids'];
            $parts = $data['parts'];

            unset($data['mechanic_ids'], $data['parts']);

            $booking = ServiceBooking::findOrFail(
                $data['service_booking_id']
            );

            $this->validateMechanics(
                $mechanicIds,
                $booking,
                $jobCard->id
            );

            $partSync = $this->buildPartSync($parts);

            $jobCard->update($data);
            $jobCard->mechanics()->sync($mechanicIds);
            $jobCard->parts()->sync($partSync);

            return $jobCard->refresh()->load([
                'serviceBooking.vehicle.customer',
                'mechanics',
                'parts',
            ]);
        });
    }

    public function updateStatus(
        JobCard $jobCard,
        JobStatus $newStatus
    ): JobCard {
        return DB::transaction(function () use (
            $jobCard,
            $newStatus
        ) {
            $jobCard = JobCard::query()
                ->lockForUpdate()
                ->findOrFail($jobCard->id);

            $allowedTransitions = [
                JobStatus::Pending->value => [
                    JobStatus::InProgress,
                    JobStatus::Cancelled,
                ],
                JobStatus::InProgress->value => [
                    JobStatus::Completed,
                    JobStatus::Cancelled,
                ],
                JobStatus::Completed->value => [],
                JobStatus::Cancelled->value => [],
            ];

            if (
                ! in_array(
                    $newStatus,
                    $allowedTransitions[$jobCard->status->value],
                    true
                )
            ) {
                throw ValidationException::withMessages([
                    'status' => 'Invalid job-status transition.',
                ]);
            }

            if ($newStatus === JobStatus::InProgress) {
                $jobCard->update([
                    'status' => $newStatus->value,
                    'started_at' => $jobCard->started_at ?? now(),
                ]);
            }

            if ($newStatus === JobStatus::Completed) {
                $this->deductParts($jobCard);

                $jobCard->update([
                    'status' => $newStatus->value,
                    'completed_at' => now(),
                    'stock_deducted_at' => now(),
                ]);

                $jobCard->serviceBooking->update([
                    'status' => BookingStatus::Completed->value,
                ]);

                $this->invoiceService->generateForJob(
                    $jobCard->refresh()
                );
            }

            if ($newStatus === JobStatus::Cancelled) {
                $jobCard->update([
                    'status' => $newStatus->value,
                ]);

                $jobCard->serviceBooking->update([
                    'status' => BookingStatus::Cancelled->value,
                ]);
            }

            return $jobCard->refresh()->load([
                'serviceBooking.vehicle.customer',
                'mechanics',
                'parts',
            ]);
        });
    }

    public function delete(JobCard $jobCard): void
    {
        if ($jobCard->status !== JobStatus::Pending) {
            throw ValidationException::withMessages([
                'job' => 'Only pending jobs can be deleted.',
            ]);
        }

        $jobCard->delete();
    }

    private function validateMechanics(
        array $mechanicIds,
        ServiceBooking $booking,
        ?int $ignoreJobCardId = null
    ): void {
        $activeCount = Mechanic::query()
            ->whereIn('id', $mechanicIds)
            ->where('is_active', true)
            ->count();

        if ($activeCount !== count(array_unique($mechanicIds))) {
            throw ValidationException::withMessages([
                'mechanic_ids' =>
                    'One or more mechanics are unavailable.',
            ]);
        }

        foreach ($mechanicIds as $mechanicId) {
            $hasConflict = JobCard::query()
                ->whereIn('status', [
                    JobStatus::Pending->value,
                    JobStatus::InProgress->value,
                ])
                ->whereHas(
                    'mechanics',
                    fn ($query) =>
                        $query->where('mechanics.id', $mechanicId)
                )
                ->whereHas(
                    'serviceBooking',
                    fn ($query) =>
                        $query
                            ->where(
                                'starts_at',
                                '<',
                                $booking->ends_at
                            )
                            ->where(
                                'ends_at',
                                '>',
                                $booking->starts_at
                            )
                )
                ->when(
                    $ignoreJobCardId,
                    fn ($query) =>
                        $query->whereKeyNot($ignoreJobCardId)
                )
                ->exists();

            if ($hasConflict) {
                throw ValidationException::withMessages([
                    'mechanic_ids' =>
                        'A selected mechanic is already assigned during this time.',
                ]);
            }
        }
    }

    private function buildPartSync(array $items): array
    {
        $sync = [];

        foreach ($items as $item) {
            $part = Part::query()
                ->lockForUpdate()
                ->findOrFail($item['part_id']);

            if ($part->stock_quantity < $item['quantity']) {
                throw ValidationException::withMessages([
                    'parts' =>
                        "Insufficient stock for {$part->name}.",
                ]);
            }

            $sync[$part->id] = [
                'quantity' => $item['quantity'],
                'unit_price' => $part->unit_price,
            ];
        }

        return $sync;
    }

    private function deductParts(JobCard $jobCard): void
    {
        if ($jobCard->stock_deducted_at) {
            return;
        }

        $jobCard->load('parts');

        foreach ($jobCard->parts as $assignedPart) {
            $part = Part::withTrashed()
                ->lockForUpdate()
                ->findOrFail($assignedPart->id);

            $quantity = (int) $assignedPart->pivot->quantity;

            if ($part->stock_quantity < $quantity) {
                throw ValidationException::withMessages([
                    'parts' =>
                        "Insufficient stock for {$part->name}.",
                ]);
            }

            $part->decrement('stock_quantity', $quantity);
        }
    }

    public function __construct(
    private readonly InvoiceService $invoiceService
    ) {
    }
}
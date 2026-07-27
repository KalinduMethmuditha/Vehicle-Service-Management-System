<?php

namespace App\Services;

use App\Enums\JobStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\JobCard;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function generateForJob(JobCard $jobCard): Invoice
    {
        return DB::transaction(function () use ($jobCard) {
            $jobCard = JobCard::query()
                ->with([
                    'parts',
                    'serviceBooking.vehicle.customer',
                ])
                ->lockForUpdate()
                ->findOrFail($jobCard->id);

            if ($jobCard->status !== JobStatus::Completed) {
                throw ValidationException::withMessages([
                    'job' =>
                        'An invoice can only be generated for a completed job.',
                ]);
            }

            $existingInvoice = Invoice::where(
                'job_card_id',
                $jobCard->id
            )->first();

            if ($existingInvoice) {
                return $existingInvoice->load([
                    'customer',
                    'jobCard.parts',
                ]);
            }

            $laborTotal = round(
                (float) $jobCard->labor_cost,
                2
            );

            $partsTotal = round(
                $jobCard->parts->sum(function ($part) {
                    return
                        (float) $part->pivot->unit_price *
                        (int) $part->pivot->quantity;
                }),
                2
            );

            $invoice = Invoice::create([
                'job_card_id' => $jobCard->id,
                'customer_id' =>
                    $jobCard->serviceBooking
                        ->vehicle
                        ->customer
                        ->id,
                'labor_total' => $laborTotal,
                'parts_total' => $partsTotal,
                'total_amount' => round(
                    $laborTotal + $partsTotal,
                    2
                ),
                'payment_status' =>
                    PaymentStatus::Pending->value,
                'issued_at' => now(),
            ]);

            $invoice->update([
                'invoice_number' =>
                    'INV-' .
                    now()->format('Ym') .
                    '-' .
                    str_pad(
                        (string) $invoice->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
            ]);

            return $invoice->refresh()->load([
                'customer',
                'jobCard.parts',
                'jobCard.serviceBooking.vehicle',
            ]);
        });
    }

    public function updatePaymentStatus(
        Invoice $invoice,
        PaymentStatus $status
    ): Invoice {
        return DB::transaction(function () use (
            $invoice,
            $status
        ) {
            $invoice = Invoice::query()
                ->lockForUpdate()
                ->findOrFail($invoice->id);

            $invoice->update([
                'payment_status' => $status->value,
                'paid_at' =>
                    $status === PaymentStatus::Paid
                        ? now()
                        : null,
            ]);

            return $invoice->refresh();
        });
    }
}
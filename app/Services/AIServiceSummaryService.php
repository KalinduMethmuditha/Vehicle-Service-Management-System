<?php

namespace App\Services;

use App\Enums\JobStatus;
use App\Models\JobCard;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AIServiceSummaryService
{
    public function generate(JobCard $jobCard): string
    {
        if ($jobCard->status !== JobStatus::Completed) {
            throw ValidationException::withMessages([
                'ai_summary' => 'Only completed jobs can have an AI service summary.',
            ]);
        }

        $apiKey = config('services.openai.key');

        if (blank($apiKey)) {
            throw ValidationException::withMessages([
                'ai_summary' => 'The OpenAI API key has not been configured.',
            ]);
        }

        $jobCard->loadMissing([
            'serviceBooking.vehicle.customer',
            'mechanics',
            'parts',
        ]);

        $booking = $jobCard->serviceBooking;
        $vehicle = $booking?->vehicle;
        $customer = $vehicle?->customer;

        $mechanics = $jobCard->mechanics
            ->pluck('name')
            ->filter()
            ->values()
            ->all();

        $parts = $jobCard->parts
            ->map(fn ($part) => [
                'name' => $part->name,
                'quantity' => (int) $part->pivot->quantity,
                'unit_price' => (float) $part->pivot->unit_price,
            ])
            ->values()
            ->all();

        $details = [
            'job_number' => $jobCard->job_number,
            'customer' => $customer?->name,
            'vehicle' => [
                'registration_number' => $vehicle?->registration_no,
                'make' => $vehicle?->make,
                'model' => $vehicle?->model,
                'year' => $vehicle?->year,
                'mileage' => $vehicle?->mileage,
            ],
            'customer_complaint' => $booking?->complaint
                ?? $booking?->customer_complaint
                ?? $booking?->notes,
            'diagnosis' => $jobCard->diagnosis,
            'work_performed' => $jobCard->work_description,
            'mechanics' => $mechanics,
            'parts_used' => $parts,
            'labor_cost_lkr' => (float) $jobCard->labor_cost,
            'technician_completion_notes' => $jobCard->completion_summary,
            'completed_at' => $jobCard->completed_at?->toIso8601String(),
        ];

        $input = <<<'PROMPT'
Create a professional vehicle service completion summary using only the supplied job data.

Requirements:
- Write one concise paragraph of approximately 80 to 120 words.
- Use clear, professional language suitable for a customer and an invoice.
- Explain the reported concern, diagnosis, work completed, and parts replaced.
- Mention that the vehicle is ready for collection only when the supplied data supports it.
- Do not invent repairs, test results, safety claims, warranties, prices, or recommendations.
- If a detail is missing, omit it instead of guessing.
- Return only the summary paragraph without a heading, bullets, markdown, or quotation marks.

Job data:
PROMPT;

        $input .= "\n".json_encode(
            $details,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->timeout(30)
                ->retry(2, 500, throw: false)
                ->post(
                    rtrim(
                        (string) config(
                            'services.openai.url',
                            'https://api.openai.com/v1'
                        ),
                        '/'
                    ).'/responses',
                    [
                        'model' => config(
                            'services.openai.model',
                            'gpt-5-mini'
                        ),
                        'instructions' => 'You write accurate, professional vehicle service completion summaries.',
                        'input' => $input,
                        'max_output_tokens' => 500,
                    ]
                );
        } catch (ConnectionException) {
            throw ValidationException::withMessages([
                'ai_summary' => 'Could not connect to the AI service. Check the internet connection and try again.',
            ]);
        }

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'ai_summary' => sprintf(
                    'The AI service request failed (HTTP %d). Check the API key, model, and billing settings.',
                    $response->status()
                ),
            ]);
        }

        $content = collect($response->json('output', []))
            ->filter(
                fn ($item) => ($item['type'] ?? null) === 'message'
            )
            ->flatMap(
                fn ($item) => $item['content'] ?? []
            )
            ->first(
                fn ($item) => ($item['type'] ?? null) === 'output_text'
            );

        $summary = trim(
            (string) (
                $content['text']
                ?? $response->json('output_text')
                ?? ''
            )
        );

        if ($summary === '') {
            throw ValidationException::withMessages([
                'ai_summary' => 'The AI service returned an empty summary. Please try again.',
            ]);
        }

        $jobCard->forceFill([
            'ai_summary' => $summary,
            'ai_summary_generated_at' => now(),
        ])->save();

        return $summary;
    }
}

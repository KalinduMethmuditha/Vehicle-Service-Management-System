<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('jobs.assign');
    }

    public function rules(): array
    {
        return [
            'service_booking_id' => [
                'required',
                'integer',
                'exists:service_bookings,id',
                Rule::unique('job_cards', 'service_booking_id')
                    ->ignore($this->route('job_card')->id),
            ],
            'diagnosis' => ['nullable', 'string', 'max:5000'],
            'work_description' => ['nullable', 'string', 'max:5000'],
            'labor_cost' => ['required', 'numeric', 'min:0'],

            'mechanic_ids' => ['required', 'array', 'min:1'],
            'mechanic_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('mechanics', 'id')
                    ->where('is_active', true),
            ],

            'parts' => ['present', 'array'],
            'parts.*.part_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('parts', 'id')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'parts.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('bookings.create');
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],
            'starts_at' => [
                'required',
                'date',
                'after_or_equal:today',
            ],
            'ends_at' => [
                'required',
                'date',
                'after:starts_at',
            ],
            'complaint' => [
                'required',
                'string',
                'max:3000',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:3000',
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    BookingStatus::Scheduled->value,
                    BookingStatus::Confirmed->value,
                ]),
            ],
        ];
    }
}
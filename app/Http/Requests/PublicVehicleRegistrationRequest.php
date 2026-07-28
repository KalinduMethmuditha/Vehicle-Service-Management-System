<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicVehicleRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_name' => trim(
                (string) $this->customer_name
            ),
            'email' => strtolower(
                trim((string) $this->email)
            ),
            'registration_no' => strtoupper(
                trim((string) $this->registration_no)
            ),
            'vin' => $this->filled('vin')
                ? strtoupper(trim((string) $this->vin))
                : null,
        ]);
    }

    public function rules(): array
    {
        return [
            // Honeypot field for basic spam protection.
            'website' => ['nullable', 'string', 'max:0'],

            'customer_name' => [
                'required',
                'string',
                'max:100',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/',
            ],
            'address' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'registration_no' => [
                'required',
                'string',
                'max:30',
                'unique:vehicles,registration_no',
            ],
            'make' => [
                'required',
                'string',
                'max:100',
            ],
            'model' => [
                'required',
                'string',
                'max:100',
            ],
            'year' => [
                'required',
                'integer',
                'min:1900',
                'max:' . (date('Y') + 1),
            ],
            'vin' => [
                'nullable',
                'string',
                'size:17',
                'unique:vehicles,vin',
            ],
            'mileage' => [
                'required',
                'integer',
                'min:0',
            ],
            'consent' => [
                'accepted',
            ],
        ];
    }
}
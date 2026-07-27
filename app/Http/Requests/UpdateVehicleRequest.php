<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('vehicles.update');
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
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
        $vehicle = $this->route('vehicle');

        return [
            'customer_id' => [
                'required',
                'integer',
                'exists:customers,id',
            ],
            'registration_no' => [
                'required',
                'string',
                'max:30',
                Rule::unique('vehicles', 'registration_no')
                    ->ignore($vehicle),
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
                Rule::unique('vehicles', 'vin')
                    ->ignore($vehicle),
            ],
            'mileage' => [
                'required',
                'integer',
                'min:0',
            ],
        ];
    }
}
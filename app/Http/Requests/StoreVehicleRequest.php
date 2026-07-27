<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('vehicles.create');
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
        ];
    }
}
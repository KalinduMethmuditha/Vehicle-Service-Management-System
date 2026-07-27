<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('parts.update');
    }

    protected function prepareForValidation(): void
    {
        $data = [
            'part_number' => strtoupper(
                trim((string) $this->part_number)
            ),
        ];

        if ($this->has('is_active')) {
            $data['is_active'] = $this->boolean('is_active');
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        $part = $this->route('part');

        return [
            'part_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('parts', 'part_number')
                    ->ignore($part),
            ],
            'name' => [
                'required',
                'string',
                'max:150',
            ],
            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'stock_quantity' => [
                'required',
                'integer',
                'min:0',
            ],
            'minimum_stock_level' => [
                'required',
                'integer',
                'min:0',
            ],
            'unit_price' => [
                'required',
                'numeric',
                'min:0',
                'decimal:0,2',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
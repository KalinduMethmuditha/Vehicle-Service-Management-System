<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMechanicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('mechanics.create');
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'employee_id' => strtoupper(
                trim((string) $this->employee_id)
            ),
            'user_id' => $this->filled('user_id')
                ? (int) $this->user_id
                : null,
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                'unique:mechanics,user_id',
            ],
            'employee_id' => [
                'required',
                'string',
                'max:30',
                'unique:mechanics,employee_id',
            ],
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'specialization' => [
                'required',
                'string',
                'max:150',
            ],
            'contact' => [
                'required',
                'string',
                'max:30',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }
}
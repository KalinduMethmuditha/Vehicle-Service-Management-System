<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMechanicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('mechanics.update');
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
        $mechanic = $this->route('mechanic');

        return [
            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                Rule::unique('mechanics', 'user_id')
                    ->ignore($mechanic),
            ],
            'employee_id' => [
                'required',
                'string',
                'max:30',
                Rule::unique('mechanics', 'employee_id')
                    ->ignore($mechanic),
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
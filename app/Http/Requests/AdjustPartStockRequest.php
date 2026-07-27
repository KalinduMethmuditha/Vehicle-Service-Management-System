<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustPartStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('parts.update');
    }

    public function rules(): array
    {
        return [
            'type' => [
                'required',
                Rule::in(['increase', 'decrease']),
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }
}
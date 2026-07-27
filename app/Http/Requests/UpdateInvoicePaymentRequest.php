<?php

namespace App\Http\Requests;

use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoicePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        return $invoice &&
            $this->user()->can('update', $invoice);
    }

    public function rules(): array
    {
        return [
            'payment_status' => [
                'required',
                Rule::enum(PaymentStatus::class),
            ],
        ];
    }
}
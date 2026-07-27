<?php

namespace App\Http\Requests;

use App\Enums\JobStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $jobCard = $this->route('job_card');

        return $jobCard &&
            $this->user()->can('updateStatus', $jobCard);
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    JobStatus::InProgress->value,
                    JobStatus::Completed->value,
                    JobStatus::Cancelled->value,
                ]),
            ],
        ];
    }
}
<?php

namespace App\Http\Requests;

use App\Enums\SolicitacaoStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSolicitacaoStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(SolicitacaoStatus::values())],
        ];
    }
}

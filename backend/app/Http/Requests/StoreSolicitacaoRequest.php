<?php

namespace App\Http\Requests;

use App\Enums\SolicitacaoCategoria;
use App\Enums\SolicitacaoPrioridade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSolicitacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_solicitante' => ['required', 'string', 'min:2', 'max:150'],
            'categoria' => ['required', Rule::in(SolicitacaoCategoria::values())],
            'prioridade' => ['required', Rule::in(SolicitacaoPrioridade::values())],
            'descricao' => ['required', 'string', 'min:10', 'max:2000'],
            'justificativa_prioridade' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $prioridade = strtoupper((string) $this->input('prioridade', ''));
            $justificativa = trim((string) $this->input('justificativa_prioridade', ''));

            if ($prioridade === SolicitacaoPrioridade::URGENTE->value && $justificativa === '') {
                $validator->errors()->add(
                    'justificativa_prioridade',
                    'A prioridade urgente exige uma justificativa.'
                );
            }
        });
    }
}

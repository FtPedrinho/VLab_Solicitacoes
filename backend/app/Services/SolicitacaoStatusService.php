<?php

namespace App\Services;

use App\Enums\SolicitacaoPrioridade;
use App\Enums\SolicitacaoStatus;
use Illuminate\Validation\ValidationException;

class SolicitacaoStatusService
{
    /**
     * @return array<string>
     */
    public function proximosStatusPermitidos(string $statusAtual): array
    {
        return match ($statusAtual) {
            SolicitacaoStatus::RECEBIDA->value => [
                SolicitacaoStatus::EM_ANALISE->value,
                SolicitacaoStatus::CANCELADA->value,
            ],
            SolicitacaoStatus::EM_ANALISE->value => [
                SolicitacaoStatus::AGENDADA->value,
                SolicitacaoStatus::CANCELADA->value,
            ],
            SolicitacaoStatus::AGENDADA->value => [
                SolicitacaoStatus::CONCLUIDA->value,
                SolicitacaoStatus::CANCELADA->value,
            ],
            default => [],
        };
    }

    public function validarTransicao(string $statusAtual, string $novoStatus): void
    {
        $permitidos = $this->proximosStatusPermitidos($statusAtual);

        if (! in_array($novoStatus, $permitidos, true)) {
            throw ValidationException::withMessages([
                'status' => "Transição inválida: {$statusAtual} -> {$novoStatus}.",
            ]);
        }
    }

    public function validarCriacao(array $dados): void
    {
        $prioridade = strtoupper((string) ($dados['prioridade'] ?? ''));
        $justificativa = trim((string) ($dados['justificativa_prioridade'] ?? ''));

        if ($prioridade === SolicitacaoPrioridade::URGENTE->value && $justificativa === '') {
            throw ValidationException::withMessages([
                'justificativa_prioridade' => 'A prioridade urgente exige uma justificativa.',
            ]);
        }
    }
}

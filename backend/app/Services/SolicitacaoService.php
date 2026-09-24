<?php

namespace App\Services;

use App\Enums\SolicitacaoPrioridade;
use App\Enums\SolicitacaoStatus;
use App\Models\Solicitacao;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SolicitacaoService
{
    public function __construct(
        protected readonly SolicitacaoStatusService $statusService,
    ) {}

    public function criar(array $dados): Solicitacao
    {
        $this->statusService->validarCriacao($dados);

        $dados['status'] = SolicitacaoStatus::RECEBIDA->value;
        $dados['protocolo'] = Solicitacao::gerarProtocolo();
        $dados['data_criacao'] = now();
        $dados['data_atualizacao'] = now();

        if (($dados['prioridade'] ?? null) !== SolicitacaoPrioridade::URGENTE->value) {
            $dados['justificativa_prioridade'] = null;
        }

        return DB::transaction(
            static fn (): Solicitacao => Solicitacao::create($dados)
        );
    }

    public function atualizarStatus(Solicitacao $solicitacao, string $novoStatus): Solicitacao
    {
        $novoStatus = strtoupper($novoStatus);

        if ($novoStatus === '') {
            throw ValidationException::withMessages([
                'status' => 'O status é obrigatório.',
            ]);
        }

        $this->statusService->validarTransicao($solicitacao->status, $novoStatus);

        $solicitacao->status = $novoStatus;
        $solicitacao->data_atualizacao = now();
        $solicitacao->save();

        return $solicitacao;
    }
}

<?php

namespace App\Listeners;

use App\Events\StatusAtualizado;
use App\Models\SolicitacaoStatusHistorico;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegistrarHistoricoStatus implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(StatusAtualizado $event): void
    {
        try {
            SolicitacaoStatusHistorico::create([
                'solicitacao_id' => $event->solicitacao->id,
                'usuario_id' => $event->usuarioId,
                'status_anterior' => $event->statusAnterior,
                'status_novo' => $event->statusNovo,
                'alterado_em' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::error('status.history.failed', [
                'solicitacao_id' => $event->solicitacao->id,
                'status_novo' => $event->statusNovo,
                'error' => $exception->getMessage(),
            ]);
            throw $exception;
        }
    }
}

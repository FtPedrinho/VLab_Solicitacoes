<?php

namespace App\Events;

use App\Models\Solicitacao;

class StatusAtualizado
{
    public function __construct(
        public readonly Solicitacao $solicitacao,
        public readonly string $statusAnterior,
        public readonly string $statusNovo,
        public readonly ?int $usuarioId = null,
    ) {}
}

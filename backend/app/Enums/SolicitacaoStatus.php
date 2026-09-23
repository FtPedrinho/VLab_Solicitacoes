<?php

namespace App\Enums;

enum SolicitacaoStatus: string
{
    case RECEBIDA = 'RECEBIDA';
    case EM_ANALISE = 'EM_ANALISE';
    case AGENDADA = 'AGENDADA';
    case CONCLUIDA = 'CONCLUIDA';
    case CANCELADA = 'CANCELADA';

    public static function values(): array
    {
        return array_map(
            static fn (self $status) => $status->value,
            self::cases(),
        );
    }
}

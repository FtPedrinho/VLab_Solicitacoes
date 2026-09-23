<?php

namespace App\Enums;

enum SolicitacaoPrioridade: string
{
    case BAIXA = 'BAIXA';
    case MEDIA = 'MEDIA';
    case ALTA = 'ALTA';
    case URGENTE = 'URGENTE';

    public static function values(): array
    {
        return array_map(
            static fn (self $prioridade) => $prioridade->value,
            self::cases(),
        );
    }
}

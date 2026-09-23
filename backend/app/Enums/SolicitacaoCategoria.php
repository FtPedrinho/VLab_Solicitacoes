<?php

namespace App\Enums;

enum SolicitacaoCategoria: string
{
    case CONSULTA = 'CONSULTA';
    case EXAME = 'EXAME';
    case VACINACAO = 'VACINACAO';
    case OUTRO = 'OUTRO';

    public static function values(): array
    {
        return array_map(
            static fn (self $categoria) => $categoria->value,
            self::cases(),
        );
    }
}

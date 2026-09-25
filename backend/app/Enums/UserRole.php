<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case ATENDENTE = 'atendente';
    case SOLICITANTE = 'solicitante';

    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}

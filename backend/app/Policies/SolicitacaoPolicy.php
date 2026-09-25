<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Solicitacao;
use App\Models\User;

class SolicitacaoPolicy
{
    public function updateStatus(User $user, Solicitacao $solicitacao): bool
    {
        return in_array($user->role, [UserRole::ADMIN->value, UserRole::ATENDENTE->value], true);
    }
}

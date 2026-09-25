<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitacaoStatusHistorico extends Model
{
    protected $table = 'solicitacao_status_historicos';

    public $timestamps = false;

    protected $fillable = ['solicitacao_id', 'usuario_id', 'status_anterior', 'status_novo', 'alterado_em'];

    protected $casts = ['alterado_em' => 'datetime'];
}

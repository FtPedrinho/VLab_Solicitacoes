<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitacao extends Model
{
    protected $table = 'solicitacoes';

    public $timestamps = false;

    protected $fillable = [
        'protocolo',
        'nome_solicitante',
        'categoria',
        'prioridade',
        'status',
        'descricao',
        'justificativa_prioridade',
        'data_criacao',
        'data_atualizacao',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
        'data_atualizacao' => 'datetime',
    ];

    public static function gerarProtocolo(): string
    {
        $anoAtual = now()->year;
        $ultimoProtocolo = self::query()
            ->where('protocolo', 'like', "SOL-{$anoAtual}-%")
            ->orderByDesc('id')
            ->value('protocolo');

        $numeroSequencial = 1;

        if ($ultimoProtocolo) {
            preg_match('/(\d{6})$/', $ultimoProtocolo, $matches);
            $numeroSequencial = isset($matches[1]) ? ((int) $matches[1]) + 1 : 1;
        }

        return sprintf('SOL-%s-%06d', $anoAtual, $numeroSequencial);
    }
}

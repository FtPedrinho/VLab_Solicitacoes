<?php

namespace Database\Seeders;

use App\Models\Solicitacao;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password'), 'role' => 'atendente']
        );
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Administrador', 'password' => bcrypt('password'), 'role' => 'admin']
        );
        User::updateOrCreate(
            ['email' => 'paciente@example.com'],
            ['name' => 'Paciente Demonstracao', 'password' => bcrypt('password'), 'role' => 'solicitante']
        );

        $solicitacoes = [
            [
                'protocolo' => 'SOL-2026-900001',
                'nome_solicitante' => 'Maria Exemplo',
                'categoria' => 'CONSULTA',
                'prioridade' => 'ALTA',
                'status' => 'RECEBIDA',
                'descricao' => 'Solicitação fictícia de consulta para demonstração.',
                'justificativa_prioridade' => null,
            ],
            [
                'protocolo' => 'SOL-2026-900002',
                'nome_solicitante' => 'João Exemplo',
                'categoria' => 'EXAME',
                'prioridade' => 'URGENTE',
                'status' => 'EM_ANALISE',
                'descricao' => 'Solicitação fictícia de exame para demonstração.',
                'justificativa_prioridade' => 'Necessidade fictícia de atendimento prioritário.',
            ],
            [
                'protocolo' => 'SOL-2026-900003',
                'nome_solicitante' => 'Ana Exemplo',
                'categoria' => 'VACINACAO',
                'prioridade' => 'MEDIA',
                'status' => 'AGENDADA',
                'descricao' => 'Solicitação fictícia de vacinação agendada.',
                'justificativa_prioridade' => null,
            ],
            [
                'protocolo' => 'SOL-2026-900004',
                'nome_solicitante' => 'Carlos Exemplo',
                'categoria' => 'EXAME',
                'prioridade' => 'BAIXA',
                'status' => 'CONCLUIDA',
                'descricao' => 'Solicitação fictícia de exame concluída.',
                'justificativa_prioridade' => null,
            ],
        ];

        foreach ($solicitacoes as $dados) {
            Solicitacao::updateOrCreate(
                ['protocolo' => $dados['protocolo']],
                [...$dados, 'data_criacao' => now(), 'data_atualizacao' => now()]
            );
        }
    }
}

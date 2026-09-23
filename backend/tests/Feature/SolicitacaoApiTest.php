<?php

namespace Tests\Feature;

use App\Enums\SolicitacaoStatus;
use App\Models\Solicitacao;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SolicitacaoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pode_criar_solicitacao_com_status_inicial_recebida(): void
    {
        $payload = [
            'nome_solicitante' => 'Maria Exemplo',
            'categoria' => 'CONSULTA',
            'prioridade' => 'ALTA',
            'descricao' => 'Solicitação fictícia de atendimento para avaliação inicial.',
        ];

        $response = $this->postJson('/api/v1/solicitacoes', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', SolicitacaoStatus::RECEBIDA->value)
            ->assertJsonPath('protocolo', fn (string $protocolo) => preg_match('/^SOL-\d{4}-\d{6}$/', $protocolo) === 1);

        $this->assertDatabaseHas('solicitacoes', [
            'nome_solicitante' => 'Maria Exemplo',
            'status' => SolicitacaoStatus::RECEBIDA->value,
        ]);
    }

    public function test_prioridade_urgente_exige_justificativa(): void
    {
        $response = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'João Exemplo',
            'categoria' => 'EXAME',
            'prioridade' => 'URGENTE',
            'descricao' => 'Solicitação fictícia de exame.',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['justificativa_prioridade']);
    }

    public function test_status_pode_ser_atualizado_se_transicao_for_permitida(): void
    {
        $solicitacao = Solicitacao::create([
            'protocolo' => 'SOL-2026-000001',
            'nome_solicitante' => 'Ana Exemplo',
            'categoria' => 'VACINACAO',
            'prioridade' => 'MEDIA',
            'status' => SolicitacaoStatus::RECEBIDA->value,
            'descricao' => 'Solicitação fictícia de vacinação.',
            'data_criacao' => now(),
            'data_atualizacao' => now(),
        ]);

        $response = $this->patchJson('/api/v1/solicitacoes/'.$solicitacao->id.'/status', [
            'status' => SolicitacaoStatus::EM_ANALISE->value,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', SolicitacaoStatus::EM_ANALISE->value);

        $this->assertDatabaseHas('solicitacoes', [
            'id' => $solicitacao->id,
            'status' => SolicitacaoStatus::EM_ANALISE->value,
        ]);
    }

    public function test_transicao_invalida_retornara_erro_de_validacao(): void
    {
        $solicitacao = Solicitacao::create([
            'protocolo' => 'SOL-2026-000002',
            'nome_solicitante' => 'Carlos Exemplo',
            'categoria' => 'OUTRO',
            'prioridade' => 'BAIXA',
            'status' => SolicitacaoStatus::RECEBIDA->value,
            'descricao' => 'Solicitação fictícia para teste de transição.',
            'data_criacao' => now(),
            'data_atualizacao' => now(),
        ]);

        $response = $this->patchJson('/api/v1/solicitacoes/'.$solicitacao->id.'/status', [
            'status' => SolicitacaoStatus::CONCLUIDA->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }
}

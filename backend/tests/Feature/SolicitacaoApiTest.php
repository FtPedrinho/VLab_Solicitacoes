<?php

namespace Tests\Feature;

use App\Enums\SolicitacaoStatus;
use App\Models\Solicitacao;
use App\Models\User;
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

    public function test_solicitacao_de_exame_urgente_e_persistida_e_consultavel(): void
    {
        $response = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'João Exemplo',
            'categoria' => 'EXAME',
            'prioridade' => 'URGENTE',
            'descricao' => 'Solicitação fictícia de exame prioritário.',
            'justificativa_prioridade' => 'Necessidade fictícia de prioridade.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('categoria', 'EXAME')
            ->assertJsonPath('prioridade', 'URGENTE')
            ->assertJsonPath('status', 'RECEBIDA');

        $id = $response->json('id');

        $this->assertDatabaseHas('solicitacoes', [
            'id' => $id,
            'categoria' => 'EXAME',
            'prioridade' => 'URGENTE',
            'justificativa_prioridade' => 'Necessidade fictícia de prioridade.',
        ]);

        $this->getJson('/api/v1/solicitacoes/'.$id)
            ->assertOk()
            ->assertJsonPath('id', $id)
            ->assertJsonPath('categoria', 'EXAME');
    }

    public function test_retorna_resumo_agregado_para_o_dashboard(): void
    {
        Solicitacao::create([
            'protocolo' => 'SOL-2026-000010',
            'nome_solicitante' => 'Resumo Recebida',
            'categoria' => 'CONSULTA',
            'prioridade' => 'URGENTE',
            'status' => 'RECEBIDA',
            'descricao' => 'Solicitação para validar o resumo do dashboard.',
            'data_criacao' => now(),
            'data_atualizacao' => now(),
        ]);

        $this->getJson('/api/v1/solicitacoes/resumo')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('by_status.RECEBIDA', 1)
            ->assertJsonPath('by_category.CONSULTA', 1)
            ->assertJsonPath('by_priority.URGENTE', 1);
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

        $token = $this->loginAs('atendente');
        $response = $this->withToken($token)->patchJson('/api/v1/solicitacoes/'.$solicitacao->id.'/status', [
            'status' => SolicitacaoStatus::EM_ANALISE->value,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', SolicitacaoStatus::EM_ANALISE->value);

        $this->assertDatabaseHas('solicitacoes', [
            'id' => $solicitacao->id,
            'status' => SolicitacaoStatus::EM_ANALISE->value,
        ]);
        $this->assertDatabaseHas('solicitacao_status_historicos', [
            'solicitacao_id' => $solicitacao->id,
            'status_anterior' => 'RECEBIDA',
            'status_novo' => 'EM_ANALISE',
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

        $token = $this->loginAs('atendente');
        $response = $this->withToken($token)->patchJson('/api/v1/solicitacoes/'.$solicitacao->id.'/status', [
            'status' => SolicitacaoStatus::CONCLUIDA->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_lista_pode_filtrar_por_status_e_retorna_paginacao(): void
    {
        Solicitacao::create([
            'protocolo' => 'SOL-2026-000003',
            'nome_solicitante' => 'Lista Recebida',
            'categoria' => 'CONSULTA',
            'prioridade' => 'MEDIA',
            'status' => 'RECEBIDA',
            'descricao' => 'Solicitação fictícia para validar filtros.',
            'data_criacao' => now(),
            'data_atualizacao' => now(),
        ]);
        Solicitacao::create([
            'protocolo' => 'SOL-2026-000004',
            'nome_solicitante' => 'Lista Cancelada',
            'categoria' => 'OUTRO',
            'prioridade' => 'BAIXA',
            'status' => 'CANCELADA',
            'descricao' => 'Solicitação fictícia cancelada.',
            'data_criacao' => now(),
            'data_atualizacao' => now(),
        ]);

        $response = $this->getJson('/api/v1/solicitacoes?status=RECEBIDA&per_page=1');

        $response->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('per_page', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'RECEBIDA');
    }

    public function test_consulta_inexistente_retorna_not_found_em_json(): void
    {
        $this->getJson('/api/v1/solicitacoes/999999')
            ->assertNotFound()
            ->assertJsonPath('message', 'Solicitação não encontrada.');
    }

    public function test_login_retorna_token_e_permite_consultar_usuario(): void
    {
        User::factory()->create(['email' => 'agent@example.com', 'password' => 'password', 'role' => 'atendente']);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'agent@example.com',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('user.role', 'atendente');

        $this->withToken($login->json('token'))
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('email', 'agent@example.com');
    }

    public function test_cadastro_cria_usuario_com_perfil_selecionado_e_autentica(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Novo Atendente',
            'email' => 'novo@example.com',
            'password' => 'secret123',
            'role' => 'atendente',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'novo@example.com')
            ->assertJsonPath('user.role', 'atendente')
            ->assertJsonStructure(['token', 'token_type', 'user']);

        $this->assertDatabaseHas('users', [
            'email' => 'novo@example.com',
            'role' => 'atendente',
        ]);
    }

    public function test_cadastro_rejeita_email_duplicado_e_perfil_invalido(): void
    {
        User::factory()->create(['email' => 'existente@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Pessoa',
            'email' => 'existente@example.com',
            'password' => 'secret123',
            'role' => 'gerente',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'role']);
    }

    public function test_atualizacao_de_status_exige_perfil_autorizado(): void
    {
        $solicitacao = Solicitacao::create([
            'protocolo' => 'SOL-2026-000099', 'nome_solicitante' => 'Teste',
            'categoria' => 'CONSULTA', 'prioridade' => 'MEDIA', 'status' => 'RECEBIDA',
            'descricao' => 'Descrição de teste.', 'data_criacao' => now(), 'data_atualizacao' => now(),
        ]);
        $user = User::factory()->create(['role' => 'solicitante']);
        $this->actingAs($user)->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", ['status' => 'EM_ANALISE'])
            ->assertUnauthorized();

        $token = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->json('token');
        $this->withToken($token)->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", ['status' => 'EM_ANALISE'])
            ->assertForbidden();
    }

    public function test_health_informa_status_do_banco_e_request_id(): void
    {
        $this->withHeader('X-Request-ID', 'test-correlation-id')
            ->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('X-Request-ID', 'test-correlation-id')
            ->assertJsonPath('database.status', 'ok');
    }

    private function loginAs(string $role): string
    {
        $user = User::factory()->create(['role' => $role]);

        return $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('token');
    }
}

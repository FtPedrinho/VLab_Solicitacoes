# V-Lab Backend — Solicitações de Atendimento

Este diretório contém a API Laravel responsável por cadastrar, listar, consultar e atualizar solicitações de atendimento.

## Visão geral

A aplicação segue o padrão de arquitetura pedido no desafio:

- domínio centralizado em `App\Services`
- regras de negócio fora do controller
- validações em `FormRequest`
- model com persistência em PostgreSQL
- API versionada em `/api/v1`
- autenticação Bearer com tokens hash e perfis `admin`, `atendente` e `solicitante`
- Policy para proteger transições de status
- healthcheck detalhado do PostgreSQL e correlation ID em todas as respostas

## Estrutura principal

- `app/Models/Solicitacao.php` — entidade principal
- `app/Services/SolicitacaoService.php` — criação e atualização
- `app/Services/SolicitacaoStatusService.php` — transições de status
- `app/Http/Controllers/SolicitacaoController.php` — endpoints
- `app/Http/Requests/*.php` — validações
- `database/migrations/2026_09_22_000000_create_solicitacoes_table.php` — tabela da entidade
- `routes/api.php` — rotas da API

## Regras implementadas

- `status` inicial sempre `RECEBIDA`
- protocolo de formato `SOL-YYYY-000001`
- `justificativa_prioridade` obrigatória para `URGENTE`
- filtro por `status`, `categoria` e `prioridade`
- paginação de listagem
- atualização sem permitir transições inválidas
- apenas `admin` e `atendente` podem atualizar status
- cada transição registra histórico em `solicitacao_status_historicos` por evento
  `StatusAtualizado`; o listener é queued e falhas são registradas/reprocessáveis

## Como rodar localmente

Na raiz do repositório, usando Docker:

```bash
docker compose up -d --build
docker compose ps
docker exec vlab-backend php artisan db:seed --force
```

A API fica disponível em `http://127.0.0.1:8000/api/v1`. As migrations são
executadas automaticamente na inicialização do serviço backend.

## Testes

```bash
docker compose run --rm backend php artisan test
```

## Endpoints

```http
GET    /api/v1/solicitacoes
POST   /api/v1/solicitacoes
GET    /api/v1/solicitacoes/{id}
PATCH  /api/v1/solicitacoes/{id}/status
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/auth/me                 (Bearer)
POST   /api/v1/auth/logout              (Bearer)
GET    /api/v1/health
```

O login recebe `email` e `password` e retorna um token Bearer. O seeder cria
usuários fictícios para os três perfis, todos com a senha `password`, apenas
para demonstração local:

| Perfil | E-mail | Senha | Permissão |
|---|---|---|---|
| `admin` | `admin@example.com` | `password` | Atualiza status |
| `atendente` | `test@example.com` | `password` | Atualiza status |
| `solicitante` (paciente) | `paciente@example.com` | `password` | Consulta, sem alterar status |

O endpoint de health retorna o
estado da aplicação, PostgreSQL, latência da consulta e HTTP 503 quando o
banco não está disponível. Todas as requisições recebem `X-Request-ID` (ou
reutilizam o valor enviado pelo cliente) e produzem logs JSON estruturados.

## Observações

- A operação de exclusão não foi implementada, conforme escopo do desafio.
- O seeder cria dados fictícios idempotentes para demonstração.
- A API é consumida pelo frontend React + TypeScript.

# V-Lab — Solicitações de Atendimento

Aplicação full stack para registro, consulta e atualização de solicitações de atendimento em unidades públicas de saúde.

## Stack

- Frontend: React + TypeScript
- Backend: PHP + Laravel
- Banco: PostgreSQL
- Infra: Docker + Docker Compose
- Testes: PHPUnit

## Status

Backend estruturado e pronto para evoluir com o frontend.

## Backend implementado

A API foi organizada para seguir a arquitetura proposta no desafio:

- Model: `App\Models\Solicitacao`
- Enums: categoria, prioridade e status
- Service de domínio: `App\Services\SolicitacaoService`
- Service de regras: `App\Services\SolicitacaoStatusService`
- Requests: validação de entrada e atualização de status
- Controller: `App\Http\Controllers\SolicitacaoController`
- Migration: criação da tabela `solicitacoes`
- Rotas: `routes/api.php` com versão `/api/v1`

Principais regras atendidas:

- status inicial fixado em `RECEBIDA`
- protocolo gerado automaticamente no formato `SOL-YYYY-000001`
- prioridade urgente exige justificativa
- transições de status centralizadas em serviço próprio
- filtros por status, categoria e prioridade na listagem
- paginação com `per_page` padrão de 15 itens
- atualização de status via `PATCH /api/v1/solicitacoes/{id}/status`

## Endpoints principais

- `GET /api/v1/solicitacoes`
- `POST /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/{id}`
- `PATCH /api/v1/solicitacoes/{id}/status`

## Regras de transição implementadas

- `RECEBIDA -> EM_ANALISE` ou `CANCELADA`
- `EM_ANALISE -> AGENDADA` ou `CANCELADA`
- `AGENDADA -> CONCLUIDA` ou `CANCELADA`
- `CONCLUIDA` e `CANCELADA` não permitem novas transições

## Como executar

1. Na raiz do projeto, suba o banco PostgreSQL:

```bash
docker compose up -d db
```

2. Acesse o backend e rode as migrations/tests:

```bash
docker compose run --rm backend php artisan migrate --force
docker compose run --rm backend php artisan test
```

3. Para iniciar a API:

```bash
docker compose up backend
```

A API fica disponível em `http://localhost:8000`.

## Observações de escopo

- Não foi implementado DELETE, conforme decisão do desafio.
- O backend foi estruturado para suportar o frontend em seguida, mantendo regras de negócio no servidor.

# V-Lab Backend — Solicitações de Atendimento

Este diretório contém a API Laravel responsável por cadastrar, listar, consultar e atualizar solicitações de atendimento.

## Visão geral

A aplicação segue o padrão de arquitetura pedido no desafio:

- domínio centralizado em `App\Services`
- regras de negócio fora do controller
- validações em `FormRequest`
- model com persistência em PostgreSQL
- API versionada em `/api/v1`

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

## Como rodar localmente

Usando Docker:

```bash
docker compose up -d db
docker compose run --rm backend php artisan migrate --force
docker compose up backend
```

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
```

## Observações

- A operação de exclusão não foi implementada, conforme escopo do desafio.
- A API foi preparada para integrar com o frontend em React + TypeScript.

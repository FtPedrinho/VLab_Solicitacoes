# V-Lab — Solicitações de Atendimento

Aplicação full stack para registro, consulta e atualização de solicitações de atendimento em unidades públicas de saúde.

## Stack

- Frontend: React + TypeScript
- Backend: PHP + Laravel
- Banco: PostgreSQL
- Infra: Docker + Docker Compose
- Testes: PHPUnit e Vitest

## Status

Frontend React + TypeScript integrado à API, com painel, filtros, paginação,
cadastro, detalhe e atualização de status.

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
- resumo agregado por status, categoria e prioridade para o dashboard
- paginação com `per_page` padrão de 15 itens
- atualização de status via `PATCH /api/v1/solicitacoes/{id}/status`

## Documentação por camada

- [Documentação do backend](docs/backend.md)
- [Documentação do frontend](docs/frontend.md)
- [Documentação da integração](docs/integration.md)
- [Especificação OpenAPI](docs/openapi.yaml)

## Endpoints principais

- `GET /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/resumo`
- `POST /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/{id}`
- `PATCH /api/v1/solicitacoes/{id}/status`
- `GET /api/v1/openapi.yaml`

## Regras de transição implementadas

- `RECEBIDA -> EM_ANALISE` ou `CANCELADA`
- `EM_ANALISE -> AGENDADA` ou `CANCELADA`
- `AGENDADA -> CONCLUIDA` ou `CANCELADA`
- `CONCLUIDA` e `CANCELADA` não permitem novas transições

## Como executar em desenvolvimento

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

4. Para iniciar toda a aplicação (banco, API e frontend):

```bash
docker compose up --build
```

O painel fica disponível em `http://localhost:5173`. Para executar apenas o
frontend localmente, copie `frontend/.env.example` para `frontend/.env`, rode
`npm install` em `frontend/` e então `npm run dev`.

O backend executa o código incorporado na imagem Docker, sem bind mount do
projeto Laravel. Isso evita a latência do filesystem compartilhado do Windows.
Após alterações em `backend/`, reconstrua o serviço com:

```bash
docker compose up -d --build backend
```

O serviço usa OPcache e quatro workers PHP para responder de forma imediata.
Os dados continuam persistidos no volume PostgreSQL `postgres_data`; os testes
Laravel usam SQLite em memória e não substituem os dados de desenvolvimento.

O Compose possui healthchecks para PostgreSQL, Laravel e Vite. Para acompanhar
o estado dos serviços:

```bash
docker compose ps
docker compose logs -f backend
```

O endpoint de saúde do Laravel fica disponível em `http://localhost:8000/up`.
A documentação visual da API fica disponível em
`http://localhost:5173/swagger.html` usando Swagger UI.

### Testes e build

```bash
docker compose run --rm backend php artisan test
docker compose run --rm backend composer run lint
docker compose run --rm frontend npm test -- --run
docker compose run --rm frontend npm run build
```

### Execução de produção

Para validar o bundle do frontend, execute `npm run build` no serviço
`frontend`. O ambiente de produção deve usar `APP_DEBUG=false`, credenciais
fornecidas por variáveis de ambiente e um servidor HTTP apropriado para servir
o bundle gerado em `frontend/dist`.

### Frontend

O endereço da API é configurado por `VITE_API_URL` (padrão:
`http://localhost:8000/api/v1`). A interface apresenta estados de carregamento,
erro e lista vazia, resumo dos atendimentos, filtros por status/categoria/
prioridade, formulário validado, consulta detalhada e transições de status.

## Observações de escopo

- Não foi implementado DELETE, conforme decisão do desafio.
- O backend foi estruturado para suportar o frontend em seguida, mantendo regras de negócio no servidor.

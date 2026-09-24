# Integração — V-Lab Solicitações

## Visão geral

A aplicação utiliza três serviços integrados pelo Docker Compose:

```text
React/Vite
    ↓ HTTP/JSON
Laravel API
    ↓ Eloquent/PDO
PostgreSQL
```

O frontend não acessa o banco diretamente. O Laravel é a única camada
responsável por regras de negócio e persistência.

## Serviços e portas

| Serviço | Porta | Responsabilidade |
|---|---:|---|
| `db` | `5432` | PostgreSQL e persistência |
| `backend` | `8000` | API Laravel e migrations |
| `frontend` | `5173` | Aplicação React/Vite e Swagger UI |

Configuração principal:

- [docker-compose.yml](../docker-compose.yml)

## Inicialização

Execute na raiz:

```bash
docker compose up -d --build
```

O Compose inicia os serviços nesta ordem:

1. PostgreSQL fica saudável através do `pg_isready`.
2. Laravel executa `key:generate` e `migrate --force`.
3. Laravel inicia o servidor PHP com quatro workers.
4. Vite inicia o frontend.

Verifique o estado:

```bash
docker compose ps
```

Os serviços `db` e `backend` devem aparecer como `healthy`.

## Configuração por ambiente

### Backend

O Compose fornece:

```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=vlab_solicitacoes
DB_USERNAME=postgres
DB_PASSWORD=postgres
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
OPENAPI_PATH=/var/www/docs/openapi.yaml
```

### Frontend

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Os arquivos `.env.example` documentam os valores esperados sem conter
credenciais reais.

## Fluxo de uma solicitação

### Cadastro

```text
Formulário React
    ↓ POST /api/v1/solicitacoes
StoreSolicitacaoRequest
    ↓
SolicitacaoService
    ↓
Transação PostgreSQL
    ↓
Resposta JSON 201
```

O backend gera o protocolo, define `RECEBIDA`, controla as datas e valida a
justificativa de prioridade urgente.

### Consulta

```text
React
    ↓ GET /api/v1/solicitacoes
Controller
    ↓ filtros e paginação
Eloquent/PostgreSQL
    ↓
JSON paginado
```

Os filtros disponíveis são `status`, `categoria`, `prioridade`, `page` e
`per_page`.

### Atualização

```text
React
    ↓ PATCH /api/v1/solicitacoes/{id}/status
UpdateSolicitacaoStatusRequest
    ↓
SolicitacaoStatusService
    ↓
PostgreSQL
    ↓
Resposta JSON 200
```

As transições são validadas no frontend para melhorar a experiência e no
backend como autoridade definitiva.

## Persistência

O banco utiliza o volume Docker `postgres_data`. Portanto, reiniciar os
containers não apaga os dados.

As migrations são executadas pelo Laravel:

```bash
docker compose run --rm backend php artisan migrate --force
```

Para remover também o volume e começar com banco vazio:

```bash
docker compose down -v
```

Esse comando é destrutivo para os dados locais e deve ser usado somente quando
isso for desejado.

## Endpoints de verificação

```text
http://localhost:8000/up
http://localhost:8000/api/v1/solicitacoes/resumo
http://localhost:8000/api/v1/openapi.yaml
http://localhost:5173
http://localhost:5173/swagger.html
```

## Testes de integração

```bash
docker compose run --rm backend php artisan test
docker compose run --rm backend composer run lint
docker compose run --rm frontend npm test -- --run
docker compose run --rm frontend npm run build
```

Os testes de backend usam SQLite em memória para serem independentes e
determinísticos. A execução normal da aplicação utiliza PostgreSQL no serviço
`db`.

## Diagnóstico rápido

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

Após alterações no backend, reconstrua a imagem:

```bash
docker compose up -d --build backend
```


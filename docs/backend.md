# Backend — V-Lab Solicitações

## Objetivo

Disponibilizar uma API REST para cadastro, consulta, filtragem, paginação e
atualização de status das solicitações de atendimento.

## Stack

- PHP 8.4
- Laravel 13
- PostgreSQL 16
- Docker e Docker Compose
- PHPUnit

## Arquitetura

O backend utiliza uma separação simples de responsabilidades:

- **Model:** `Solicitacao`, responsável pelo mapeamento da entidade e persistência.
- **Enums:** definem categorias, prioridades e status válidos.
- **Form Requests:** validam os dados recebidos pela API.
- **Services:** concentram criação, atualização e regras de transição de status.
- **Controller:** recebe as requisições e delega o processamento aos services.
- **Migration:** cria a tabela `solicitacoes` e garante a unicidade do protocolo.
- **OpenAPI:** descreve os endpoints, filtros, payloads, respostas e erros em
  [docs/openapi.yaml](./openapi.yaml).
- **Swagger UI:** disponibilizada em `http://localhost:5173/swagger.html` para
  consulta e teste visual dos endpoints documentados.

## Modelo de dados

Cada solicitação possui:

- `id`: identificador único;
- `protocolo`: código automático e único, no formato `SOL-YYYY-000001`;
- `nome_solicitante`: nome fictício da pessoa solicitante;
- `categoria`: `CONSULTA`, `EXAME`, `VACINACAO` ou `OUTRO`;
- `prioridade`: `BAIXA`, `MEDIA`, `ALTA` ou `URGENTE`;
- `status`: `RECEBIDA`, `EM_ANALISE`, `AGENDADA`, `CONCLUIDA` ou `CANCELADA`;
- `descricao`: resumo da solicitação;
- `justificativa_prioridade`: obrigatória para prioridade `URGENTE`;
- `data_criacao` e `data_atualizacao`.

O protocolo possui restrição `UNIQUE` no PostgreSQL, além de ser gerado
automaticamente pelo backend.

Os campos usados nos filtros (`status`, `categoria` e `prioridade`) possuem
índices no PostgreSQL para apoiar as consultas paginadas.

## Regras de negócio

- Toda solicitação inicia com status `RECEBIDA`.
- O protocolo é gerado automaticamente no formato `SOL-YYYY-000001`.
- A prioridade `URGENTE` exige justificativa.
- `data_criacao` e `data_atualizacao` são controladas pelo backend.
- Transições permitidas:
  - `RECEBIDA` → `EM_ANALISE` ou `CANCELADA`
  - `EM_ANALISE` → `AGENDADA` ou `CANCELADA`
  - `AGENDADA` → `CONCLUIDA` ou `CANCELADA`
- Solicitações `CONCLUIDA` ou `CANCELADA` não podem avançar.
- O cliente não pode definir o status inicial nem as datas de controle.
- A data de atualização é alterada sempre que o status é modificado.

## API

Base: `/api/v1`

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/solicitacoes` | Lista solicitações com paginação e filtros |
| GET | `/solicitacoes/resumo` | Retorna totais por status, categoria e prioridade |
| POST | `/solicitacoes` | Cria uma solicitação |
| GET | `/solicitacoes/{id}` | Consulta os detalhes |
| PATCH | `/solicitacoes/{id}/status` | Atualiza somente o status |

Filtros disponíveis na listagem:

- `status`
- `categoria`
- `prioridade`
- `page`
- `per_page`

## Validação e erros

Os dados são validados no backend por `Form Requests`, incluindo campos
obrigatórios, limites de tamanho e valores permitidos para categoria,
prioridade e status. Valores inválidos, campos obrigatórios ausentes e
transições não permitidas retornam respostas JSON com HTTP `422`.
Registros inexistentes retornam HTTP `404`. Criações válidas retornam `201`
e atualizações válidas retornam `200`.

As regras são aplicadas no backend independentemente de qualquer validação do
frontend.

Erros de registro inexistente retornam uma mensagem JSON própria com `404`.
Falhas inesperadas da API retornam uma mensagem genérica com `500`, sem expor
detalhes internos da aplicação.

## Persistência e execução

O PostgreSQL é executado em container separado. O backend Laravel utiliza
migrations para criar a estrutura do banco e se conecta ao serviço `db` por
meio do Docker Compose.

O cadastro usa transação de banco e as solicitações de exame são persistidas
com a mesma estrutura das demais categorias. A imagem do backend usa OPcache,
quatro workers do servidor PHP e não monta o código Laravel pelo filesystem do
Windows durante a execução, reduzindo a latência das respostas. Os testes usam
SQLite em memória, sem apagar os dados do PostgreSQL de desenvolvimento.

Comandos principais:

```bash
docker compose up -d db
docker compose run --rm backend php artisan migrate --force
docker compose run --rm backend php artisan test
docker compose run --rm backend composer run lint
docker compose up backend
```

## Testes

Os testes de feature cobrem:

- criação com status inicial correto;
- geração do protocolo;
- exigência de justificativa urgente;
- transição válida;
- rejeição de transição inválida.

Resultado validado: **9 testes aprovados e 25 assertions**.

O lint PHP/Laravel pode ser executado pelo script `composer run lint`, usando
o Laravel Pint em modo de verificação.

## Decisão de escopo

Não foi implementado `DELETE` nem atualização genérica dos demais campos,
pois o desafio define a atualização de status como a operação principal.
Assim, a atualização de `data_atualizacao` atualmente ocorre no endpoint
específico de status.

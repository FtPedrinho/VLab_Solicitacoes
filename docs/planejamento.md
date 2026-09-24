# Planejamento

## Objetivo

Desenvolver uma aplicação full stack para registro e acompanhamento de solicitações de atendimento em unidades públicas.

A aplicação deverá permitir o cadastro, consulta e acompanhamento das solicitações, respeitando regras de negócio relacionadas a prioridade e transição de status.

## Funcionalidades principais

* Cadastro de solicitação
* Listagem paginada
* Filtros por status, categoria e prioridade
* Consulta detalhada
* Atualização de status
* Validação das regras de negócio
* Persistência em PostgreSQL
* Dashboard com indicadores
* Testes automatizados

## Entidades

### Solicitação

Uma solicitação possui:

* ID
* Protocolo
* Nome fictício do solicitante
* Categoria
* Prioridade
* Status
* Descrição
* Justificativa da prioridade
* Data de criação
* Data de atualização

## Categorias

* CONSULTA
* EXAME
* VACINACAO
* OUTRO

## Prioridades

* BAIXA
* MEDIA
* ALTA
* URGENTE

Solicitações com prioridade `URGENTE` devem possuir justificativa.

## Status

* RECEBIDA
* EM_ANALISE
* AGENDADA
* CONCLUIDA
* CANCELADA

## Transições permitidas

```text
RECEBIDA
├── EM_ANALISE
└── CANCELADA

EM_ANALISE
├── AGENDADA
└── CANCELADA

AGENDADA
├── CONCLUIDA
└── CANCELADA

CONCLUIDA → final
CANCELADA  → final
```

## Arquitetura inicial

```text
React + TypeScript
        │
        │ HTTP / JSON
        ▼
Laravel REST API
        │
        ▼
PostgreSQL
```

## Estratégia de desenvolvimento

O projeto será desenvolvido incrementalmente:

1. Configuração do ambiente
2. Estrutura do backend
3. Banco de dados
4. Modelagem
5. API
6. Regras de negócio
7. Testes backend
8. Frontend
9. Integração
10. Testes frontend
11. Dockerização
12. Documentação final

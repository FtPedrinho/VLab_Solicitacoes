# Frontend — V-Lab Solicitações

## Objetivo

O frontend fornece a interface React para cadastro, consulta, filtragem,
paginação e atualização das solicitações de atendimento. Todas as operações
de negócio são realizadas pela API Laravel; o frontend não utiliza dados
estáticos como fonte principal.

## Stack

- React 18
- TypeScript
- Vite
- Lucide React
- Vitest

## Organização

```text
frontend/src/
├── App.tsx          # estado da tela, navegação, filtros e paginação
├── components.tsx   # formulário, detalhe, resumo, shell e componentes visuais
├── api.ts           # cliente HTTP centralizado
├── types.ts         # contratos, enums e validação do formulário
├── styles.css       # layout responsivo e estados visuais
├── api.test.ts      # testes do cliente HTTP
└── types.test.ts    # testes dos contratos e validações
```

## Funcionalidades

- painel com totais, solicitações abertas, urgentes e concluídas;
- listagem paginada;
- filtros por status, categoria e prioridade;
- busca local por protocolo, solicitante ou descrição;
- formulário de criação com validação;
- justificativa obrigatória para prioridade `URGENTE`;
- consulta detalhada;
- atualização de status com apenas as transições permitidas;
- estados de carregamento, erro, vazio e atualização;
- layout responsivo para telas menores;
- documentação visual da API em `/swagger.html`.

## Contrato com a API

O endereço da API é definido por `VITE_API_URL`.

Exemplo:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

O cliente HTTP em [src/api.ts](../frontend/src/api.ts) centraliza:

- headers JSON;
- serialização de filtros;
- chamadas de listagem, resumo, criação e atualização;
- conversão de erros HTTP em mensagens para a interface.

Os tipos compartilhados em [src/types.ts](../frontend/src/types.ts) mantêm
os valores de categoria, prioridade e status sincronizados com o backend.

## Fluxos principais

### Carregamento da listagem

1. `App` solicita a página atual à API.
2. A API retorna os dados paginados.
3. A tabela é atualizada sem perder os dados já exibidos durante uma atualização.
4. O resumo é carregado separadamente.

### Criação

1. A pessoa usuária preenche o formulário.
2. O frontend valida campos básicos.
3. `POST /api/v1/solicitacoes` é enviado.
4. O backend aplica as regras definitivas.
5. A nova solicitação é exibida imediatamente no detalhe.
6. O resumo é atualizado.

### Atualização de status

1. O detalhe mostra somente os próximos status permitidos.
2. O frontend envia `PATCH /api/v1/solicitacoes/{id}/status`.
3. O backend valida novamente a transição.
4. O detalhe e a listagem local são atualizados.
5. A data de atualização retornada pela API é exibida.

## Execução

Na raiz do projeto:

```bash
docker compose up -d --build
```

Acesse:

```text
http://127.0.0.1:5173
```

Para executar o frontend isoladamente:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Testes e build

```bash
docker compose run --rm frontend npm test -- --run
docker compose run --rm frontend npm run build
```

Os testes cobrem a validação de prioridade urgente e o comportamento do
cliente HTTP diante de filtros e erros da API.

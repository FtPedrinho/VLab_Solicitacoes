# V-Lab — Solicitações de Atendimento

## Resumo da plataforma

O V-Lab é uma plataforma fictícia de gestão de solicitações de atendimento
para o setor público de saúde. Ela apoia equipes administrativas no registro,
acompanhamento, priorização e atualização do andamento de solicitações
encaminhadas às unidades públicas.

O projeto utiliza exclusivamente dados fictícios. Não são utilizados dados
clínicos, documentos pessoais ou informações reais de pacientes.

## O que a plataforma faz

- cadastra solicitações de atendimento;
- gera protocolo único automaticamente;
- lista solicitações com paginação;
- filtra por status, categoria e prioridade;
- exibe resumo operacional;
- consulta detalhes;
- atualiza status respeitando o fluxo de negócio;
- documenta a API com OpenAPI e Swagger UI.

## Stack

- Frontend: React + TypeScript
- Backend: PHP + Laravel
- Banco: PostgreSQL
- Infra: Docker + Docker Compose
- Testes: PHPUnit e Vitest

## Status do projeto

Aplicação full stack funcional, integrada ao PostgreSQL e executável por
Docker Compose. O frontend React consome exclusivamente a API Laravel.

## Uso de inteligência artificial

A inteligência artificial foi utilizada como auxílio técnico durante o
desenvolvimento deste projeto. Ela apoiou a criação de código, a elaboração de
estruturas iniciais, a revisão de implementações, a identificação de erros e o
suporte na construção da integração entre frontend, API Laravel, PostgreSQL e
Docker.

As decisões de arquitetura, regras de negócio, seleção de escopo, revisão das
alterações e validação por testes permaneceram sob responsabilidade do
desenvolvimento do projeto. O código gerado ou sugerido foi analisado, adaptado
e testado antes de ser incorporado, com foco em manter a coerência com os
requisitos do desafio, a segurança e a documentação da solução.

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
- [Arquitetura, decisões e operação](docs/arquitetura.md)
- [Especificação OpenAPI](docs/openapi.yaml)

## Endpoints principais

- `GET /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/resumo`
- `POST /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/{id}`
- `PATCH /api/v1/solicitacoes/{id}/status`
- `GET /api/v1/openapi.yaml`
- `POST /api/v1/auth/login`, `GET/POST /api/v1/auth/me|logout`
- `POST /api/v1/auth/register` (criação de conta fictícia)
- `GET /api/v1/health` (PostgreSQL, latência e status da aplicação)

O login retorna um token Bearer. Perfis `admin` e `atendente` podem atualizar
status por Policy; o perfil `solicitante` representa a pessoa paciente e pode
autenticar, consultar e acompanhar os dados, mas não altera o fluxo de status.

### Acessos fictícios para demonstração

Todos os usuários abaixo utilizam a senha:

```text
password
```

| Perfil na interface | Perfil técnico | E-mail | Senha |
|---|---|---|---|
| Administrador | `admin` | `admin@example.com` | `password` |
| Atendente | `atendente` | `test@example.com` | `password` |
| Paciente | `solicitante` | `paciente@example.com` | `password` |

Para fazer login:

1. execute o ambiente com Docker Compose;
2. abra `http://127.0.0.1:5173`;
3. informe um dos e-mails acima e a senha `password`;
4. use `admin` ou `atendente` para testar atualização de status;
5. use `paciente` para validar o acesso sem permissão de alteração.

Também é possível selecionar **Criar nova conta** na tela de login. Informe
nome, e-mail, senha e escolha entre paciente/usuário, atendente ou
administrador. Esse fluxo existe para a demonstração do desafio; em produção,
a criação de perfis administrativos deve ser restrita a usuários autorizados.

#### Credencial sugerida para avaliação

Como alternativa aos usuários seed, pode ser criada uma conta própria pela
tela de login utilizando:

```text
E-mail: pega@example.com
Senha: password
Perfil: escolha no cadastro conforme o fluxo que deseja demonstrar
```

Essa conta deve ser criada uma única vez pelo botão **Criar nova conta**. Após
o cadastro, ela fica persistida no PostgreSQL e poderá ser utilizada normalmente
no login. Para demonstrar a atualização de status, selecione `atendente` ou
`admin`; para demonstrar acesso sem autorização de alteração, selecione
`solicitante`.

Os usuários são criados pelo seeder idempotente e possuem dados totalmente
fictícios. A API adiciona `X-Request-ID` às respostas e grava logs JSON
estruturados. O frontend mantém o token no `localStorage`, envia
automaticamente o header Bearer e oferece logout.
As transições de status também geram histórico em PostgreSQL via evento
`StatusAtualizado` e listener em fila (a configuração Compose/testes usa a
conexão `sync`, sem exigir um serviço adicional).

## Regras de transição implementadas

- `RECEBIDA -> EM_ANALISE` ou `CANCELADA`
- `EM_ANALISE -> AGENDADA` ou `CANCELADA`
- `AGENDADA -> CONCLUIDA` ou `CANCELADA`
- `CONCLUIDA` e `CANCELADA` não permitem novas transições

## Como executar

### Execução completa com Docker

Na raiz do projeto:

```bash
docker compose up -d --build
```

O Compose inicia PostgreSQL, Laravel e React na ordem correta, aguardando os
healthchecks das dependências. Verifique:

```bash
docker compose ps
```

URLs atuais:

- Aplicação: http://127.0.0.1:5173
- Swagger UI: http://127.0.0.1:5173/swagger.html
- Healthcheck Laravel: http://127.0.0.1:8000/up
- API: http://127.0.0.1:8000/api/v1
- OpenAPI YAML: http://127.0.0.1:8000/api/v1/openapi.yaml

O frontend usa `http://127.0.0.1:8000/api/v1` como endereço padrão da API.
O uso de `127.0.0.1` evita divergência entre a origem aberta no navegador e
o endereço configurado no bundle do frontend.

### Guia para outra pessoa executar e avaliar

#### Responsabilidade de quem entrega

Quem entrega o projeto deve:

- disponibilizar o repositório completo;
- manter o Docker Desktop instalado e funcionando no computador de avaliação;
- fornecer este README e as credenciais fictícias de demonstração;
- garantir que as migrations e o seeder sejam executáveis;
- informar qualquer alteração local necessária em portas ou variáveis de ambiente.

Não é necessário instalar PHP, Composer, PostgreSQL ou Node.js diretamente no
Windows para executar a versão integrada. Esses componentes são fornecidos pelos
containers.

#### Responsabilidade de quem avalia ou recebe o projeto

A pessoa que recebe o projeto deve ter:

- Git;
- Docker Desktop com suporte ao Docker Compose;
- virtualização habilitada no Windows, quando exigida pelo Docker Desktop;
- acesso às portas `5173`, `8000` e `5432`, se quiser acessar o banco localmente.

No PowerShell, execute:

```powershell
git clone <URL_DO_REPOSITORIO>
Set-Location VLab_Solicitacoes
docker compose up -d --build
docker compose ps
```

Os três serviços devem aparecer como `healthy`:

```text
vlab-postgres
vlab-backend
vlab-frontend
```

O backend executa as migrations automaticamente na inicialização. Para carregar
os dados fictícios e os usuários de demonstração:

```powershell
docker exec vlab-backend php artisan db:seed --force
```

Depois, abra:

```text
http://127.0.0.1:5173
```

Na tela de login, é possível usar os usuários seed:

```text
Administrador: admin@example.com / password
Atendente:     test@example.com / password
Paciente:      paciente@example.com / password
```

Também é possível clicar em **Criar nova conta**, informar nome, e-mail, senha
e selecionar o perfil. Para uma demonstração própria, pode ser utilizada a
conta:

```text
pega@example.com / password
```

Essa conta precisa ser criada uma vez pela tela de cadastro. A criação é
persistida no PostgreSQL e o login ocorre automaticamente após o cadastro.

#### Validação rápida

```powershell
curl.exe http://127.0.0.1:8000/up
curl.exe http://127.0.0.1:8000/api/v1/health
curl.exe http://127.0.0.1:8000/api/v1/solicitacoes
```

Interfaces disponíveis:

- Aplicação: `http://127.0.0.1:5173`
- Swagger UI: `http://127.0.0.1:5173/swagger.html`
- Health detalhado: `http://127.0.0.1:8000/api/v1/health`
- OpenAPI: `http://127.0.0.1:8000/api/v1/openapi.yaml`

Para interromper os serviços sem apagar os dados:

```powershell
docker compose down
```

Para remover também o volume PostgreSQL e começar do zero:

```powershell
docker compose down -v
docker compose up -d --build
docker exec vlab-backend php artisan db:seed --force
```

O comando `down -v` deve ser utilizado somente quando for desejado apagar a
persistência local.

### Dados fictícios para demonstração

Para inserir solicitações de exemplo no PostgreSQL:

```bash
docker exec vlab-backend php artisan db:seed --force
```

O seeder é idempotente e cria exemplos de consulta, exame, vacinação e
diferentes prioridades/status sem duplicar os protocolos de demonstração.

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

### Testes e build

```bash
docker compose run --rm backend php artisan test
docker compose run --rm backend composer run lint
docker compose run --rm frontend npm test -- --run
docker compose run --rm frontend npm run build
```

O pipeline em `.github/workflows/ci.yml` reproduz essas verificações em
pull requests e pushes: migrations SQLite, Pint e PHPUnit no backend; e
TypeScript, Vitest e build no frontend. A checagem `npm run lint` é uma
validação estática TypeScript (não altera a lógica da aplicação).

### Desenvolvimento isolado do frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Nesse modo, o backend e o PostgreSQL ainda precisam estar disponíveis pelo
Docker Compose.

### Execução de produção

Para validar o bundle do frontend, execute `npm run build` no serviço
`frontend`. O ambiente de produção deve usar `APP_DEBUG=false`, credenciais
fornecidas por variáveis de ambiente e um servidor HTTP apropriado para servir
o bundle gerado em `frontend/dist`.

## Persistência e reset dos dados

Os dados ficam no volume Docker `postgres_data` e permanecem após reiniciar os
containers. Para apagar o banco local e recriá-lo vazio:

```bash
docker compose down -v
docker compose up -d --build
```

Use `down -v` somente quando quiser remover os dados persistidos.

## Observações de escopo

- Não foi implementado DELETE, conforme decisão do desafio.
- O backend foi estruturado para suportar o frontend em seguida, mantendo regras de negócio no servidor.

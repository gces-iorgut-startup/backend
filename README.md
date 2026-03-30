# 🐾 IOUGURT — Plataforma de Gestão Veterinária

Sistema web de gestão para clínicas veterinárias. Permite gerenciar pacientes, tutores, agendamentos, prontuários clínicos e o portal do tutor.

---

## ⚡ Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)
- Node.js 20+ (apenas para rodar scripts localmente, opcional)

---

## 🚀 Subindo o projeto pela primeira vez

### 1. Clone e entre na pasta

```bash
git clone <url-do-repo>
cd iougurt
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

> O `.env` já vem preenchido com valores de desenvolvimento. Não precisa alterar nada para rodar localmente.

### 3. Suba os containers

```bash
docker compose up
```

Isso vai:
1. Baixar as imagens do PostgreSQL e Node.js
2. Construir a imagem da API
3. Subir o banco de dados e aguardar ficar saudável
4. Aplicar as migrations automaticamente
5. Iniciar a API com hot-reload

### 4. Verifique que está funcionando

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

---

## 🗂️ Estrutura do Projeto

```
iougurt/
├── prisma/
│   ├── schema.prisma          # Modelos do banco de dados
│   └── migrations/            # Histórico de migrations SQL
│
├── src/
│   ├── config/
│   │   ├── env.ts             # Validação de variáveis de ambiente
│   │   └── prisma.ts          # Singleton do PrismaClient
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   └── app-error.ts   # Classe base de erros de domínio
│   │   └── middleware/
│   │       ├── verify-jwt.ts  # Guard de autenticação JWT
│   │       └── error-handler.ts # Handler global de erros
│   │
│   ├── modules/
│   │   ├── auth/              # US01 — Login/Logout/JWT
│   │   ├── patient/           # US04, US05 — Pacientes
│   │   ├── tutor/             # US05, US14-16 — Tutores
│   │   ├── schedule/          # US06, US07, US08 — Agenda
│   │   ├── clinical/          # US09-13 — Prontuário e Atendimento
│   │   ├── dashboard/         # US02, US03 — Painel e Gráficos
│   │   └── portal/            # US14-16 — Portal do Tutor
│   │
│   ├── app.ts                 # Configuração do Fastify (plugins + rotas)
│   └── server.ts              # Entrypoint (listen na porta)
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
└── arc.md                     # Documento de arquitetura do projeto
```

Cada módulo segue a estrutura de **Clean Architecture**:

```
modules/{nome}/
├── repositories/          # Interfaces (contratos — o que o módulo precisa)
├── useCases/              # Regras de negócio (lógica pura, sem framework)
│   └── factories/         # Composição/injeção de dependências
└── infra/
    ├── repositories/      # Implementações Prisma dos contratos
    └── http/              # Controllers e definição de rotas
```

---

## 🛠️ Comandos úteis

### Containers

```bash
# Subir em background
docker compose up -d

# Ver logs da API
docker compose logs -f api

# Parar tudo
docker compose down
```

### Banco de dados / Prisma

```bash
# Criar e aplicar uma nova migration (após alterar o schema.prisma)
docker compose exec api npx prisma migrate dev --name nome_da_migration

# Abrir o Prisma Studio (UI visual do banco)
docker compose exec api npx prisma studio

# Forçar sync do schema sem criar migration (útil em dev)
docker compose exec -T api npx prisma db push
```

### TypeScript

```bash
# Checar erros de tipo sem compilar
docker compose exec -T api npx tsc --noEmit
```

---

## 🌐 Serviços e Portas

| Serviço | Endereço local |
|---|---|
| API (Fastify) | `http://localhost:3000` |
| PostgreSQL | `localhost:5432` |

---

## 📋 Variáveis de Ambiente

| Variável | Descrição | Padrão (dev) |
|---|---|---|
| `DATABASE_URL` | URL de conexão com o PostgreSQL | `postgresql://iougurt:iougurt@db:5432/iougurt` |
| `PORT` | Porta da API | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `change-me-in-production` |
| `JWT_EXPIRES_IN` | Expiração do access token | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Expiração do refresh token | `7d` |

> ⚠️ **Nunca commite o arquivo `.env`** com valores reais de produção.

---

## 🗄️ Módulos e User Stories

| Módulo | User Stories | Descricão |
|---|---|---|
| `auth` | US01 | Login, logout, refresh de token JWT |
| `patient` | US04, US05 | Listagem, cadastro e edição de pacientes |
| `tutor` | US05, US14–16 | Cadastro de tutores vinculados a pacientes |
| `schedule` | US06, US07, US08 | Agenda diária, agendamentos, cancelamentos |
| `clinical` | US09, US10, US11, US12, US13 | Prontuário, receita, histórico, exames, IA |
| `dashboard` | US02, US03 | Painel inicial e gráficos gerenciais |
| `portal` | US14, US15, US16 | Portal de acesso exclusivo do tutor |

---

## 📐 Padrões de Desenvolvimento

Leia o [`arc.md`](./arc.md) para entender os padrões arquiteturais adotados no projeto.

---

## 👥 Equipe

Projeto desenvolvido como trabalho acadêmico — TPPE.

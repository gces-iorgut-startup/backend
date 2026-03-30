# IOUGURT — Documentação Técnica do Backend

> Guia completo para apresentação à equipe. Cobre arquitetura, tecnologias, banco de dados, endpoints e fluxos de negócio.

---

## 1. Visão Geral do Projeto

O **IOUGURT** é um sistema de gestão para clínicas veterinárias. O backend é uma **API REST** desenvolvida em **Node.js com TypeScript**, seguindo os princípios da **Clean Architecture**. Ele foi construído em 3 MVPs incrementais.

### Stack Tecnológica

| Camada | Tecnologia | Por quê? |
|---|---|---|
| **Runtime** | Node.js 20 (Alpine) | Leve, moderno, suporte nativo a ESM |
| **Linguagem** | TypeScript | Tipagem estática, segurança em tempo de compilação |
| **Framework HTTP** | Fastify | Mais rápido que Express, suporte nativo a JSON Schema |
| **ORM / Banco** | Prisma + PostgreSQL | Schema declarativo, migrations versionadas, type-safe |
| **Autenticação** | JWT + Refresh Token (cookie) | Stateless e seguro |
| **Validação** | Zod + fastify-type-provider-zod | Validação e tipagem unificadas |
| **Documentação** | Swagger/OpenAPI (@fastify/swagger) | Auto-gerado a partir dos schemas Zod |
| **Upload de Arquivos** | @fastify/multipart | Suporte a PDF e imagens (exames) |
| **PDF** | pdfkit | Geração de receituário veterinário |
| **IA** | Google Gemini 1.5 Flash | Resumo simplificado do atendimento |
| **Testes** | Vitest | Rápido, compatível com ESM, zero config |
| **Infraestrutura** | Docker + Docker Compose | Ambiente reproduzível dev/prod |

---

## 2. Como Rodar Localmente

### Pré-requisitos
- Docker e Docker Compose instalados

### Subir o projeto
```bash
# 1ª vez ou após instalar novas dependências (reconstrói a imagem)
docker compose up --build -V

# Demais vezes
docker compose up
```

### Acessar
| Serviço | URL |
|---|---|
| API | `http://localhost:3001` |
| Swagger UI | `http://localhost:3001/docs` |
| Health Check | `http://localhost:3001/health` |
| PostgreSQL | `localhost:5433` |

### Variáveis de Ambiente (`.env`)
```env
DATABASE_URL=postgresql://iougurt:iougurt@db:5432/iougurt
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d
GEMINI_API_KEY=sua-chave-gemini   # necessário para o endpoint de IA
```

---

## 3. Arquitetura — Clean Architecture

O projeto é organizado em **módulos independentes**, cada um com suas próprias camadas. Essa separação garante que as **regras de negócio não dependam de detalhes técnicos** (banco de dados, HTTP, etc).

```
src/
├── server.ts          # Ponto de entrada — inicia o servidor Fastify
├── app.ts             # Registra plugins, middlewares e rotas
├── config/            # Configurações globais (env, prisma client)
├── shared/            # Código reutilizável entre módulos
│   ├── errors/        # AppError — erro domínio padronizado
│   └── middleware/    # verify-jwt, error-handler
└── modules/           # Um por domínio de negócio
    ├── auth/
    ├── tutor/
    ├── patient/
    ├── schedule/
    ├── clinical/
    ├── dashboard/
    └── portal/
```

### Camadas dentro de cada módulo

```
módulo/
├── repositories/
│   ├── IXxxRepository.ts           # Interface (contrato)
│   └── in-memory/                  # Implementação para testes
├── useCases/
│   ├── xyzUseCase.ts               # Regra de negócio pura
│   ├── factories/                  # Cria UseCases com dependências reais
│   └── xyz.spec.ts                 # Testes unitários
└── infra/
    ├── repositories/
    │   └── PrismaXxxRepository.ts  # Implementação real (banco)
    └── http/
        ├── controllers/            # Recebe req → chama useCase → resposta
        └── xxxRoutes.ts            # Define rotas + schema Swagger
```

### Por que essa estrutura?

| Princípio | Resultado prático |
|---|---|
| **Separação de camadas** | UseCase não sabe que usa Fastify. Pode ser testado sem HTTP. |
| **Inversão de dependência** | UseCase recebe um `IRepository`, não um `PrismaRepository`. Troca de banco sem alterar regras. |
| **Repositories in-memory** | Testes rodam sem banco real — rápidos e isolados. |
| **Factories** | Único lugar que conecta "Use Case + Repositório Prisma". Controllers são finos. |

---

## 4. O Banco de Dados (Prisma + PostgreSQL)

### Como o Prisma funciona

O Prisma é um ORM (mapeador objeto-relacional). Você define o **schema** em `prisma/schema.prisma` e ele:

1. **Gera as migrations** (arquivos SQL versionados em `prisma/migrations/`)
2. **Gera o Prisma Client** — um objeto TypeScript com autocompletar para todas as queries
3. Valida as queries **em tempo de compilação**

### Comandos úteis

```bash
# Criar uma migration nova após mudar o schema
npx prisma migrate dev --name nome-da-mudança

# Visualizar os dados do banco num browser
npx prisma studio

# Regenerar o client após mudanças no schema
npx prisma generate
```

### Relacionamentos do banco

```
User ──────── RefreshToken   (1:N)
User ──────── Tutor          (1:1 opcional — conta do portal)
Tutor ─────── Patient        (1:N)
Patient ───── Appointment    (1:N)
Appointment ── ClinicalRecord (1:1)
Patient ───── ClinicalRecord  (1:N)
Patient ───── Vaccination     (1:N)
Patient ───── ExamFile        (1:N)
ClinicalRecord ── ExamFile    (1:N opcional)
```

### Enums importantes

```
Role:                OWNER | VET | TUTOR
AppointmentStatus:   SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
AppointmentCategory: VACCINATION | OBSERVATION | EXAM | SURGICAL
VaccinationStatus:   UP_TO_DATE | PENDING | OVERDUE
```

---

## 5. Autenticação e Segurança

### Fluxo de Login

```
[POST /auth/login]
  → Valida email + senha (bcrypt compare)
  → Gera access token JWT (30min)
  → Gera refresh token (7 dias, salvo no banco)
  → Retorna JWT no body + refreshToken no cookie HttpOnly
```

### Fluxo de Renovação

```
[POST /auth/refresh]
  → Lê o cookie refreshToken
  → Valida no banco (existe e não expirou)
  → Gera novos tokens
```

### Proteção de Rotas

Toda rota protegida usa o middleware `verifyJwt`:

```typescript
// O Fastify valida a assinatura do JWT automaticamente
await request.jwtVerify()

// O userId e role ficam disponíveis em:
request.user.userId
request.user.role
```

### Roles

| Role | Acesso |
|---|---|
| `OWNER` | Tudo — incluindo métricas gerenciais |
| `VET` | Prontuários, pacientes, agenda, vacinas, exames |
| `TUTOR` | Apenas o `/portal` — leitura dos seus próprios pets |

---

## 6. Todos os Endpoints — por MVP

### MVP 1 — Base Operacional

#### Auth (`/auth`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Criar conta (OWNER ou VET) | ❌ |
| `POST` | `/auth/login` | Login com email/senha | ❌ |
| `POST` | `/auth/refresh` | Renovar access token | ❌ |
| `DELETE` | `/auth/logout` | Encerrar sessão | 🔒 |

#### Tutores (`/tutors`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tutors` | Cadastrar tutor | 🔒 |
| `GET` | `/tutors` | Listar com busca e paginação | 🔒 |
| `GET` | `/tutors/:id` | Buscar tutor por ID | 🔒 |
| `PUT` | `/tutors/:id` | Atualizar dados | 🔒 |
| `POST` | `/tutors/:id/account` | Criar login do tutor no portal | 🔒 |

#### Pacientes (`/patients`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/patients` | Cadastrar paciente (requer tutorId) | 🔒 |
| `GET` | `/patients` | Listar com paginação e busca | 🔒 |
| `GET` | `/patients/:id` | Buscar paciente por ID | 🔒 |
| `PUT` | `/patients/:id` | Atualizar dados | 🔒 |

#### Agendamentos (`/appointments`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/appointments` | Criar agendamento | 🔒 |
| `GET` | `/appointments` | Listar agendamentos do dia | 🔒 |
| `DELETE` | `/appointments/:id` | Cancelar (requer justificativa) | 🔒 |
| `PATCH` | `/appointments/:id/reschedule` | Reagendar (requer data futura) | 🔒 |

---

### MVP 2 — Módulo Clínico

#### Prontuários (`/clinical-records`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/clinical-records` | Iniciar atendimento (→ IN_PROGRESS) | 🔒 |
| `PUT` | `/clinical-records/:id` | Atualizar dados clínicos | 🔒 |
| `PATCH` | `/clinical-records/:id/finalize` | Finalizar (→ COMPLETED) | 🔒 |
| `GET` | `/clinical-records/patient/:id` | Histórico clínico do paciente | 🔒 |
| `GET` | `/clinical-records/:id/prescription` | Gerar receituário em PDF | 🔒 |
| `POST` | `/clinical-records/:id/ai-summary` | Gerar resumo por IA (Gemini) | 🔒 |

#### Vacinações (`/vaccinations`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/vaccinations` | Registrar vacina | 🔒 |
| `GET` | `/vaccinations/patient/:id` | Listar vacinas do paciente | 🔒 |
| `PATCH` | `/vaccinations/:id/status` | Atualizar status | 🔒 |

#### Exames (`/exams`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/exams/upload` | Upload de arquivo via multipart | 🔒 |
| `GET` | `/exams/patient/:id` | Listar exames do paciente | 🔒 |

#### Dashboard (`/dashboard`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/dashboard` | Visão do dia (VET ou OWNER) | 🔒 |
| `GET` | `/dashboard/metrics` | Métricas gerenciais (só OWNER) | 🔒 |

---

### MVP 3 — Portal do Tutor e Complementares

#### Portal do Tutor (`/portal`) — só `role: TUTOR`
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/portal/dashboard` | Dashboard: pets, agendamentos, vacinas | 🔒 |
| `GET` | `/portal/alerts` | Alertas iougurt Care | 🔒 |
| `GET` | `/portal/patients/:id/history` | Histórico do pet em leitura | 🔒 |

---

## 7. Fluxo Completo de um Atendimento

```
1. [POST /appointments]
   Atendente agenda a consulta → status: SCHEDULED

2. [POST /clinical-records]  { appointmentId }
   Vet inicia o atendimento → status: IN_PROGRESS
   Prontuário criado e vinculado ao agendamento

3. [PUT /clinical-records/:id]
   Vet preenche: peso, notas clínicas, diagnóstico, prescrições, orientações

4. [POST /vaccinations]  (se necessário)
   Vet registra vacinas aplicadas na consulta

5. [POST /exams/upload]  (se necessário)
   Vet ou atendente anexa resultados de exames

6. [PATCH /clinical-records/:id/finalize]
   Vet finaliza o atendimento → status: COMPLETED
   Prontuário travado para edição

7. [GET /clinical-records/:id/prescription]
   Sistema gera PDF do receituário → download automático

8. [POST /clinical-records/:id/ai-summary]
   IA (Gemini) gera resumo simplificado para a recepção
```

---

## 8. Como Funciona o Código — Passo a Passo

### Exemplo: Criar um Agendamento

**1. A requisição chega no Fastify:**
```
POST /appointments
Body: { patientId, vetId, dateTime, category }
```

**2. `appointmentRoutes.ts` passa para o controller:**
```typescript
app.post('/', { schema: { body: createAppointmentBodySchema, ... } }, createAppointmentController)
```

**3. `createAppointmentController.ts` extrai os dados e chama a factory:**
```typescript
const useCase = makeCreateAppointmentUseCase()  // monta com repositórios Prisma
const result  = await useCase.execute({ patientId, vetId, dateTime, category })
reply.status(201).send(result)
```

**4. `makeCreateAppointmentUseCase.ts` (factory) conecta as dependências:**
```typescript
const appointmentsRepo = new PrismaAppointmentsRepository()
const patientsRepo     = new PrismaPatientsRepository()
const usersRepo        = new PrismaUsersRepository()
return new CreateAppointmentUseCase(appointmentsRepo, patientsRepo, usersRepo)
```

**5. `createAppointmentUseCase.ts` executa a regra de negócio:**
```typescript
// Valida se paciente existe
// Valida se veterinário existe e tem role VET
// Cria o agendamento com status SCHEDULED
const appointment = await this.appointmentsRepository.create({ ... })
return appointment
```

**6. Se algo falhar:**
```typescript
throw new AppError('Paciente não encontrado.', 404)
// O error handler global captura e retorna:
// { "message": "Paciente não encontrado.", "statusCode": 404 }
```

---

## 9. Testes

O projeto usa **Vitest** com **repositórios em memória** — sem banco real, sem Docker.

### Rodar os testes
```bash
npx vitest run          # todos os testes
npx vitest              # modo watch (atualiza ao salvar)
```

### Resultado atual
```
Test Files  10 passed (10)
     Tests  58 passed (58)
  Duration  < 1 segundo
```

### Como um teste é escrito

```typescript
describe('CancelAppointmentUseCase', () => {
  it('deve cancelar com justificativa válida', async () => {
    const repo = new InMemoryAppointmentsRepository()  // banco falso na memória
    const appointment = await repo.create({ ... })

    const sut = new CancelAppointmentUseCase(repo)
    const result = await sut.execute({
      appointmentId: appointment.id,
      reason: 'Paciente não compareceu',
    })

    expect(result.status).toBe('CANCELLED')
    expect(result.cancelReason).toBe('Paciente não compareceu')
  })
})
```

---

## 10. Histórias de Usuário × Implementação

| US | Feature | Rota(s) | Status |
|---|---|---|---|
| US01 | Login/Logout | `POST /auth/login`, `DELETE /auth/logout` | ✅ |
| US02 | Painel Inicial | `GET /dashboard` | ✅ |
| US03 | Dashboard Gerencial | `GET /dashboard/metrics` | ✅ |
| US04 | Listagem de Pacientes | `GET /patients` | ✅ |
| US05 | Cadastro Paciente e Tutor | `POST /patients`, `POST /tutors` | ✅ |
| US06 | Agenda Diária | `GET /appointments` | ✅ |
| US07 | Criar Agendamento | `POST /appointments` | ✅ |
| US08 | Cancelar/Reagendar | `DELETE /appointments/:id`, `PATCH .../reschedule` | ✅ |
| US09 | Registro de Atendimento | `POST /clinical-records` + `PUT` + `PATCH /finalize` | ✅ |
| US10 | Receituário PDF | `GET /clinical-records/:id/prescription` | ✅ |
| US11 | Histórico Clínico | `GET /clinical-records/patient/:id` | ✅ |
| US12 | Exames Anexados | `POST /exams/upload`, `GET /exams/patient/:id` | ✅ |
| US13 | Resumo por IA | `POST /clinical-records/:id/ai-summary` | ✅ |
| US14 | Dashboard do Tutor | `GET /portal/dashboard` | ✅ |
| US15 | Alertas iougurt Care | `GET /portal/alerts` | ✅ |
| US16 | Histórico Visão Tutor | `GET /portal/patients/:id/history` | ✅ |

**16/16 Histórias de Usuário implementadas no backend.**

---

## 11. Decisões de Design

### Por que Fastify e não Express?
Fastify é 2-3x mais rápido, tem suporte nativo a JSON Schema e integra perfeitamente com Zod via `fastify-type-provider-zod`, gerando tipagem TypeScript + validação + Swagger a partir da mesma definição Zod.

### Por que repositórios in-memory?
Permitem testar 100% das regras de negócio sem Docker, sem banco, sem rede. Os 58 testes rodam em < 1 segundo no total.

### Por que Refresh Token no cookie?
Tokens no `localStorage` são vulneráveis a XSS. O cookie `HttpOnly` não é acessível via JavaScript. O access token (curta duração, 30min) fica no body da resposta.

### Por que senha temporária para o Tutor?
O veterinário cadastra o email do tutor e o sistema gera 12 caracteres aleatórios seguros (`randomBytes`). A senha é retornada **uma única vez** na resposta — não é persistida em texto claro.

### Por que Gemini 1.5 Flash?
É o modelo mais rápido e econômico do Google para geração de texto. A resposta é persistida em `ClinicalRecord.aiSummary` para não chamar a API repetidamente.

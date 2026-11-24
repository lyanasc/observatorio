# Observatório

> Protótipo de gestão editorial com Next.js e PostgreSQL. Este código contém fluxos em desenvolvimento, descritos em Pontos de Atenção.

Plataforma SaaS multi-tenant de gestão editorial, construída com Next.js 16 (App Router) e backend integrado via Server Actions e Route Handlers.

---

## Visão Geral

O Observatório é uma plataforma que permite múltiplas organizações independentes gerenciarem seu próprio fluxo de publicação de conteúdo, com controle de acesso por papel (RBAC), fluxo editorial com múltiplos status, auditoria de ações e área pública de leitura.

Cada organização possui usuários, publicações, categorias, tags, comentários e uploads completamente isolados logicamente por `organizationId`.

---

## Objetivo de Negócio

Oferecer a jornais, portais, institutos de pesquisa e qualquer organização que produza conteúdo editorial uma plataforma white-label pronta para: criar e revisar artigos com fluxo de aprovação, publicar conteúdo em área pública, moderar comentários e gerenciar equipes com permissões granulares.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5.7 |
| Estilo | TailwindCSS v4 |
| Componentes UI | shadcn/ui + Radix UI |
| ORM | Prisma v7 |
| Banco de dados | PostgreSQL |
| Autenticação | JWT (jose) + bcryptjs + cookies HTTP Only |
| Editor rich text | Tiptap v3 (StarterKit, Image, Link, Placeholder) |
| Formulários | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Estado global | Zustand v5 |
| Datas | date-fns (pt-BR) |
| Slugs | slugify |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Toasts | Sonner |

---

## Arquitetura

A aplicação é um monolito Next.js com backend integrado. Não há servidor separado.

```
┌─────────────────────────────────────────────┐
│                 Next.js 16                  │
│                                             │
│  ┌──────────────┐   ┌─────────────────────┐ │
│  │  App Router  │   │   Server Actions    │ │
│  │  (RSC + RCC) │   │  (server/actions/)  │ │
│  └──────┬───────┘   └──────────┬──────────┘ │
│         │                      │            │
│  ┌──────▼──────────────────────▼──────────┐ │
│  │            Prisma ORM v7               │ │
│  └────────────────────┬───────────────────┘ │
└───────────────────────┼─────────────────────┘
                        │
                ┌───────▼───────┐
                │  PostgreSQL   │
                └───────────────┘
```

**Padrões utilizados:**

- **React Server Components** como padrão — Client Components apenas onde há interatividade (formulários, editor, modais).
- **Server Actions** para todas as mutações (create, update, delete, status change). Recebem `FormData`, validam com Zod, executam lógica de negócio e retornam `ApiResponse<T>`.
- **Suspense + async Server Components** para carregamento de dados nas páginas.
- **Middleware** do Next.js para proteção de rotas e injeção de headers de contexto (`x-user-id`, `x-user-role`, `x-organization-id`).

---

## Estrutura de Pastas

```
observatorio/
├── app/
│   ├── (auth)/                  # Grupo de rotas de autenticação (sem layout admin)
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   ├── recuperar-senha/page.tsx
│   │   ├── redefinir-senha/page.tsx
│   │   └── layout.tsx           # Layout centralizado sem sidebar
│   ├── (public)/                # Grupo de rotas públicas (sem autenticação)
│   │   ├── page.tsx             # Home pública
│   │   ├── publicacoes/
│   │   │   ├── page.tsx         # Listagem pública
│   │   │   └── [slug]/page.tsx  # Artigo individual
│   │   ├── categorias/page.tsx
│   │   ├── sobre/page.tsx
│   │   └── layout.tsx           # Layout com header/footer públicos
│   ├── admin/                   # Painel administrativo (requer auth)
│   │   ├── page.tsx             # Dashboard admin
│   │   ├── publicacoes/
│   │   │   ├── page.tsx         # Listagem com filtros
│   │   │   ├── nova/page.tsx    # Criação de publicação
│   │   │   └── [id]/page.tsx    # Edição de publicação
│   │   ├── usuarios/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── tags/page.tsx
│   │   ├── comentarios/page.tsx
│   │   ├── midias/page.tsx      # ⚠️ Página vazia — não implementada
│   │   ├── configuracoes/page.tsx
│   │   └── layout.tsx           # Layout com sidebar admin
│   ├── system/                  # Painel super-admin (role SYSTEM)
│   │   ├── page.tsx             # Dashboard global
│   │   ├── organizacoes/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── publications/route.ts  # ⚠️ Route handler legado, conflita com Server Actions
│   ├── globals.css
│   └── layout.tsx               # Root layout com providers
│
├── components/
│   ├── editor/
│   │   └── rich-text-editor.tsx  # Editor Tiptap (Client Component)
│   ├── layout/
│   │   ├── admin-header.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── public-header.tsx
│   │   └── public-footer.tsx
│   ├── publications/
│   │   └── publication-form.tsx  # Formulário completo de publicação
│   ├── shared/
│   │   ├── empty-state.tsx
│   │   ├── stat-card.tsx
│   │   └── status-badge.tsx
│   ├── ui/                       # Componentes shadcn/ui (não editar diretamente)
│   └── theme-provider.tsx
│
├── server/
│   └── actions/                  # Toda a lógica de backend
│       ├── auth.ts               # login, register, logout, forgotPassword, resetPassword, getCurrentUser
│       ├── publications.ts       # CRUD + changeStatus + getPublicationBySlug
│       ├── categories.ts         # CRUD de categorias (com árvore) + CRUD de tags
│       ├── organizations.ts      # CRUD de orgs + CRUD de usuários
│       ├── comments.ts           # CRUD de comentários + moderação
│       └── dashboard.ts          # getDashboardStats, getRecentPublications, getRecentActivity, charts
│
├── lib/
│   ├── auth.ts                   # JWT, bcrypt, cookies, getSession(), helpers de permissão
│   ├── prisma.ts                 # Singleton do Prisma Client
│   ├── validations.ts            # Todos os schemas Zod
│   ├── helpers.ts                # Utilitários: slug, datas, labels de status/role, formatadores
│   └── utils.ts                  # cn() do shadcn
│
├── providers/
│   ├── auth-provider.tsx         # AuthContext com user, login, logout, refresh
│   └── index.tsx                 # Composição de providers (AuthProvider + ThemeProvider + QueryProvider)
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── types/
│   └── index.ts                  # SessionUser, JWTPayload, ApiResponse, tipos de formulário, helpers de permissão
│
├── prisma/
│   └── schema.prisma             # Schema completo com 11 models
│
├── styles/
│   └── globals.css
│
├── middleware.ts                  # Proteção de rotas, verificação JWT, RBAC
├── next.config.mjs
├── tsconfig.json
├── components.json               # Configuração shadcn/ui
└── package.json
```

> **Atenção:** A arquitetura modular `src/modules/` prevista no spec original **não foi criada**. A estrutura real usa pastas na raiz sem o prefixo `src/`.

---

## Banco de Dados

### Conexão

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5636/observatorio"
```

O Prisma Client usa o padrão singleton para evitar múltiplas conexões em desenvolvimento (hot reload). Veja `lib/prisma.ts`.

### Models e Relacionamentos

```
Organization
  ├── users[]          (User)
  ├── publications[]   (Publication)
  ├── categories[]     (Category)
  ├── tags[]           (Tag)
  └── uploads[]        (Upload)

User
  ├── organization?    (Organization)
  ├── publications[]   (Publication — como autor)
  ├── comments[]       (Comment)
  ├── likes[]          (Like)
  ├── auditLogs[]      (AuditLog)
  └── uploads[]        (Upload)

Publication
  ├── organization     (Organization)
  ├── author           (User)
  ├── categories[]     (CategoriesOnPublications → Category)
  ├── tags[]           (TagsOnPublications → Tag)
  ├── comments[]       (Comment)
  ├── likes[]          (Like)
  └── auditLogs[]      (AuditLog)

Category
  ├── organization     (Organization)
  ├── parent?          (Category — auto-referência)
  ├── children[]       (Category — auto-referência)
  └── publications[]   (CategoriesOnPublications)

Tag
  ├── organization     (Organization)
  └── publications[]   (TagsOnPublications)

Comment
  ├── publication      (Publication)
  ├── author           (User)
  ├── parent?          (Comment — auto-referência para respostas)
  └── replies[]        (Comment)

Like         — publicationId + userId (unique)
AuditLog     — publicationId + userId + action + previousStatus + newStatus + observation
Upload       — organizationId + userId + filename + mimeType + size + url
PasswordResetToken       — email + token (unique) + expiresAt
EmailVerificationToken   — email + token (unique) + expiresAt
```

### Enums

```prisma
enum UserRole {
  SYSTEM     // Super-admin global (acessa /system)
  ADMIN      // Admin da organização
  VALIDATOR  // Pode aprovar/rejeitar publicações
  USER       // Autor comum
}

enum PublicationStatus {
  DRAFT
  PENDING_REVIEW
  CORRECTION_REQUESTED
  APPROVED
  REJECTED
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

### Soft Delete

`Publication` usa `deletedAt DateTime?`. Todas as queries que listam publicações incluem `where: { deletedAt: null }`. Não existe hard delete de publicações na implementação atual.

### Índices relevantes

- `Organization`: `slug` (unique), `isActive`
- `User`: `email` (unique), `organizationId`, `role`
- `Publication`: `(organizationId, slug)` (unique), `(organizationId, status)`, `publishedAt`, `authorId`, `deletedAt`
- `Category`: `(organizationId, slug)` (unique), `parentId`
- `Tag`: `(organizationId, slug)` (unique)
- `AuditLog`: `publicationId`, `userId`, `createdAt`

---

## Autenticação

### Fluxo completo

```
1. Usuário faz POST via Server Action login(formData)
2. Server Action: valida email/password com Zod
3. Busca user no DB, verifica isActive, compara bcrypt hash
4. Cria JWT (jose, HS256, 7 dias) com { sub, email, role, organizationId }
5. Seta cookie auth_token (httpOnly, secure em prod, sameSite: lax, maxAge 7d)
6. Retorna SessionUser para o AuthContext atualizar o estado
```

### Middleware de proteção

O arquivo `middleware.ts` intercepta todas as requisições e:

1. Permite passar: rotas públicas (`/`, `/login`, `/cadastro`, etc.), arquivos estáticos, `/api/auth/*`.
2. Para rotas protegidas: lê `auth_token` do cookie, verifica com `verifyToken()`.
3. Se inválido: redireciona para `/login?callbackUrl=<path>` e deleta o cookie.
4. Verifica RBAC: `/system` exige role `SYSTEM`; `/admin` aceita todos os roles autenticados.
5. Injeta nos headers da requisição: `x-user-id`, `x-user-role`, `x-organization-id`.

### Recuperação de senha

Token gerado via `crypto.getRandomValues`, salvo em `PasswordResetToken` com TTL de 1 hora. **Atenção: o envio do e-mail com o link de reset está substituído por `console.log` — não funciona em produção.**

### Helpers de permissão (lib/auth.ts)

```typescript
isSystemAdmin(role)   // role === "SYSTEM"
isOrgAdmin(role)      // SYSTEM ou ADMIN
canValidate(role)     // SYSTEM, ADMIN ou VALIDATOR
```

### Helpers de permissão (types/index.ts)

```typescript
hasPermission(userRole, requiredRole)  // baseado em hierarquia numérica
canManageOrganization(role)            // SYSTEM ou ADMIN
canValidatePublications(role)          // SYSTEM, ADMIN ou VALIDATOR
canCreatePublications(role)            // todos os roles
```

---

## Rotas da Aplicação

### Área Pública (sem autenticação)

| Rota | Descrição |
|---|---|
| `/` | Home com hero, publicações em destaque e stats |
| `/publicacoes` | Listagem paginada com filtros |
| `/publicacoes/[slug]` | Artigo completo com comentários e likes |
| `/categorias` | Lista de categorias |
| `/sobre` | Página institucional |

> **Atenção:** A home pública usa dados **mockados/hardcoded** — as funções `getFeaturedPublications()` e `getStats()` retornam dados estáticos. Precisam ser substituídas por chamadas reais ao banco.

### Área Autenticada — Admin

| Rota | Descrição | Roles |
|---|---|---|
| `/admin` | Dashboard com métricas e atividade recente | Todos |
| `/admin/publicacoes` | Listagem com filtros de status | Todos |
| `/admin/publicacoes/nova` | Criação de publicação | Todos |
| `/admin/publicacoes/[id]` | Edição de publicação | Autor, ADMIN, SYSTEM |
| `/admin/usuarios` | CRUD de usuários da organização | ADMIN, SYSTEM |
| `/admin/categorias` | CRUD de categorias (tree) | ADMIN, SYSTEM |
| `/admin/tags` | CRUD de tags | ADMIN, SYSTEM |
| `/admin/comentarios` | Moderação de comentários | ADMIN, VALIDATOR, SYSTEM |
| `/admin/midias` | Biblioteca de mídias | ⚠️ Não implementada |
| `/admin/configuracoes` | Configurações da organização | ADMIN, SYSTEM |

### Área System (super-admin)

| Rota | Descrição | Roles |
|---|---|---|
| `/system` | Dashboard global (todas as orgs) | SYSTEM |
| `/system/organizacoes` | CRUD de organizações | SYSTEM |

### API Routes

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/publications` | Lista publicações com filtros | 
| `POST` | `/api/publications` | Cria publicação |

> **Atenção:** Este Route Handler em `app/api/publications/route.ts` é **legado e inconsistente** com a lógica dos Server Actions. Referencia funções inexistentes (`getCurrentUser`, `requireAuth` de `lib/auth` — que não existem) e usa `prisma.publication.findMany` com campo `categoryId` (que não existe no schema — a relação é many-to-many via `CategoriesOnPublications`). **Este arquivo deve ser removido ou reescrito.**

---

## Server Actions

Todas as mutações usam o padrão:

```typescript
"use server"

export async function nomeDaAction(formData: FormData): Promise<ApiResponse<T>> {
  const session = await getSession()
  if (!session) return { success: false, error: "Não autenticado" }
  
  const validated = schema.safeParse(rawData)
  if (!validated.success) return { success: false, error: validated.error.errors[0].message }
  
  // lógica de negócio + Prisma
  
  revalidatePath("/caminho/afetado")
  return { success: true, data: resultado }
}
```

### Retorno padrão

```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Listagem principal de actions

| Arquivo | Actions exportadas |
|---|---|
| `auth.ts` | `login`, `register`, `logout`, `getCurrentUser`, `forgotPassword`, `resetPassword` |
| `publications.ts` | `getPublications`, `getPublication`, `getPublicationBySlug`, `createPublication`, `updatePublication`, `changePublicationStatus`, `deletePublication` |
| `categories.ts` | `getCategories`, `getCategory`, `createCategory`, `updateCategory`, `deleteCategory`, `getTags`, `createTag`, `updateTag`, `deleteTag` |
| `organizations.ts` | `getOrganizations`, `getOrganization`, `createOrganization`, `updateOrganization`, `deleteOrganization`, `getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser` |
| `comments.ts` | `getComments`, `getPublicationComments`, `createComment`, `updateComment`, `deleteComment`, `approveComment`, `rejectComment` |
| `dashboard.ts` | `getDashboardStats`, `getRecentPublications`, `getRecentActivity`, `getPublicationsByStatus`, `getPublicationsOverTime`, `getTopAuthors`, `getSystemStats` |

---

## Fluxo Editorial

### Máquina de estados (PublicationStatus)

```
DRAFT ──────────────────────────────────────► PENDING_REVIEW
  ▲                                                  │
  │                                          ┌───────┴──────────────┐
  │                                          ▼                      ▼
  │                                   CORRECTION_REQUESTED       REJECTED
  │                                          │
  └──────────────────────────────────────────┘
                                      
PENDING_REVIEW ──► APPROVED ──► SCHEDULED ──► PUBLISHED ──► ARCHIVED
```

### Permissões por role nas transições

| Role | Transições permitidas |
|---|---|
| `USER` | `DRAFT → PENDING_REVIEW`, `CORRECTION_REQUESTED → DRAFT`, `CORRECTION_REQUESTED → PENDING_REVIEW` |
| `VALIDATOR` | `PENDING_REVIEW → APPROVED/REJECTED/CORRECTION_REQUESTED`, `APPROVED → SCHEDULED/PUBLISHED`, `SCHEDULED → PUBLISHED`, `PUBLISHED → ARCHIVED` |
| `ADMIN` | Todas as transições |
| `SYSTEM` | Todas as transições |

### Auditoria

Cada transição de status (e create/update/delete) cria um `AuditLog` com:
- `publicationId`, `userId`, `action`, `previousStatus`, `newStatus`, `observation`

As actions reconhecidas são: `CREATED`, `UPDATED`, `DELETED`, `STATUS_CHANGED`.

> **Atenção:** O model `AuditLog` está funcional e preenchido pelo backend, mas **nenhuma timeline visual foi implementada** nas páginas de detalhe da publicação.

---

## Multi-Tenant

O isolamento é implementado logicamente por `organizationId` em todas as queries. Cada recurso (publicação, categoria, tag, upload) pertence a uma organização.

**O que está implementado:**
- Coluna `organizationId` em todos os models relevantes
- Filtro automático por `organizationId` nas Server Actions (quando `session.role !== "SYSTEM"`)
- Role `SYSTEM` acessa dados de todas as organizações sem filtro

**O que NÃO está implementado:**
- `TenantProvider` e `TenantContext`
- Resolução de tenant por subdomínio (ex: `empresa.observatorio.com`)
- Resolução de tenant por path (ex: `/empresa/...`)
- Suporte a domínio customizado por organização

---

## Validações (lib/validations.ts)

Todos os schemas são Zod. Regras principais:

| Campo | Regra |
|---|---|
| Senha | mínimo 6 caracteres |
| Slug | `^[a-z0-9-]+$`, mínimo 2 chars |
| Excerpt | máximo 300 chars |
| SEO title | máximo 60 chars |
| SEO description | máximo 160 chars |
| Paginação | limit máximo 100 |

---

## Componentes Principais

### `RichTextEditor` (components/editor/rich-text-editor.tsx)

Client Component que usa Tiptap v3 com:
- Extensões: StarterKit, Image (via URL), Link (com dialog de URL), Placeholder
- BubbleMenu com opções de formatação inline
- Toolbar completa: H1/H2/H3, bold, italic, strikethrough, code, blockquote, listas, hr, undo/redo
- Dialogs para inserir URL de link e URL de imagem

**Limitações atuais:**
- Imagens inseridas apenas por URL — sem upload integrado
- Sem autosave implementado

### `PublicationForm` (components/publications/publication-form.tsx)

Client Component com React Hook Form + Zod para criação/edição de publicações. Inclui campos de SEO, seleção de categorias/tags, agendamento, capa.

### `AuthProvider` (providers/auth-provider.tsx)

Mantém estado de autenticação no contexto React. Chama `getCurrentUser` na montagem para hidratar o estado com o JWT do cookie. Expõe: `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`, `refresh()`.

### Componentes shadcn/ui

Localizados em `components/ui/`. São gerados pelo CLI do shadcn e **não devem ser editados diretamente**. Para customização, criar wrappers.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string PostgreSQL |
| `JWT_SECRET` | Sim | Chave para assinar/verificar JWT (use string longa e aleatória em prod) |
| `NEXT_PUBLIC_APP_URL` | Não | URL base da aplicação (ex: `https://observatorio.com`) |

> **Atenção:** O `JWT_SECRET` tem fallback hardcoded `"fallback-secret-change-me"` em `lib/auth.ts`. Em produção, essa variável é **obrigatória** e crítica para a segurança.

---

## Como Executar

A configuração do banco neste snapshot ainda precisa ser adaptada ao Prisma 7 antes de executar as etapas abaixo. O schema usa o formato de configuração anterior e falta o adaptador do PostgreSQL. Consulte o [guia de migração do Prisma](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

### Pré-requisitos

- Node.js 22.12+ na linha Node 22
- pnpm (recomendado) ou npm
- PostgreSQL rodando em `localhost:5636`

### Instalação

```bash
# Clonar e instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com seus valores reais

# Executar migrations do banco
pnpm prisma migrate dev

# Gerar Prisma Client
pnpm prisma generate

# Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Visualizar banco de dados

```bash
pnpm prisma studio
```

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (Next.js turbo) |
| `pnpm build` | Build de produção |
| `pnpm start` | Iniciar servidor de produção |
| `pnpm lint` | Lint com ESLint |
| `pnpm prisma migrate dev` | Executar migrations em desenvolvimento |
| `pnpm prisma migrate deploy` | Aplicar migrations em produção |
| `pnpm prisma generate` | Regenerar Prisma Client |
| `pnpm prisma studio` | Interface visual do banco |

---

## Build e Deploy

```bash
pnpm build
pnpm start
```

O `next.config.mjs` tem duas configurações importantes:
- `typescript.ignoreBuildErrors: true` — **erros de TypeScript não bloqueiam o build** (deve ser corrigido antes de produção)
- `images.unoptimized: true` — otimização de imagens desativada (adequado para deploy sem CDN configurado)

---

## Pontos de Atenção

### Bugs e inconsistências

1. **`app/api/publications/route.ts`** importa `getCurrentUser` e `requireAuth` de `@/lib/auth`, mas essas funções não existem com esses nomes. O handler usa campo `categoryId` em `publication.findMany` que não existe no schema. Este arquivo está quebrado e deve ser removido.

2. **Home pública mockada**: `app/(public)/page.tsx` retorna dados hardcoded nas funções `getFeaturedPublications()` e `getStats()`. Não consulta o banco.

3. **JWT_SECRET sem validação de ambiente**: `lib/auth.ts` usa `process.env.JWT_SECRET || "fallback-secret-change-me"`. Se a variável não estiver definida, tokens serão assinados com a chave pública padrão.

4. **`next.config.mjs` com `ignoreBuildErrors: true`**: Erros de TypeScript são silenciados no build. Pode mascarar bugs sérios.

### Funcionalidades incompletas

5. **Envio de e-mail inexistente**: `forgotPassword` em `server/actions/auth.ts` apenas loga o token no console — o usuário nunca recebe o e-mail de reset.

6. **Verificação de e-mail não implementada**: Model `EmailVerificationToken` existe no schema, mas nenhuma lógica de envio ou verificação foi criada.

7. **Biblioteca de mídias vazia**: `app/admin/midias/page.tsx` exibe apenas um `EmptyState` estático — não há Route Handler de upload, nem listagem de arquivos.

8. **Autosave do editor ausente**: O `RichTextEditor` não implementa salvamento automático. Usuário pode perder conteúdo ao navegar.

9. **Agendamento de publicação sem execução**: O campo `scheduledAt` é salvo no banco, mas não há nenhum job/cron/verificação que publique automaticamente quando a data chegue.

10. **Multi-tenant incompleto**: Sem `TenantProvider`, sem resolução por subdomínio/path. A organização do usuário vem apenas do JWT — não é possível acessar uma org específica por URL.

11. **Timeline de auditoria ausente**: `AuditLog` é criado corretamente pelo backend, mas nenhuma página exibe o histórico visualmente.

12. **Busca pública sem backend**: `app/(public)/publicacoes/page.tsx` tem UI de busca, mas a busca textual real não está conectada ao Server Action.

---

## Débitos Técnicos

- Arquitetura `src/modules/` planejada no spec não foi criada. O código está na raiz sem separação por domínio.
- `package.json` tem `"name": "my-project"` — deve ser atualizado para `observatorio`.
- Ausência de seed de banco de dados para desenvolvimento.
- Nenhum teste (unitário, integração ou E2E) implementado.
- `app/api/publications/route.ts` é código morto e quebrado — deve ser deletado.
- `components/ui/use-mobile.tsx` duplicado em `hooks/use-mobile.ts`.
- `components/ui/use-toast.ts` duplicado em `hooks/use-toast.ts`.

---

## Melhorias Futuras

Em ordem de prioridade para produção:

1. **Sistema de uploads** — Route Handler `POST /api/uploads`, armazenamento local em `/public/uploads/[orgId]/`, validação de MIME, limite de tamanho (ex: 5MB), lista e delete. Preparar interface para migração futura para S3.
2. **Envio de e-mails** — Integrar Resend ou Nodemailer. Implementar templates para reset de senha e verificação de e-mail.
3. **Autosave no editor** — Debounce de 3s chamando `updatePublication` silenciosamente. Indicador visual de "salvando..." / "salvo".
4. **Timeline de auditoria** — Componente visual na página `/admin/publicacoes/[id]` mostrando o histórico de `AuditLog` em ordem cronológica.
5. **Multi-tenant por URL** — `TenantProvider` resolvendo `organizationId` a partir de subdomínio ou path param. Middleware atualizado para extrair o tenant.
6. **Busca textual** — PostgreSQL full-text search com `queryRaw` e `to_tsvector`/`to_tsquery`. Conectar à página pública.
7. **Agendamento automático** — Verificar na requisição (ou via cron externo) se há publicações `SCHEDULED` com `scheduledAt <= now()` e publicá-las.
8. **Remover `app/api/publications/route.ts`** — Código morto e quebrado.
9. **Ativar erros de TypeScript no build** — Remover `ignoreBuildErrors: true` do `next.config.mjs` e corrigir os erros acumulados.
10. **Seed de banco** — Criar `prisma/seed.ts` com organização demo, usuários de cada role e publicações de exemplo.

---

## Contexto para IA

### Como a aplicação funciona de ponta a ponta

Toda a lógica de negócio vive em `server/actions/*.ts` (Server Actions do Next.js). As páginas em `app/` são React Server Components que chamam essas actions diretamente (sem fetch). Client Components usam `useTransition` ou `useFormState` para chamar actions com `FormData`.

A autenticação usa cookie `auth_token` (JWT). O middleware verifica o token antes de qualquer rota protegida e injeta o contexto do usuário nos headers. As Server Actions releem o cookie via `getSession()` para validar identidade e role em cada operação.

O isolamento multi-tenant é feito manualmente em cada Server Action: se `session.role !== "SYSTEM"`, o `organizationId` do JWT é adicionado ao `where` do Prisma. Não há RLS no banco — o isolamento é em código.

### Fluxos críticos

**Autenticação**: `login page → login() action → JWT criado → cookie setado → AuthProvider hidratar com getCurrentUser()`. Se o cookie sumir, o middleware redireciona para `/login`.

**Criar publicação**: `publication-form.tsx (RCC) → createPublication(formData) (Server Action) → validação Zod → insert no Prisma + insert AuditLog → revalidatePath → redirect para listagem`.

**Mudar status**: `changePublicationStatus(id, formData) → verifica permissão via checkStatusPermission() → update publication + insert AuditLog → revalidatePath`. A função `checkStatusPermission` é a guardiã do fluxo editorial — toda transição passa por ela.

### O que considerar antes de alterar algo

1. **Schema Prisma**: qualquer mudança requer `prisma migrate dev`. Os tipos do Prisma Client são gerados automaticamente — após migrate, rodar `prisma generate`.
2. **Server Actions**: sempre verificam sessão no início com `getSession()`. Nunca remover essa verificação.
3. **Isolamento por org**: qualquer nova query em Server Action que retorne dados deve incluir `where: { organizationId: session.organizationId }` para roles não-SYSTEM.
4. **revalidatePath**: toda action de mutação deve chamar `revalidatePath` nos caminhos afetados para invalidar o cache do Next.js.
5. **Tipos**: `ApiResponse<T>` é o contrato de retorno de todas as actions. Manter essa consistência.
6. **Validações**: sempre usar schemas Zod de `lib/validations.ts`. Nunca validar manualmente.

### Dependências críticas

- `lib/prisma.ts` → singleton usado em todas as Server Actions. Nunca instanciar `new PrismaClient()` fora deste arquivo.
- `lib/auth.ts` → `getSession()` é chamado em todas as actions. Retorna `null` se não autenticado.
- `middleware.ts` → controla acesso a todas as rotas. Mudanças aqui afetam toda a aplicação.
- `prisma/schema.prisma` → fonte da verdade do banco. Todas as queries dependem deste schema.

### Partes com maior acoplamento

- `server/actions/publications.ts` ↔ `components/publications/publication-form.tsx` — o formulário conhece os campos exatos que a action espera via `FormData`.
- `middleware.ts` ↔ `lib/auth.ts` — o middleware usa `verifyToken()` diretamente.
- `providers/auth-provider.tsx` ↔ `server/actions/auth.ts` — o provider chama `getCurrentUser` e `logout` como Server Actions.
- `types/index.ts` ↔ todos os Server Actions — o tipo `SessionUser` é passado por todo o sistema.

### Como implementar novas features sem quebrar o sistema

1. **Nova entidade no banco**: adicionar ao `schema.prisma` → `prisma migrate dev` → `prisma generate`. Criar Server Actions seguindo o padrão de `categories.ts` (verificação de sessão, validação Zod, isolamento por org, revalidatePath).
2. **Nova página admin**: criar `app/admin/nova-feature/page.tsx` como RSC. Chamar Server Actions diretamente. O layout e sidebar já envolvem automaticamente a página.
3. **Novo campo em formulário**: adicionar ao schema Zod em `lib/validations.ts`, ao `PublicationFormData` em `types/index.ts`, ao Server Action correspondente, e ao componente de formulário.
4. **Nova permissão por role**: a hierarquia está em `types/index.ts` (`ROLE_HIERARCHY`). Usar `hasPermission()` ou os helpers de `lib/auth.ts`. Para transições de publicação, editar `checkStatusPermission()` em `server/actions/publications.ts`.
5. **Upload de arquivo**: criar `app/api/upload/route.ts` como Route Handler (não Server Action, pois precisa processar `multipart/form-data`). Salvar em `public/uploads/[orgId]/[filename]`. Retornar a URL pública. O model `Upload` já existe no schema.

### Partes que exigem cuidado

- **`app/api/publications/route.ts`**: arquivo quebrado, não usar como referência. Ignorar ou deletar.
- **Home pública mockada**: se adicionar dados reais, garantir que a query filtre apenas publicações com `status: "PUBLISHED"` e `deletedAt: null`.
- **JWT_SECRET**: sempre definir via variável de ambiente. O fallback hardcoded é um risco de segurança grave.
- **`next.config.mjs` com `ignoreBuildErrors`**: erros de TypeScript existem no projeto e estão sendo silenciados. Ao fazer refatorações, rodar `tsc --noEmit` para descobrir problemas antes.
- **Categorias em árvore**: a função `buildCategoryTree()` em `categories.ts` monta a hierarquia em memória após buscar todas as categorias da org. Para orgs com muitas categorias, isso pode ser ineficiente.

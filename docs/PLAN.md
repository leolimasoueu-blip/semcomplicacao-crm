# PLAN.md — SemComplicação CRM

Plano de execução dividido em 12 milestones. Estratégia: **interface primeiro, backend depois** — cada tela é construída com dados estáticos/mock antes de ser conectada ao Supabase, garantindo validação de UX antes de qualquer integração.

---

## Visão Geral

| # | Milestone | Branch | Fase |
|---|---|---|---|
| M01 | Setup & Configuração Base | `setup/base` | Infra |
| M02 | Design System & Shell | `ui/design-system` | Interface |
| M03 | Auth UI | `ui/auth` | Interface |
| M04 | Leads UI | `ui/leads` | Interface |
| M05 | Pipeline Kanban UI | `ui/pipeline` | Interface |
| M06 | Dashboard & Atividades UI | `ui/dashboard` | Interface |
| M07 | Landing Page UI | `ui/landing` | Interface |
| M08 | Backend: Supabase + Auth Real | `backend/supabase-auth` | Backend |
| M09 | Backend: Leads + Pipeline | `backend/leads-pipeline` | Backend |
| M10 | Backend: Atividades + Dashboard + Workspaces | `backend/core-data` | Backend |
| M11 | Monetização (Stripe) | `feature/monetization` | Produto |
| M12 | Deploy, Polimento & Produção | `deploy/production` | Deploy |

---

## M01 — Setup & Configuração Base

**Branch:** `setup/base`
**Objetivo:** Repositório funcional com Next.js 14, TypeScript estrito, Tailwind, shadcn/ui inicializado e estrutura de pastas conforme CLAUDE.md.

### Entregas

- [x] Scaffold Next.js 14 com App Router (`create-next-app --typescript`)
- [x] Configurar `tsconfig.json` com `strict: true` e path alias `@/` → `src/`
- [x] Instalar e configurar Tailwind CSS v3 com tema customizado (fonte Inter, paleta `sky`/`slate`)
- [x] Inicializar shadcn/ui (`npx shadcn-ui@latest init`)
- [x] Adicionar componentes shadcn base: Button, Input, Label, Card, Badge, Avatar, Dialog, DropdownMenu, Separator, Skeleton, Tooltip
- [x] Criar estrutura de pastas completa: `src/app`, `src/components`, `src/lib`, `src/hooks`, `src/types`, `src/utils`, `supabase/`, `docs/`
- [x] Criar `.env.local.example` com todas as variáveis do projeto
- [x] Criar `src/types/index.ts` com tipos globais (Workspace, Lead, Deal, Activity, Member, Plan)
- [x] Configurar ESLint + Prettier com regras do projeto
- [x] Verificar `npm run build` sem erros

**Commit final:** `chore: project setup with Next.js 14, Tailwind, shadcn/ui and folder structure`

---

## M02 — Design System & Shell

**Branch:** `ui/design-system`
**Objetivo:** Layout autenticado completo (sidebar + header) com dados estáticos, workspace switcher visual e tokens de design aplicados.

### Entregas

- [ ] `src/components/shared/sidebar.tsx` — sidebar fixa `slate-900`, logo, nav links (Dashboard, Leads, Pipeline, Atividades, Configurações)
- [ ] `src/components/shared/workspace-switcher.tsx` — dropdown com lista de workspaces mockados e botão "Criar workspace"
- [ ] `src/components/shared/header.tsx` — barra superior com título da página, avatar do usuário e menu de perfil
- [ ] Layout autenticado `src/app/(dashboard)/layout.tsx` compondo sidebar + header + `{children}`
- [ ] `src/components/shared/nav-item.tsx` — item de navegação com ícone, label e estado ativo
- [ ] `src/components/shared/page-header.tsx` — cabeçalho de página reutilizável (título + subtítulo + slot de ação)
- [ ] `src/components/shared/empty-state.tsx` — estado vazio genérico (ícone + título + descrição + CTA)
- [ ] `src/components/shared/loading-spinner.tsx` e skeletons base
- [ ] Página placeholder `src/app/(dashboard)/dashboard/page.tsx` para validar layout
- [ ] Responsividade: sidebar colapsa em mobile (hamburger menu)

**Commit final:** `feat: authenticated shell with sidebar, header and workspace switcher`

---

## M03 — Auth UI

**Branch:** `ui/auth``
**Objetivo:** Páginas de login, registro e convite com visual completo, sem conexão real com Supabase.

### Entregas

- [ ] Layout público `src/app/(auth)/layout.tsx` — fundo `slate-50`, card centralizado, logo
- [ ] `src/app/(auth)/login/page.tsx` — formulário e-mail + senha, link "Esqueci minha senha", link para registro
- [ ] `src/app/(auth)/register/page.tsx` — formulário nome + e-mail + senha + confirmação, link para login
- [ ] `src/app/(auth)/invite/[token]/page.tsx` — tela de aceite de convite com nome do workspace e botão "Entrar"
- [ ] `src/app/(auth)/forgot-password/page.tsx` — formulário de recuperação por e-mail
- [ ] `src/components/shared/auth-card.tsx` — card base reusado nas páginas de auth
- [ ] Estados visuais: loading (spinner no botão), erro (mensagem inline), sucesso (redirect mock)
- [ ] Navegação funcional entre páginas de auth

**Commit final:** `feat: auth pages UI (login, register, invite, forgot-password)`

---

## M04 — Leads UI

**Branch:** `ui/leads`
**Objetivo:** Listagem de leads com busca/filtros, página de detalhe com timeline de atividades e modal de criação/edição — todos com dados mockados.

### Entregas

- [ ] `src/lib/mock-data.ts` — dados estáticos de leads, deals e atividades para desenvolvimento
- [ ] `src/app/(dashboard)/leads/page.tsx` — listagem em tabela com colunas: nome, empresa, cargo, status, responsável, data
- [ ] `src/components/leads/lead-table.tsx` — tabela com paginação (mock), ordenação por coluna
- [ ] `src/components/leads/lead-filters.tsx` — filtros: status (select), responsável (select), busca por texto (input)
- [ ] `src/components/leads/lead-status-badge.tsx` — badge colorido por status do lead
- [ ] `src/app/(dashboard)/leads/[id]/page.tsx` — página de detalhe do lead
- [ ] `src/components/leads/lead-profile-card.tsx` — card com dados completos do lead (avatar inicial, nome, empresa, cargo, contatos)
- [ ] `src/components/leads/activity-timeline.tsx` — timeline cronológica de atividades com ícones por tipo (ligação, e-mail, reunião, nota)
- [ ] `src/components/leads/activity-item.tsx` — item individual da timeline
- [ ] `src/components/leads/lead-form-modal.tsx` — modal de criação/edição (Dialog) com campos: nome, e-mail, telefone, empresa, cargo, status, responsável
- [ ] `src/components/leads/add-activity-form.tsx` — formulário inline para registrar nova atividade
- [ ] Estado vazio na listagem com CTA para criar primeiro lead

**Commit final:** `feat: leads list, detail page and activity timeline UI`

---

## M05 — Pipeline Kanban UI

**Branch:** `ui/pipeline`
**Objetivo:** Pipeline Kanban visual com drag-and-drop funcional usando @dnd-kit, colunas coloridas por etapa e cards de negócios — tudo com dados mockados.

### Entregas

- [ ] Instalar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] `src/app/(dashboard)/pipeline/page.tsx` — página do pipeline
- [ ] `src/components/pipeline/kanban-board.tsx` — board container com `DndContext` e scroll horizontal
- [ ] `src/components/pipeline/kanban-column.tsx` — coluna por etapa com header colorido (nome + contagem + valor total), `SortableContext`
- [ ] `src/components/pipeline/deal-card.tsx` — card de negócio com: título, valor (R$), nome do lead, responsável (avatar), prazo, badge de etapa
- [ ] Lógica de drag-and-drop: mover card entre colunas, reordenar dentro da coluna (estado local)
- [ ] `src/components/pipeline/deal-form-modal.tsx` — modal de criação/edição de negócio: título, valor, lead vinculado (select), responsável, prazo, etapa
- [ ] Indicador visual de coluna-alvo durante drag (highlight de borda)
- [ ] Overlay do card sendo arrastado (`DragOverlay`)
- [ ] Etapas definidas como constante em `src/utils/pipeline-stages.ts` com nome e cor

**Commit final:** `feat: kanban pipeline with dnd-kit drag-and-drop UI`

---

## M06 — Dashboard & Atividades UI

**Branch:** `ui/dashboard`
**Objetivo:** Dashboard com cards de métricas, gráfico de funil (Recharts) e página de atividades recentes — dados mockados.

### Entregas

- [ ] Instalar `recharts`
- [ ] `src/app/(dashboard)/dashboard/page.tsx` — página principal do dashboard
- [ ] `src/components/dashboard/metric-card.tsx` — card com: label, valor principal, variação percentual e ícone
- [ ] Grid de 4 metric cards: Total de Leads, Negócios Abertos, Valor do Pipeline (R$), Taxa de Conversão
- [ ] `src/components/dashboard/funnel-chart.tsx` — gráfico de funil com Recharts (FunnelChart) mostrando leads por etapa
- [ ] `src/components/dashboard/upcoming-deals.tsx` — lista de negócios com prazo nos próximos 7 dias
- [ ] `src/components/dashboard/recent-activity-feed.tsx` — feed das últimas atividades registradas
- [ ] `src/app/(dashboard)/activities/page.tsx` — página de todas as atividades com filtro por tipo e lead
- [ ] `src/components/dashboard/period-selector.tsx` — seletor de período (7d / 30d / 90d) para o dashboard

**Commit final:** `feat: dashboard metrics, funnel chart and activities page UI`

---

## M07 — Landing Page UI

**Branch:** `ui/landing`
**Objetivo:** Landing page pública completa e responsiva com todas as seções de marketing.

### Entregas

- [ ] `src/app/(landing)/page.tsx` — página raiz pública
- [ ] `src/app/(landing)/layout.tsx` — layout público com navbar e footer
- [ ] `src/components/landing/navbar.tsx` — barra de navegação com logo, links (Funcionalidades, Preços) e botões Login / Começar Grátis
- [ ] `src/components/landing/hero-section.tsx` — hero com headline, subheadline, CTA primário e screenshot/mockup do app
- [ ] `src/components/landing/features-section.tsx` — grid de funcionalidades com ícone, título e descrição (Kanban, Leads, Dashboard, Multi-empresa, Atividades, Integrações)
- [ ] `src/components/landing/pricing-section.tsx` — cards de planos Free e Pro com lista de features e botão de CTA
- [ ] `src/components/landing/cta-section.tsx` — seção final com CTA "Comece grátis hoje"
- [ ] `src/components/landing/footer.tsx` — footer com links e copyright
- [ ] Responsividade completa (mobile-first)
- [ ] Animações sutis de entrada com Tailwind (fade-in via `animate-`)

**Commit final:** `feat: landing page with hero, features, pricing and CTA sections`

---

## M08 — Backend: Supabase + Auth Real

**Branch:** `backend/supabase-auth`
**Objetivo:** Schema completo do banco no Supabase com RLS, integração real do Supabase Auth nas páginas de auth e middleware de proteção de rotas.

### Entregas

- [x] Criar projeto no Supabase e configurar `.env.local` (3 chaves: URL, anon key, service role)
- [x] `supabase/migrations/001_initial_schema.sql` — tabelas: `workspaces`, `workspace_members`, `leads`, `deals`, `activities`, `subscriptions`
- [x] `supabase/migrations/002_rls_policies.sql` — políticas RLS para todas as tabelas (acesso por `workspace_id` via `workspace_members`)
- [x] `supabase/migrations/003_indexes.sql` — índices em `workspace_id`, `lead_id`, `created_at`
- [x] `src/lib/supabase/client.ts` — lazy singleton com `createBrowserClient<Database>` (uso em Client Components)
- [x] `src/lib/supabase/server.ts` — `async createServerClient<Database>` com cookies (uso em Server Components e Route Handlers)
- [ ] `src/lib/supabase/middleware.ts` — helper de refresh de sessão
- [ ] `src/middleware.ts` — proteção de rotas: redireciona `/dashboard/*` para `/login` se sem sessão
- [ ] Conectar `src/app/(auth)/login/page.tsx` ao Supabase Auth (`signInWithPassword`)
- [ ] Conectar `src/app/(auth)/register/page.tsx` ao Supabase Auth (`signUp`) + criar workspace padrão
- [ ] Conectar `src/app/(auth)/forgot-password/page.tsx` (`resetPasswordForEmail`)
- [ ] Server Action de logout em `src/lib/supabase/actions.ts`
- [x] `src/types/supabase.ts` — scaffold manual das 6 tabelas (Row/Insert/Update); substituir por `supabase gen types typescript` após migrations
- [ ] Testar fluxo completo: registro → login → acesso ao dashboard → logout

**Commit final:** `feat: supabase schema with RLS and real auth integration`

---

## M09 — Backend: Leads + Pipeline

**Branch:** `backend/leads-pipeline`
**Objetivo:** Substituir dados mock de leads e pipeline por dados reais do Supabase com Server Actions e queries otimizadas.

### Entregas

- [ ] `src/lib/supabase/queries/leads.ts` — `getLeads(workspaceId, filters)`, `getLeadById(id)`, `createLead`, `updateLead`, `deleteLead`
- [ ] `src/lib/supabase/queries/deals.ts` — `getDeals(workspaceId)`, `createDeal`, `updateDeal`, `updateDealStage(id, stage)`, `deleteDeal`
- [ ] Substituir mock data na página de leads por query real (Server Component)
- [ ] Implementar busca e filtros de leads com query params na URL
- [ ] `src/app/api/leads/route.ts` — GET (listagem + paginação) / POST (criação)
- [ ] `src/app/api/leads/[id]/route.ts` — GET / PATCH / DELETE
- [ ] Conectar `LeadFormModal` ao Server Action de criação/edição com revalidação
- [ ] Substituir mock data do pipeline por query real
- [ ] Persistir mudança de etapa no drag-and-drop: `updateDealStage` chamado no `onDragEnd`
- [ ] `src/app/api/deals/[id]/stage/route.ts` — PATCH para atualização otimista de etapa
- [ ] Conectar `DealFormModal` ao Server Action de criação/edição
- [ ] Remover `src/lib/mock-data.ts` (ou manter apenas para testes)

**Commit final:** `feat: leads and pipeline connected to supabase with real data`

---

## M10 — Backend: Atividades + Dashboard + Workspaces

**Branch:** `backend/core-data`
**Objetivo:** Atividades persistidas no banco, dashboard com métricas reais, workspace switcher funcional e convites por e-mail via Resend.

### Entregas

- [ ] `src/lib/supabase/queries/activities.ts` — `getActivitiesByLead(leadId)`, `createActivity`, `deleteActivity`
- [ ] Conectar `AddActivityForm` e `ActivityTimeline` ao banco real
- [ ] `src/lib/supabase/queries/dashboard.ts` — queries agregadas: total leads, deals abertos, valor pipeline, taxa de conversão, leads por etapa
- [ ] Substituir dados mock do Dashboard pelos resultados das queries
- [ ] `src/lib/supabase/queries/workspaces.ts` — `getWorkspacesByUser(userId)`, `createWorkspace`, `inviteMember`, `updateMemberRole`, `removeMember`
- [ ] Instalar e configurar Resend (`npm install resend`)
- [ ] `src/lib/resend/templates/invite-email.tsx` — template HTML do e-mail de convite
- [ ] `src/app/api/workspaces/invite/route.ts` — POST: gera token, salva em `workspace_members` (status pending), envia e-mail via Resend
- [ ] `src/app/(auth)/invite/[token]/page.tsx` — conectar ao backend: validar token, aceitar convite, criar sessão
- [ ] Workspace switcher funcional: carregar workspaces reais, trocar contexto e redirecionar
- [ ] `src/app/(dashboard)/settings/page.tsx` — gerenciamento de membros e papéis (real)
- [ ] Enforcement de limite Free na criação de leads e convites (checar `subscriptions`)

**Commit final:** `feat: activities, dashboard metrics and workspaces with invites via Resend`

---

## M11 — Monetização (Stripe)

**Branch:** `feature/monetization`
**Objetivo:** Fluxo completo de assinatura: Stripe Checkout → webhook → ativação do plano Pro → Customer Portal para gerenciamento.

### Entregas

- [ ] Instalar `stripe` e `@stripe/stripe-js`
- [ ] Criar produto "Pro" e preço recorrente (R$49/mês) no Stripe Dashboard
- [ ] `src/lib/stripe/client.ts` — instância do Stripe SDK
- [ ] `src/app/api/stripe/checkout/route.ts` — POST: cria Checkout Session com `customer_email`, `price_id`, `metadata.workspace_id`
- [ ] `src/app/api/stripe/portal/route.ts` — POST: cria Customer Portal Session para gerenciamento de assinatura
- [ ] `supabase/functions/stripe-webhook/index.ts` — Edge Function: processa eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → atualiza tabela `subscriptions`
- [ ] Conectar botão "Fazer Upgrade" da página de configurações ao checkout
- [ ] `src/components/shared/upgrade-banner.tsx` — banner visível no topo quando limite Free é atingido
- [ ] Bloqueio de ação ao atingir limite: modal de upgrade ao tentar criar lead/convidar membro acima do limite
- [ ] `src/app/(dashboard)/settings/billing/page.tsx` — página de faturamento com plano atual, data de renovação e botão "Gerenciar assinatura"
- [ ] Testar fluxo com cartão de teste Stripe: upgrade, downgrade, cancelamento
- [ ] Configurar webhook no Stripe Dashboard apontando para a Edge Function

**Commit final:** `feat: stripe checkout, webhook and customer portal for Pro plan`

---

## M12 — Deploy, Polimento & Produção

**Branch:** `deploy/production`
**Objetivo:** Aplicação em produção na Vercel com Supabase configurado, onboarding do usuário, empty states e responsividade revisados.

### Entregas

- [ ] Criar projeto na Vercel conectado ao repositório GitHub
- [ ] Configurar todas as variáveis de ambiente no painel da Vercel
- [ ] Configurar Supabase em modo produção: Row Level Security verificada, backups habilitados
- [ ] Fazer deploy da Edge Function `stripe-webhook` no Supabase (`supabase functions deploy`)
- [ ] Atualizar webhook URL no Stripe Dashboard para URL de produção
- [ ] `src/app/(dashboard)/onboarding/page.tsx` — fluxo de onboarding para novo workspace: nome do workspace → convidar membros → criar primeiro lead → CTA para pipeline
- [ ] Revisão de todos os empty states (leads, pipeline, atividades, dashboard)
- [ ] Revisão de responsividade: testar em 375px, 768px e 1440px
- [ ] Tratamento global de erros: `src/app/error.tsx` e `src/app/not-found.tsx`
- [ ] Loading states com Suspense e skeletons em todas as páginas de dados
- [ ] Remover todos os `console.log` e dados mock restantes
- [ ] Verificar `npm run build` sem warnings em produção
- [ ] Smoke test em produção: registro → onboarding → criar lead → pipeline → upgrade Pro

**Commit final:** `chore: production deploy with onboarding, polish and final smoke tests`

---

## Regras de Branch

- Sempre criar PR de feature branch → `main`
- Cada milestone = 1 PR com descrição do que foi entregue
- Nunca commitar diretamente na `main`
- Commits em português ou inglês, mas consistente por milestone
- Formato de commit: `tipo: descrição` (feat, fix, chore, refactor, docs)

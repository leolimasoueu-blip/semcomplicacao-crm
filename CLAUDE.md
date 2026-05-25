# SemComplicação CRM — Briefing do Projeto

SaaS multi-empresa para gestão de leads, pipeline Kanban de vendas e métricas comerciais. Voltado para PMEs, freelancers e times de vendas que precisam de um CRM acessível e direto.

PRD completo em [`docs/PRD.md`](docs/PRD.md).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Banco / Auth | Supabase (PostgreSQL + RLS + Auth) |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Linguagem | TypeScript 5 |
| Deploy | Vercel (frontend) + Supabase Edge Functions (webhooks) |

---

## Estrutura de Pastas

```
semcomplicacao-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/             # /login, /register, /invite/[token]
│   │   ├── (dashboard)/        # área autenticada (layout com sidebar)
│   │   │   ├── leads/
│   │   │   ├── pipeline/
│   │   │   ├── activities/
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── stripe/         # checkout, webhook, portal
│   │   │   └── resend/         # envio de convites
│   │   └── (landing)/          # página pública
│   ├── components/
│   │   ├── ui/                 # primitivos shadcn/ui (não editar)
│   │   ├── leads/
│   │   ├── pipeline/
│   │   ├── dashboard/
│   │   └── shared/             # header, sidebar, modals, etc.
│   ├── lib/
│   │   ├── supabase/           # createClient (browser + server) + tipos gerados
│   │   ├── stripe/
│   │   └── resend/
│   ├── hooks/                  # custom React hooks
│   ├── types/                  # tipos globais TypeScript
│   └── utils/                  # helpers puros (sem side effects)
├── supabase/
│   ├── migrations/             # SQL versionado
│   └── functions/              # Edge Functions (ex: stripe-webhook)
├── public/
├── docs/
│   └── PRD.md
├── CLAUDE.md
├── .env.local.example
└── package.json
```

---

## Convenções de Código

- **TypeScript estrito**: `strict: true` no `tsconfig.json`
- **App Router**: Server Components por padrão; `"use client"` apenas quando necessário (interatividade, hooks, browser APIs)
- **Naming**:
  - Arquivos/pastas: `kebab-case`
  - Componentes React: `PascalCase`
  - Funções/variáveis: `camelCase`
  - Constantes de ambiente/config: `UPPER_SNAKE_CASE`
- **Imports absolutos**: `@/` mapeado para `src/`
- **`NEXT_PUBLIC_`**: somente para variáveis que o browser precisa acessar
- **Comentários**: apenas quando o "porquê" é não-óbvio; nunca descrever o que o código já diz

---

## Banco de Dados (Supabase / PostgreSQL)

Tabelas principais — todas com RLS ativa, acesso isolado por `workspace_id`:

| Tabela | Descrição |
|---|---|
| `workspaces` | Cada empresa/time |
| `workspace_members` | Usuários ↔ workspaces (`role`: `admin` \| `member`) |
| `leads` | Contatos/clientes |
| `deals` | Negócios no pipeline (vinculados a um lead) |
| `activities` | Histórico de interações (ligação, e-mail, reunião, nota) |
| `subscriptions` | Plano e status Stripe por workspace |

Migrations em `supabase/migrations/` — nunca editar o banco diretamente em produção.

---

## Identidade Visual

Inspiração: HubSpot CRM + Pipedrive — clean, profissional, focado em ação.

| Elemento | Valor |
|---|---|
| Cor primária | `sky-500` (#0EA5E9) |
| Neutros | `slate-*` (fundo, bordas, texto secundário) |
| Tipografia | Inter (padrão shadcn/ui) |
| Border radius | `rounded-xl` para cards, `rounded-lg` para inputs |
| Sombra | `shadow-sm` (sutil, sem exageros) |
| Sidebar | Fixa, escura (`slate-900`), com logo e workspace switcher |

### Cores do Pipeline Kanban por etapa

| Etapa | Cor |
|---|---|
| Novo Lead | `slate` (cinza) |
| Contato Realizado | `blue` |
| Proposta Enviada | `amber` (amarelo) |
| Negociação | `orange` |
| Fechado Ganho | `green` |
| Fechado Perdido | `red` |

---

## Planos (Monetização)

| Plano | Limites | Preço |
|---|---|---|
| Free | 2 colaboradores, 50 leads | Grátis |
| Pro | Ilimitado | R$49/mês |

Fluxo: Stripe Checkout → webhook → atualiza `subscriptions` via Supabase Edge Function.

---

## Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
```

Copiar `.env.local.example` → `.env.local` e preencher antes de rodar.

---

## Milestones de Desenvolvimento

1. **Setup**: Next.js + Supabase + shadcn/ui + Stripe configurados, deploy base na Vercel
2. **Auth + Workspaces**: login/registro, criação de workspace, convite por e-mail
3. **Leads**: CRUD completo com busca e filtros
4. **Pipeline Kanban**: drag-and-drop com @dnd-kit, persistência no banco
5. **Atividades**: timeline por lead (ligação, e-mail, reunião, nota)
6. **Dashboard**: métricas e gráfico de funil (Recharts)
7. **Monetização**: Stripe Checkout, webhook, Customer Portal, enforcement de limites Free
8. **Landing Page**: hero, features, pricing, CTA
9. **Polimento**: onboarding, empty states, responsividade, acessibilidade

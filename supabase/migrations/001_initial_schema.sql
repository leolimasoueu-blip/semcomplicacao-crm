-- ============================================================
-- 001_initial_schema.sql
-- Tabelas principais do SemComplicação CRM
-- ============================================================

-- Extensão para geração de UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- workspaces
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- workspace_members
-- ------------------------------------------------------------
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'member' check (role in ('admin', 'member')),
  status        text not null default 'active' check (status in ('active', 'pending')),
  invited_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- ------------------------------------------------------------
-- leads
-- ------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  company       text,
  position      text,
  status        text not null default 'new'
                  check (status in ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  owner_id      uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- deals
-- ------------------------------------------------------------
create table if not exists public.deals (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  lead_id       uuid not null references public.leads(id) on delete cascade,
  title         text not null,
  value         numeric(12, 2),
  stage         text not null default 'new_lead'
                  check (stage in (
                    'new_lead',
                    'contacted',
                    'proposal_sent',
                    'negotiation',
                    'closed_won',
                    'closed_lost'
                  )),
  owner_id      uuid references auth.users(id),
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- activities
-- ------------------------------------------------------------
create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  lead_id       uuid not null references public.leads(id) on delete cascade,
  type          text not null check (type in ('call', 'email', 'meeting', 'note')),
  description   text not null,
  user_id       uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- subscriptions
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  workspace_id            uuid not null unique references public.workspaces(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text not null default 'free' check (plan in ('free', 'pro')),
  status                  text not null default 'active',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ------------------------------------------------------------
-- trigger: updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger trg_deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

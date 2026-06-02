-- ============================================================
-- 003_indexes.sql
-- Índices para as queries mais frequentes do CRM
-- ============================================================

-- workspace_members: lookup de sessão (quais workspaces o usuário pertence)
create index if not exists idx_workspace_members_user_id
  on public.workspace_members (user_id);

create index if not exists idx_workspace_members_workspace_id
  on public.workspace_members (workspace_id);

-- leads: listagem e filtros por workspace
create index if not exists idx_leads_workspace_id
  on public.leads (workspace_id);

create index if not exists idx_leads_created_at
  on public.leads (workspace_id, created_at desc);

create index if not exists idx_leads_owner_id
  on public.leads (owner_id);

-- deals: pipeline Kanban (filtro por etapa dentro do workspace)
create index if not exists idx_deals_workspace_id
  on public.deals (workspace_id);

create index if not exists idx_deals_lead_id
  on public.deals (lead_id);

create index if not exists idx_deals_stage
  on public.deals (workspace_id, stage);

create index if not exists idx_deals_due_date
  on public.deals (workspace_id, due_date)
  where due_date is not null;

-- activities: timeline por lead
create index if not exists idx_activities_lead_id
  on public.activities (lead_id, created_at desc);

create index if not exists idx_activities_workspace_id
  on public.activities (workspace_id);

-- subscriptions: lookup rápido por workspace
create index if not exists idx_subscriptions_workspace_id
  on public.subscriptions (workspace_id);

create index if not exists idx_subscriptions_stripe_customer
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

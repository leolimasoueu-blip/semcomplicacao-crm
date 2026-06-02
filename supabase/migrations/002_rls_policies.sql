-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security: cada workspace só vê seus próprios dados
-- ============================================================

-- Habilita RLS em todas as tabelas
alter table public.workspaces           enable row level security;
alter table public.workspace_members    enable row level security;
alter table public.leads                enable row level security;
alter table public.deals                enable row level security;
alter table public.activities           enable row level security;
alter table public.subscriptions        enable row level security;

-- ------------------------------------------------------------
-- Função auxiliar: verifica se o usuário autenticado é membro
-- ativo de um determinado workspace.
-- ------------------------------------------------------------
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

-- Função auxiliar: verifica se o usuário é admin do workspace.
create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- ============================================================
-- workspaces
-- ============================================================
create policy "members can view their workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "admins can update workspace"
  on public.workspaces for update
  using (public.is_workspace_admin(id));

-- INSERT via Server Action (service_role bypasses RLS)

-- ============================================================
-- workspace_members
-- ============================================================
create policy "members can view members of same workspace"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can insert members"
  on public.workspace_members for insert
  with check (public.is_workspace_admin(workspace_id));

create policy "admins can update members"
  on public.workspace_members for update
  using (public.is_workspace_admin(workspace_id));

create policy "admins can delete members"
  on public.workspace_members for delete
  using (public.is_workspace_admin(workspace_id));

-- ============================================================
-- leads
-- ============================================================
create policy "members can view leads"
  on public.leads for select
  using (public.is_workspace_member(workspace_id));

create policy "members can insert leads"
  on public.leads for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update leads"
  on public.leads for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete leads"
  on public.leads for delete
  using (public.is_workspace_member(workspace_id));

-- ============================================================
-- deals
-- ============================================================
create policy "members can view deals"
  on public.deals for select
  using (public.is_workspace_member(workspace_id));

create policy "members can insert deals"
  on public.deals for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update deals"
  on public.deals for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete deals"
  on public.deals for delete
  using (public.is_workspace_member(workspace_id));

-- ============================================================
-- activities
-- ============================================================
create policy "members can view activities"
  on public.activities for select
  using (public.is_workspace_member(workspace_id));

create policy "members can insert activities"
  on public.activities for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can delete activities"
  on public.activities for delete
  using (public.is_workspace_member(workspace_id));

-- ============================================================
-- subscriptions
-- ============================================================
create policy "members can view subscription"
  on public.subscriptions for select
  using (public.is_workspace_member(workspace_id));

-- INSERT/UPDATE apenas via service_role (webhook Stripe)
-- service_role bypassa RLS por definição

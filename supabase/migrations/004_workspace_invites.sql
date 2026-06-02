-- ============================================================
-- 004_workspace_invites.sql
-- Tabela de convites por token para workspace
-- ============================================================

create table if not exists public.workspace_invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email        text not null,
  role         text not null default 'member' check (role in ('admin', 'member')),
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by   uuid references auth.users(id),
  expires_at   timestamptz not null default (now() + interval '7 days'),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists workspace_invites_token_idx
  on public.workspace_invites(token);

create index if not exists workspace_invites_workspace_id_idx
  on public.workspace_invites(workspace_id);

alter table public.workspace_invites enable row level security;

-- Membros podem ver convites pendentes do seu workspace
create policy "workspace_invites_select"
  on public.workspace_invites for select
  using (is_workspace_member(workspace_id));

-- Admins podem criar convites
create policy "workspace_invites_insert"
  on public.workspace_invites for insert
  with check (is_workspace_admin(workspace_id));

-- Admins podem cancelar (deletar) convites
create policy "workspace_invites_delete"
  on public.workspace_invites for delete
  using (is_workspace_admin(workspace_id));

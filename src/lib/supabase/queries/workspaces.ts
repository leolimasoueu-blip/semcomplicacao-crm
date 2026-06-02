import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export type WorkspaceMember = {
  id: string
  user_id: string
  role: 'admin' | 'member'
  email: string | null
  full_name: string | null
  created_at: string
}

export type PendingInvite = {
  id: string
  workspace_id: string
  email: string
  role: 'admin' | 'member'
  token: string
  invited_by: string | null
  expires_at: string
  created_at: string
}

export type WorkspaceInfo = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type WorkspaceSubscription = {
  plan: 'free' | 'pro'
  status: string
}

// ─── Active workspace ─────────────────────────────────────────────────────────

export async function getActiveWorkspaceId(): Promise<string> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!data) redirect('/onboarding')
  return data.workspace_id
}

// ─── Workspace info ───────────────────────────────────────────────────────────

export async function getWorkspaceInfo(workspaceId: string): Promise<WorkspaceInfo | null> {
  const supabase = await getSupabaseServerClient()

  const { data } = await supabase
    .from('workspaces')
    .select('id, name, slug, created_at')
    .eq('id', workspaceId)
    .single()

  return data as WorkspaceInfo | null
}

// ─── Members (with emails via admin client) ───────────────────────────────────

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = await getSupabaseServerClient()
  const admin = getSupabaseAdminClient()

  const { data: rows } = await supabase
    .from('workspace_members')
    .select('id, user_id, role, status, created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (!rows?.length) return []

  const userResults = await Promise.all(
    rows.map((m) => admin.auth.admin.getUserById(m.user_id))
  )

  return rows.map((m, i) => {
    const u = userResults[i].data.user
    return {
      id: m.id,
      user_id: m.user_id,
      role: m.role as 'admin' | 'member',
      email: u?.email ?? null,
      full_name: (u?.user_metadata?.full_name as string | undefined) ?? null,
      created_at: m.created_at,
    }
  })
}

// ─── Pending invites ──────────────────────────────────────────────────────────

export async function getPendingInvites(workspaceId: string): Promise<PendingInvite[]> {
  const admin = getSupabaseAdminClient()

  const { data } = await admin
    .from('workspace_invites')
    .select('id, workspace_id, email, role, token, invited_by, expires_at, created_at')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (data ?? []) as PendingInvite[]
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function getWorkspaceSubscription(
  workspaceId: string
): Promise<WorkspaceSubscription | null> {
  const supabase = await getSupabaseServerClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('workspace_id', workspaceId)
    .single()

  return data as WorkspaceSubscription | null
}

// ─── Workspaces by user (for switcher) ───────────────────────────────────────

export async function getWorkspacesByUser(): Promise<WorkspaceInfo[]> {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!memberships?.length) return []

  const ids = memberships.map((m) => m.workspace_id)

  const { data } = await supabase
    .from('workspaces')
    .select('id, name, slug, created_at')
    .in('id', ids)
    .order('created_at', { ascending: true })

  return (data ?? []) as WorkspaceInfo[]
}

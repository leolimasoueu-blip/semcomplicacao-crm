'use server'

import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from './server'
import { getSupabaseAdminClient } from './admin'

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createWorkspace(name: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) redirect('/login')

  const trimmed = name.trim()
  const slug =
    trimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') +
    '-' +
    Date.now().toString(36)

  const admin = getSupabaseAdminClient()

  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .insert({ name: trimmed, slug })
    .select()
    .single()

  if (wsError || !workspace) {
    return { error: 'Erro ao criar workspace. Tente novamente.' }
  }

  const { error: memberError } = await admin.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'admin',
    status: 'active',
  })

  if (memberError) {
    return { error: 'Erro ao configurar permissões. Tente novamente.' }
  }

  await admin.from('subscriptions').insert({
    workspace_id: workspace.id,
    plan: 'free',
    status: 'active',
  })

  redirect('/dashboard')
}

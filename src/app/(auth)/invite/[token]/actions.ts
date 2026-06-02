'use server'

import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function acceptInvite(token: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const admin = getSupabaseAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado para aceitar o convite.' }

  // Look up invite bypassing RLS (user is not yet a member)
  const { data: invite } = await admin
    .from('workspace_invites')
    .select('id, workspace_id, email, role, invited_by, accepted_at, expires_at')
    .eq('token', token)
    .single()

  if (!invite) return { error: 'Convite inválido.' }
  if (invite.accepted_at) return { error: 'Este convite já foi aceito.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'Este convite expirou.' }

  // Email must match the logged-in user
  if (invite.email !== user.email?.toLowerCase()) {
    return {
      error: `Este convite foi enviado para ${invite.email}. Faça login com essa conta para aceitar.`,
    }
  }

  // Create workspace membership
  const { error: memberError } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role as 'admin' | 'member',
      status: 'active',
      invited_by: invite.invited_by,
    })

  // Duplicate membership (already a member) — still accept the invite
  if (memberError && memberError.code !== '23505') {
    return { error: 'Erro ao aceitar convite. Tente novamente.' }
  }

  // Mark invite as accepted
  await admin
    .from('workspace_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  redirect('/dashboard')
}

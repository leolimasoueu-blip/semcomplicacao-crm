import { getSupabaseServerClient } from '@/lib/supabase/server'

export const FREE_LEAD_LIMIT = 50
export const FREE_MEMBER_LIMIT = 2

export async function canAddLead(
  workspaceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await getSupabaseServerClient()
  const [{ data: sub }, { count }] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('workspace_id', workspaceId).single(),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
  ])

  if (sub?.plan !== 'free') return { allowed: true }
  if ((count ?? 0) >= FREE_LEAD_LIMIT) {
    return {
      allowed: false,
      reason: `Limite de ${FREE_LEAD_LIMIT} leads do plano Free atingido. Faça upgrade para Pro em Configurações > Faturamento.`,
    }
  }
  return { allowed: true }
}

export async function canAddMember(
  workspaceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await getSupabaseServerClient()
  const [{ data: sub }, { count }] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('workspace_id', workspaceId).single(),
    supabase
      .from('workspace_members')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'active'),
  ])

  if (sub?.plan !== 'free') return { allowed: true }
  if ((count ?? 0) >= FREE_MEMBER_LIMIT) {
    return {
      allowed: false,
      reason: `O plano Free permite no máximo ${FREE_MEMBER_LIMIT} membros. Faça upgrade para Pro.`,
    }
  }
  return { allowed: true }
}

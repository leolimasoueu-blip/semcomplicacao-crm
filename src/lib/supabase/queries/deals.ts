import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Deal } from '@/types'

export async function getDeals(workspaceId: string): Promise<Deal[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('deals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Deal[]
}

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Lead, LeadStatus } from '@/types'

export type LeadFilters = {
  search?: string
  status?: LeadStatus | 'all'
}

export async function getLeads(
  workspaceId: string,
  filters?: LeadFilters
): Promise<Lead[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search?.trim()) {
    const term = filters.search.trim()
    query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%`)
  }

  const { data } = await query
  return (data ?? []) as Lead[]
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  return data as Lead | null
}

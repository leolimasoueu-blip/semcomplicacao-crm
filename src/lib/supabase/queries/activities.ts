import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Activity } from '@/types'

type DbActivity = {
  id: string
  lead_id: string
  workspace_id: string
  type: string
  description: string
  user_id: string | null
  created_at: string
}

function mapActivity(row: DbActivity): Activity {
  return {
    id: row.id,
    lead_id: row.lead_id,
    workspace_id: row.workspace_id,
    type: row.type as Activity['type'],
    description: row.description,
    created_by: row.user_id ?? '',
    created_at: row.created_at,
  }
}

export async function getActivitiesByLeadId(leadId: string): Promise<Activity[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  return ((data ?? []) as DbActivity[]).map(mapActivity)
}

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { PIPELINE_STAGES } from '@/utils/pipeline-stages'
import type { ActivityType } from '@/types'

export type DashboardMetrics = {
  totalLeads: number
  openDeals: number
  pipelineValue: number
  conversionRate: number
}

export type FunnelItem = { id: string; name: string; count: number }

export type UpcomingDeal = {
  id: string
  title: string
  value: number
  due_date: string
  stage: string
  leadLabel: string
}

export type RecentActivityItem = {
  id: string
  type: ActivityType
  description: string
  created_at: string
  leadName: string
}

export async function getDashboardData(workspaceId: string) {
  const supabase = await getSupabaseServerClient()

  const [leadsRes, dealsRes, activitiesRes] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
    supabase
      .from('deals')
      .select('id, title, value, stage, due_date, lead_id, leads(name, company)')
      .eq('workspace_id', workspaceId),
    supabase
      .from('activities')
      .select('id, type, description, created_at, lead_id, leads(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  type DealRow = {
    id: string
    title: string
    value: number | null
    stage: string
    due_date: string | null
    lead_id: string
    leads: { name: string; company: string | null } | null
  }
  type ActivityRow = {
    id: string
    type: string
    description: string
    created_at: string
    lead_id: string
    leads: { name: string } | null
  }

  const deals = (dealsRes.data ?? []) as DealRow[]
  const activities = (activitiesRes.data ?? []) as ActivityRow[]

  // Metrics
  const openDeals = deals.filter(
    (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost'
  )
  const closedWon = deals.filter((d) => d.stage === 'closed_won').length
  const closedLost = deals.filter((d) => d.stage === 'closed_lost').length
  const metrics: DashboardMetrics = {
    totalLeads: leadsRes.count ?? 0,
    openDeals: openDeals.length,
    pipelineValue: openDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    conversionRate:
      closedWon + closedLost > 0
        ? Math.round((closedWon / (closedWon + closedLost)) * 100)
        : 0,
  }

  // Funnel
  const funnelData: FunnelItem[] = PIPELINE_STAGES.map((s) => ({
    id: s.id,
    name: s.label,
    count: deals.filter((d) => d.stage === s.id).length,
  }))

  // Upcoming deals — next 7 days
  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const upcomingDeals: UpcomingDeal[] = deals
    .filter(
      (d) =>
        d.due_date &&
        d.stage !== 'closed_won' &&
        d.stage !== 'closed_lost' &&
        d.due_date >= today &&
        d.due_date <= in7Days
    )
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value ?? 0,
      due_date: d.due_date!,
      stage: d.stage,
      leadLabel: d.leads?.company ?? d.leads?.name ?? '',
    }))

  // Recent activities
  const recentActivities: RecentActivityItem[] = activities.map((a) => ({
    id: a.id,
    type: a.type as ActivityType,
    description: a.description,
    created_at: a.created_at,
    leadName: a.leads?.name ?? 'Lead removido',
  }))

  return { metrics, funnelData, upcomingDeals, recentActivities }
}

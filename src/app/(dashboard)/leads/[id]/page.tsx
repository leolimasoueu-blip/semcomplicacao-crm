import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/supabase/queries/workspaces"
import { getLeadById } from "@/lib/supabase/queries/leads"
import { getActivitiesByLeadId } from "@/lib/supabase/queries/activities"
import { LeadDetailClient } from "@/components/leads/lead-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params

  const [workspaceId, supabase] = await Promise.all([
    getActiveWorkspaceId(),
    getSupabaseServerClient(),
  ])

  const [lead, activities, { data: { user } }] = await Promise.all([
    getLeadById(id),
    getActivitiesByLeadId(id),
    supabase.auth.getUser(),
  ])

  if (!lead) notFound()

  const meta = user?.user_metadata as { full_name?: string } | undefined
  const displayName = meta?.full_name ?? user?.email?.split("@")[0] ?? "Você"

  return (
    <LeadDetailClient
      lead={lead}
      activities={activities}
      workspaceId={workspaceId}
      currentUserId={user!.id}
      currentUserName={displayName}
    />
  )
}

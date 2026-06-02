import { getActiveWorkspaceId } from "@/lib/supabase/queries/workspaces"
import { getDeals } from "@/lib/supabase/queries/deals"
import { getLeads } from "@/lib/supabase/queries/leads"
import { PipelineClient } from "@/components/pipeline/pipeline-client"

export default async function PipelinePage() {
  const workspaceId = await getActiveWorkspaceId()

  const [deals, leads] = await Promise.all([
    getDeals(workspaceId),
    getLeads(workspaceId),
  ])

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
  }))

  return (
    <PipelineClient
      initialDeals={deals}
      leads={leadOptions}
      workspaceId={workspaceId}
    />
  )
}

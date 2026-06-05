import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/supabase/queries/workspaces"
import { getLeads } from "@/lib/supabase/queries/leads"
import { canAddLead } from "@/lib/limits"
import { LeadsView } from "@/components/leads/leads-view"
import type { LeadStatus } from "@/types"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface Props {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const { search = "", status = "all" } = await searchParams

  const [workspaceId, supabase] = await Promise.all([
    getActiveWorkspaceId(),
    getSupabaseServerClient(),
  ])

  const [leads, { data: { user } }, limitCheck] = await Promise.all([
    getLeads(workspaceId, { search, status: status as LeadStatus | "all" }),
    supabase.auth.getUser(),
    canAddLead(workspaceId),
  ])

  const atLeadLimit = !limitCheck.allowed

  const meta = user?.user_metadata as { full_name?: string } | undefined
  const displayName =
    meta?.full_name ?? user?.email?.split("@")[0] ?? "Usuário"
  const initials = getInitials(displayName)

  return (
    <LeadsView
      leads={leads}
      workspaceId={workspaceId}
      currentUser={{ id: user!.id, displayName, initials }}
      searchActive={search !== "" || status !== "all"}
      atLeadLimit={atLeadLimit}
    />
  )
}

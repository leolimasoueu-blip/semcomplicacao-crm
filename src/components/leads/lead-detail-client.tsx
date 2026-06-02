"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LeadProfileCard } from "@/components/leads/lead-profile-card"
import { ActivityTimeline } from "@/components/leads/activity-timeline"
import { AddActivityForm } from "@/components/leads/add-activity-form"
import { LeadFormModal } from "@/components/leads/lead-form-modal"
import type { Lead, Activity } from "@/types"

interface LeadDetailClientProps {
  lead: Lead
  activities: Activity[]
  workspaceId: string
  currentUserId: string
  currentUserName: string
}

export function LeadDetailClient({
  lead,
  activities,
  workspaceId,
  currentUserId,
  currentUserName,
}: LeadDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/leads"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Voltar para Leads</span>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{lead.name}</h1>
          {lead.company && (
            <p className="text-sm text-muted-foreground">{lead.company}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeadProfileCard lead={lead} onEdit={() => setModalOpen(true)} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Atividades
                  {activities.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({activities.length})
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityTimeline
                activities={activities}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="size-4" />
                Registrar atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AddActivityForm workspaceId={workspaceId} leadId={lead.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="edit"
        lead={lead}
        workspaceId={workspaceId}
      />
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LeadProfileCard } from "@/components/leads/lead-profile-card"
import { ActivityTimeline } from "@/components/leads/activity-timeline"
import { AddActivityForm } from "@/components/leads/add-activity-form"
import { LeadFormModal, type LeadFormData } from "@/components/leads/lead-form-modal"
import { MOCK_LEADS, getActivitiesByLeadId, MOCK_MEMBERS } from "@/lib/mock-data"
import type { Lead, Activity, ActivityType } from "@/types"

function makeId() {
  return `a${Date.now()}`
}

export default function LeadDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const initialLead = MOCK_LEADS.find((l) => l.id === id)
  if (!initialLead) notFound()

  const [lead, setLead] = useState<Lead>(initialLead)
  const [activities, setActivities] = useState<Activity[]>(() =>
    getActivitiesByLeadId(id)
  )
  const [modalOpen, setModalOpen] = useState(false)

  const activityCount = activities.length

  function handleSaveLead(data: LeadFormData) {
    setLead((prev) => ({
      ...prev,
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      position: data.position || null,
      owner_id: data.owner_id || null,
      updated_at: new Date().toISOString(),
    }))
  }

  function handleAddActivity(type: ActivityType, description: string) {
    const newActivity: Activity = {
      id: makeId(),
      lead_id: id,
      workspace_id: "w1",
      type,
      description,
      created_by: MOCK_MEMBERS[0].id,
      created_at: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

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
                  {activityCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({activityCount})
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityTimeline activities={activities} />
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
              <AddActivityForm onAdd={handleAddActivity} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="edit"
        lead={lead}
        onSave={handleSaveLead}
      />
    </div>
  )
}

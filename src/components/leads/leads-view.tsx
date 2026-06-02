"use client"

import { useState, Suspense } from "react"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { LeadTable } from "@/components/leads/lead-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { LeadFormModal } from "@/components/leads/lead-form-modal"
import type { Lead } from "@/types"

interface CurrentUser {
  id: string
  displayName: string
  initials: string
}

interface LeadsViewProps {
  leads: Lead[]
  workspaceId: string
  currentUser: CurrentUser
  searchActive: boolean
}

export function LeadsView({ leads, workspaceId, currentUser, searchActive }: LeadsViewProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined)

  function openCreate() {
    setEditingLead(undefined)
    setModalOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} contato${leads.length !== 1 ? "s" : ""} encontrado${leads.length !== 1 ? "s" : ""}`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Novo Lead
          </Button>
        }
      />

      <Suspense>
        <LeadFilters />
      </Suspense>

      {leads.length === 0 ? (
        searchActive ? (
          <EmptyState
            icon={Users}
            title="Nenhum lead encontrado"
            description="Tente ajustar sua busca ou remover os filtros aplicados."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum lead ainda"
            description="Adicione seu primeiro lead para começar a gerenciar seus contatos."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                Adicionar Lead
              </Button>
            }
          />
        )
      ) : (
        <LeadTable
          leads={leads}
          onEdit={openEdit}
          currentUserId={currentUser.id}
          currentUserName={currentUser.displayName}
          currentUserInitials={currentUser.initials}
        />
      )}

      <LeadFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={editingLead ? "edit" : "create"}
        lead={editingLead}
        workspaceId={workspaceId}
      />
    </div>
  )
}

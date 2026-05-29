"use client"

import { useState, useMemo } from "react"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { LeadTable } from "@/components/leads/lead-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { LeadFormModal, type LeadFormData } from "@/components/leads/lead-form-modal"
import { MOCK_LEADS } from "@/lib/mock-data"
import type { Lead, LeadStatus } from "@/types"

function makeId() {
  return `l${Date.now()}`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined)

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search === "" ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.company ?? "").toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [leads, search, statusFilter])

  function openCreate() {
    setEditingLead(undefined)
    setModalOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead)
    setModalOpen(true)
  }

  function handleSave(data: LeadFormData) {
    if (editingLead) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id
            ? { ...l, ...data, updated_at: new Date().toISOString() }
            : l
        )
      )
    } else {
      const now = new Date().toISOString()
      const newLead: Lead = {
        id: makeId(),
        workspace_id: "w1",
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        owner_id: data.owner_id || null,
        created_at: now,
        updated_at: now,
      }
      setLeads((prev) => [newLead, ...prev])
    }
  }

  function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} contato${leads.length !== 1 ? "s" : ""} no total`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Novo Lead
          </Button>
        }
      />

      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {filtered.length === 0 ? (
        search !== "" || statusFilter !== "all" ? (
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
        <LeadTable leads={filtered} onEdit={openEdit} />
      )}

      <LeadFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={editingLead ? "edit" : "create"}
        lead={editingLead}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}

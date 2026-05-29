"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { KanbanBoardContainer } from "@/components/pipeline/kanban-board"
import { DealFormModal, type DealFormData } from "@/components/pipeline/deal-form-modal"
import { MOCK_DEALS } from "@/lib/mock-data"
import type { Deal, DealStage } from "@/types"

interface ModalState {
  open: boolean
  mode: "create" | "edit"
  deal?: Deal
  defaultStage: DealStage
}

const CLOSED_MODAL: ModalState = { open: false, mode: "create", defaultStage: "new_lead" }

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS)
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL)

  function handleAddDeal(stage: DealStage) {
    setModal({ open: true, mode: "create", defaultStage: stage })
  }

  function handleEditDeal(deal: Deal) {
    setModal({ open: true, mode: "edit", deal, defaultStage: deal.stage })
  }

  function handleSave(data: DealFormData) {
    if (modal.mode === "create") {
      const newDeal: Deal = {
        id: `d${Date.now()}`,
        workspace_id: "w1",
        lead_id: data.lead_id,
        title: data.title,
        value: data.value,
        stage: data.stage,
        owner_id: data.owner_id,
        due_date: data.due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setDeals((prev) => [...prev, newDeal])
    } else if (modal.deal) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === modal.deal!.id
            ? {
                ...d,
                title: data.title,
                value: data.value,
                stage: data.stage,
                lead_id: data.lead_id,
                owner_id: data.owner_id,
                due_date: data.due_date,
                updated_at: new Date().toISOString(),
              }
            : d
        )
      )
    }
  }

  function handleDelete(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <PageHeader
        title="Pipeline"
        subtitle="Acompanhe seus negócios em andamento"
        action={
          <Button size="sm" onClick={() => handleAddDeal("new_lead")}>
            <Plus className="size-4" />
            Novo Negócio
          </Button>
        }
      />

      <div className="flex-1 min-h-0">
        <KanbanBoardContainer
          deals={deals}
          onDealsChange={setDeals}
          onAddDeal={handleAddDeal}
          onEditDeal={handleEditDeal}
        />
      </div>

      <DealFormModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        mode={modal.mode}
        deal={modal.deal}
        defaultStage={modal.defaultStage}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}

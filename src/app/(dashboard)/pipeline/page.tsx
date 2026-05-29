"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { KanbanBoardContainer } from "@/components/pipeline/kanban-board"
import { DealFormModal } from "@/components/pipeline/deal-form-modal"
import type { Deal, DealStage } from "@/types"

interface ModalState {
  open: boolean
  mode: "create" | "edit"
  deal?: Deal
  defaultStage: DealStage
}

const CLOSED_MODAL: ModalState = {
  open: false,
  mode: "create",
  defaultStage: "new_lead",
}

export default function PipelinePage() {
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL)

  function handleAddDeal(stage: DealStage) {
    setModal({ open: true, mode: "create", defaultStage: stage })
  }

  function handleEditDeal(deal: Deal) {
    setModal({ open: true, mode: "edit", deal, defaultStage: deal.stage })
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
        <KanbanBoardContainer onAddDeal={handleAddDeal} onEditDeal={handleEditDeal} />
      </div>

      <DealFormModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        mode={modal.mode}
        deal={modal.deal}
        defaultStage={modal.defaultStage}
        onSave={() => {}}
        onDelete={() => {}}
      />
    </div>
  )
}

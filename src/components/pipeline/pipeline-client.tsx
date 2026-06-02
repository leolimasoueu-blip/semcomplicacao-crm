"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { KanbanBoardContainer } from "@/components/pipeline/kanban-board"
import { DealFormModal, type LeadOption } from "@/components/pipeline/deal-form-modal"
import type { Deal, DealStage } from "@/types"

interface ModalState {
  open: boolean
  mode: "create" | "edit"
  deal?: Deal
  defaultStage: DealStage
}

const CLOSED_MODAL: ModalState = { open: false, mode: "create", defaultStage: "new_lead" }

interface PipelineClientProps {
  initialDeals: Deal[]
  leads: LeadOption[]
  workspaceId: string
}

export function PipelineClient({ initialDeals, leads, workspaceId }: PipelineClientProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL)

  // Sync when server refreshes after create/edit/delete
  useEffect(() => {
    setDeals(initialDeals)
  }, [initialDeals])

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
        leads={leads}
        workspaceId={workspaceId}
      />
    </div>
  )
}

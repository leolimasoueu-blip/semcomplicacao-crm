"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "@/components/pipeline/kanban-column"
import { DealCard } from "@/components/pipeline/deal-card"
import { PIPELINE_STAGES } from "@/utils/pipeline-stages"
import { MOCK_DEALS } from "@/lib/mock-data"
import type { Deal, DealStage } from "@/types"

interface KanbanBoardProps {
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
  deals: Deal[]
  onDealsChange: (deals: Deal[]) => void
}

export function KanbanBoard({ onAddDeal, onEditDeal, deals, onDealsChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  const getStageForDeal = useCallback(
    (dealId: string): DealStage | null => {
      return deals.find((d) => d.id === dealId)?.stage ?? null
    },
    [deals]
  )

  const getStageForDropTarget = useCallback(
    (id: string): DealStage | null => {
      if (PIPELINE_STAGES.some((s) => s.id === id)) return id as DealStage
      return getStageForDeal(id)
    },
    [getStageForDeal]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null)

    const { active, over } = event
    if (!over) return

    const activeStage = getStageForDeal(String(active.id))
    const overStage = getStageForDropTarget(String(over.id))

    if (!activeStage || !overStage || activeStage === overStage) return

    onDealsChange(
      deals.map((d) => (d.id === String(active.id) ? { ...d, stage: overStage } : d))
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activeStage = getStageForDeal(activeId)
    const overStage = getStageForDropTarget(overId)

    if (!activeStage || !overStage) return

    if (activeStage === overStage && activeId !== overId) {
      const stageDeals = deals.filter((d) => d.stage === activeStage)
      const oldIndex = stageDeals.findIndex((d) => d.id === activeId)
      const newIndex = stageDeals.findIndex((d) => d.id === overId)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(stageDeals, oldIndex, newIndex)
      const otherDeals = deals.filter((d) => d.stage !== activeStage)
      onDealsChange([...otherDeals, ...reordered])
    }
  }

  const overStage = overId ? getStageForDropTarget(overId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-0.5">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter((d) => d.stage === stage.id)}
            isOver={overStage === stage.id && activeId !== null}
            onAddDeal={onAddDeal}
            onEditDeal={onEditDeal}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDeal ? (
          <DealCard deal={activeDeal} onEdit={() => {}} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export function KanbanBoardContainer({
  onAddDeal,
  onEditDeal,
}: {
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
}) {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS)

  return (
    <KanbanBoard
      deals={deals}
      onDealsChange={setDeals}
      onAddDeal={onAddDeal}
      onEditDeal={onEditDeal}
    />
  )
}

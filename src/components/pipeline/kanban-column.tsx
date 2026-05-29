"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { DealCard } from "@/components/pipeline/deal-card"
import type { PipelineStage } from "@/utils/pipeline-stages"
import type { Deal, DealStage } from "@/types"

interface KanbanColumnProps {
  stage: PipelineStage
  deals: Deal[]
  isOver: boolean
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function KanbanColumn({ stage, deals, isOver, onAddDeal, onEditDeal }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const dealIds = deals.map((d) => d.id)

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div
        className={[
          "flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 border",
          isOver ? `${stage.colorBg} ${stage.colorBorder}` : "bg-slate-50 border-transparent",
          "transition-colors duration-150",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`size-2.5 rounded-full shrink-0 ${stage.colorDot}`} />
          <span className="text-sm font-semibold text-slate-700 truncate">{stage.label}</span>
          <span className="shrink-0 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 leading-none">
            {deals.length}
          </span>
        </div>
        <span className={`text-xs font-semibold shrink-0 ml-2 ${stage.colorText}`}>
          {formatCurrency(totalValue)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={[
          "flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors duration-150",
          isOver ? `${stage.colorBg} border-2 border-dashed ${stage.colorBorder}` : "bg-slate-100/60",
        ].join(" ")}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onEdit={onEditDeal} />
          ))}
        </SortableContext>

        <button
          onClick={() => onAddDeal(stage.id)}
          className={[
            "flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium",
            "text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors",
            "border border-dashed border-transparent hover:border-slate-200",
          ].join(" ")}
        >
          <Plus className="size-3.5" />
          Adicionar negócio
        </button>
      </div>
    </div>
  )
}

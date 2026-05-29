"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays, GripVertical } from "lucide-react"
import { getPipelineStage } from "@/utils/pipeline-stages"
import { getMemberById, MOCK_LEADS } from "@/lib/mock-data"
import type { Deal } from "@/types"

interface DealCardProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  isDragOverlay?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr + "T00:00:00") < new Date(new Date().toDateString())
}

export function DealCard({ deal, onEdit, isDragOverlay = false }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const stage = getPipelineStage(deal.stage)
  const lead = MOCK_LEADS.find((l) => l.id === deal.lead_id)
  const owner = getMemberById(deal.owner_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="deal-card"
      className={[
        "group relative bg-white rounded-xl shadow-sm border border-slate-200 cursor-pointer",
        "hover:shadow-md hover:border-slate-300 transition-all duration-150",
        isDragging && !isDragOverlay ? "opacity-40 shadow-none" : "",
        isDragOverlay ? "shadow-lg rotate-1 cursor-grabbing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onEdit(deal)}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${stage.colorDot}`} />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start gap-1">
          <p className="flex-1 text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {deal.title}
          </p>
          {/* Grip: DnD listener isolado — stopPropagation no pointerdown evita que o
              preventDefault do PointerSensor bloqueie o onClick do card */}
          <button
            {...attributes}
            {...listeners}
            onPointerDown={(e) => {
              e.stopPropagation()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(listeners as Record<string, (e: React.PointerEvent) => void>)?.onPointerDown?.(e)
            }}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-opacity"
            aria-label="Arrastar negócio"
          >
            <GripVertical className="size-3.5" />
          </button>
        </div>

        <p className="mt-1 text-base font-bold text-sky-600">{formatCurrency(deal.value)}</p>

        {lead && (
          <p className="mt-1.5 text-xs text-slate-500 truncate">
            {lead.name}
            {lead.company ? ` · ${lead.company}` : ""}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {owner ? (
            <div
              className="size-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center shrink-0"
              title={owner.name}
            >
              {owner.initials}
            </div>
          ) : (
            <div className="size-6" />
          )}

          {deal.due_date && (
            <div
              className={[
                "flex items-center gap-1 text-[11px] font-medium",
                isOverdue(deal.due_date) ? "text-red-500" : "text-slate-400",
              ].join(" ")}
            >
              <CalendarDays className="size-3" />
              {formatDate(deal.due_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { CalendarDays, AlertCircle } from "lucide-react"
import { getPipelineStage } from "@/utils/pipeline-stages"
import { cn } from "@/lib/utils"
import type { UpcomingDeal } from "@/lib/supabase/queries/dashboard"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function daysUntil(dateStr: string) {
  const today = new Date(new Date().toDateString())
  const target = new Date(dateStr + "T00:00:00")
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

interface UpcomingDealsProps {
  deals: UpcomingDeal[]
}

export function UpcomingDeals({ deals }: UpcomingDealsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <CalendarDays className="size-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">Vencimentos nos próximos 7 dias</h3>
      </div>

      {deals.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground text-center">
          Nenhum negócio vencendo em breve.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {deals.map((deal) => {
            const stage = getPipelineStage(deal.stage as import("@/types").DealStage)
            const days = daysUntil(deal.due_date)
            const isUrgent = days <= 3

            return (
              <li key={deal.id} className="flex items-center gap-3 px-5 py-3">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", stage.colorDot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{deal.title}</p>
                  {deal.leadLabel && (
                    <p className="text-xs text-muted-foreground truncate">{deal.leadLabel}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-sky-600">{formatCurrency(deal.value)}</p>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 text-[11px] font-medium mt-0.5",
                      isUrgent ? "text-red-500" : "text-slate-400"
                    )}
                  >
                    {isUrgent && <AlertCircle className="size-3 shrink-0" />}
                    {formatDate(deal.due_date)}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

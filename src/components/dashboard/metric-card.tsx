import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  change?: number
  icon: LucideIcon
  iconClassName?: string
}

export function MetricCard({ label, value, change, icon: Icon, iconClassName }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-green-600" : "text-red-500"
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3.5 shrink-0" />
              ) : (
                <TrendingDown className="size-3.5 shrink-0" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {change}% vs mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5 shrink-0", iconClassName ?? "bg-sky-50")}>
          <Icon className={cn("size-5", iconClassName ? "text-white" : "text-sky-500")} />
        </div>
      </div>
    </div>
  )
}

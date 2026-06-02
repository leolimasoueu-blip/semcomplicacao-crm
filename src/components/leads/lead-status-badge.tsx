import { cn } from "@/lib/utils"
import type { LeadStatus } from "@/types"

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "Novo",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  contacted: {
    label: "Contatado",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  qualified: {
    label: "Qualificado",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  unqualified: {
    label: "Desqualificado",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  converted: {
    label: "Cliente",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }

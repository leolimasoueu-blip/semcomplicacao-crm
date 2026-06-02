import { Phone, Mail, Users, FileText, Activity } from "lucide-react"
import type { ActivityType } from "@/types"
import type { RecentActivityItem } from "@/lib/supabase/queries/dashboard"

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof Phone; label: string; iconClass: string; bgClass: string }
> = {
  call: { icon: Phone, label: "Ligação", iconClass: "text-sky-600", bgClass: "bg-sky-50" },
  email: { icon: Mail, label: "E-mail", iconClass: "text-violet-600", bgClass: "bg-violet-50" },
  meeting: { icon: Users, label: "Reunião", iconClass: "text-amber-600", bgClass: "bg-amber-50" },
  note: { icon: FileText, label: "Nota", iconClass: "text-slate-500", bgClass: "bg-slate-100" },
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hoje"
  if (days === 1) return "Ontem"
  if (days < 7) return `${days} dias atrás`
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

interface RecentActivityFeedProps {
  activities: RecentActivityItem[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Activity className="size-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">Atividades Recentes</h3>
      </div>

      {activities.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground text-center">
          Nenhuma atividade registrada ainda.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type]
            const Icon = config.icon

            return (
              <li key={activity.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${config.bgClass}`}>
                  <Icon className={`size-3.5 ${config.iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {activity.leadName}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatRelative(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{config.label}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

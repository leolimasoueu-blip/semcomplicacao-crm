import { Phone, Mail, CalendarDays, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Activity, ActivityType } from "@/types"
import type { MockMember } from "@/lib/mock-data"

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { label: string; icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  call: {
    label: "Ligação",
    icon: Phone,
    iconClass: "text-blue-500",
    dotClass: "bg-blue-100 dark:bg-blue-900/30",
  },
  email: {
    label: "E-mail",
    icon: Mail,
    iconClass: "text-purple-500",
    dotClass: "bg-purple-100 dark:bg-purple-900/30",
  },
  meeting: {
    label: "Reunião",
    icon: CalendarDays,
    iconClass: "text-green-500",
    dotClass: "bg-green-100 dark:bg-green-900/30",
  },
  note: {
    label: "Nota",
    icon: FileText,
    iconClass: "text-amber-500",
    dotClass: "bg-amber-100 dark:bg-amber-900/30",
  },
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

interface ActivityItemProps {
  activity: Activity
  member?: MockMember
  isLast?: boolean
}

export function ActivityItem({ activity, member, isLast }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", config.dotClass)}>
          <Icon className={cn("size-4", config.iconClass)} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
          {member && (
            <span className="text-xs text-muted-foreground">por {member.name}</span>
          )}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {formatDate(activity.created_at)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  )
}

export { ACTIVITY_CONFIG }

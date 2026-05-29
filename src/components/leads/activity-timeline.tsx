import { ActivityItem } from "@/components/leads/activity-item"
import { getMemberById } from "@/lib/mock-data"
import type { Activity } from "@/types"

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </p>
    )
  }

  return (
    <div>
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          member={getMemberById(activity.created_by)}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  )
}

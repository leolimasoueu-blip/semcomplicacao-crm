import { ActivityItem } from "@/components/leads/activity-item"
import type { Activity } from "@/types"

interface ActivityTimelineProps {
  activities: Activity[]
  currentUserId?: string
  currentUserName?: string
}

export function ActivityTimeline({
  activities,
  currentUserId,
  currentUserName,
}: ActivityTimelineProps) {
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
          memberName={
            activity.created_by && activity.created_by === currentUserId
              ? (currentUserName ?? "Você")
              : undefined
          }
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  )
}

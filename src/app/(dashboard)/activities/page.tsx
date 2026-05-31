"use client"

import { useState, useMemo } from "react"
import { Phone, Mail, Users, FileText, Filter } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { MOCK_ACTIVITIES, MOCK_LEADS, MOCK_MEMBERS } from "@/lib/mock-data"
import type { ActivityType } from "@/types"
import { cn } from "@/lib/utils"

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof Phone; label: string; iconClass: string; bgClass: string }
> = {
  call: { icon: Phone, label: "Ligação", iconClass: "text-sky-600", bgClass: "bg-sky-50" },
  email: { icon: Mail, label: "E-mail", iconClass: "text-violet-600", bgClass: "bg-violet-50" },
  meeting: { icon: Users, label: "Reunião", iconClass: "text-amber-600", bgClass: "bg-amber-50" },
  note: { icon: FileText, label: "Nota", iconClass: "text-slate-500", bgClass: "bg-slate-100" },
}

const TYPE_FILTERS: { value: ActivityType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "call", label: "Ligações" },
  { value: "email", label: "E-mails" },
  { value: "meeting", label: "Reuniões" },
  { value: "note", label: "Notas" },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all")
  const [leadFilter, setLeadFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return [...MOCK_ACTIVITIES]
      .filter((a) => typeFilter === "all" || a.type === typeFilter)
      .filter((a) => leadFilter === "all" || a.lead_id === leadFilter)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [typeFilter, leadFilter])

  const leadsWithActivities = useMemo(() => {
    const ids = [...new Set(MOCK_ACTIVITIES.map((a) => a.lead_id))]
    return MOCK_LEADS.filter((l) => ids.includes(l.id))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades"
        subtitle="Histórico completo de interações com seus leads"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-4" />
          Filtrar:
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
          {TYPE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                typeFilter === opt.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={leadFilter}
          onChange={(e) => setLeadFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">Todos os leads</option>
          {leadsWithActivities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? "atividade" : "atividades"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma atividade encontrada para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {filtered.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type]
            const Icon = config.icon
            const lead = MOCK_LEADS.find((l) => l.id === activity.lead_id)
            const member = MOCK_MEMBERS.find((m) => m.id === activity.created_by)

            return (
              <div key={activity.id} className="flex items-start gap-4 px-5 py-4">
                <div className={cn("mt-0.5 rounded-lg p-2 shrink-0", config.bgClass)}>
                  <Icon className={cn("size-4", config.iconClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {lead?.name ?? "Lead removido"}
                      </span>
                      {lead?.company && (
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                          · {lead.company}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{activity.description}</p>
                  {member && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {config.label} registrado por {member.name}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

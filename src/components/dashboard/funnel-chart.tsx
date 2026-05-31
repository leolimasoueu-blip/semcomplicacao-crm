"use client"

import { MOCK_DEALS } from "@/lib/mock-data"
import { PIPELINE_STAGES } from "@/utils/pipeline-stages"

const STAGE_COLORS: Record<string, string> = {
  new_lead: "bg-slate-400",
  contacted: "bg-blue-500",
  proposal_sent: "bg-amber-500",
  negotiation: "bg-orange-500",
  closed_won: "bg-green-500",
  closed_lost: "bg-red-500",
}

const STAGE_TEXT_COLORS: Record<string, string> = {
  new_lead: "text-slate-600",
  contacted: "text-blue-600",
  proposal_sent: "text-amber-600",
  negotiation: "text-orange-600",
  closed_won: "text-green-600",
  closed_lost: "text-red-600",
}

function buildFunnelData() {
  return PIPELINE_STAGES.map((stage) => ({
    id: stage.id,
    name: stage.label,
    count: MOCK_DEALS.filter((d) => d.stage === stage.id).length,
  }))
}

export function DashboardFunnelChart() {
  const data = buildFunnelData()
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">Funil do Pipeline</h3>
      <div className="space-y-3">
        {data.map((stage) => {
          const widthPct = Math.round((stage.count / maxCount) * 100)
          return (
            <div key={stage.id} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-slate-500 text-right leading-tight">
                {stage.name}
              </span>
              <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className={`h-full rounded-md transition-all ${STAGE_COLORS[stage.id]}`}
                  style={{ width: stage.count === 0 ? "4px" : `${widthPct}%` }}
                />
              </div>
              <span
                className={`w-6 shrink-0 text-xs font-semibold tabular-nums text-right ${
                  stage.count === 0 ? "text-slate-300" : STAGE_TEXT_COLORS[stage.id]
                }`}
              >
                {stage.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

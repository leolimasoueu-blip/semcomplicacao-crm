import type { DealStage } from "@/types"

export interface PipelineStage {
  id: DealStage
  label: string
  colorDot: string
  colorBorder: string
  colorBg: string
  colorText: string
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "new_lead",
    label: "Novo Lead",
    colorDot: "bg-slate-400",
    colorBorder: "border-slate-400",
    colorBg: "bg-slate-50",
    colorText: "text-slate-600",
  },
  {
    id: "contacted",
    label: "Contato Realizado",
    colorDot: "bg-blue-500",
    colorBorder: "border-blue-500",
    colorBg: "bg-blue-50",
    colorText: "text-blue-600",
  },
  {
    id: "proposal_sent",
    label: "Proposta Enviada",
    colorDot: "bg-amber-500",
    colorBorder: "border-amber-500",
    colorBg: "bg-amber-50",
    colorText: "text-amber-600",
  },
  {
    id: "negotiation",
    label: "Negociação",
    colorDot: "bg-orange-500",
    colorBorder: "border-orange-500",
    colorBg: "bg-orange-50",
    colorText: "text-orange-600",
  },
  {
    id: "closed_won",
    label: "Fechado Ganho",
    colorDot: "bg-green-500",
    colorBorder: "border-green-500",
    colorBg: "bg-green-50",
    colorText: "text-green-600",
  },
  {
    id: "closed_lost",
    label: "Fechado Perdido",
    colorDot: "bg-red-500",
    colorBorder: "border-red-500",
    colorBg: "bg-red-50",
    colorText: "text-red-600",
  },
]

export function getPipelineStage(stage: DealStage): PipelineStage {
  return PIPELINE_STAGES.find((s) => s.id === stage) ?? PIPELINE_STAGES[0]
}

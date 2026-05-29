import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Clock } from "lucide-react"

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades"
        subtitle="Histórico de interações com seus leads"
      />
      <EmptyState
        icon={Clock}
        title="Nenhuma atividade registrada"
        description="As atividades aparecem aqui conforme você registra ligações, e-mails e reuniões nos leads."
      />
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { BarChart3, Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas métricas comerciais"
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Novo Lead
          </Button>
        }
      />
      <EmptyState
        icon={BarChart3}
        title="Dashboard em construção"
        description="As métricas e gráficos serão exibidos aqui após a integração com o banco de dados."
      />
    </div>
  )
}

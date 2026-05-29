import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { KanbanSquare, Plus } from "lucide-react"

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        subtitle="Acompanhe seus negócios em andamento"
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Novo Negócio
          </Button>
        }
      />
      <EmptyState
        icon={KanbanSquare}
        title="Pipeline vazio"
        description="Crie negócios a partir dos seus leads para visualizá-los no Kanban."
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Criar Negócio
          </Button>
        }
      />
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Gerencie seus contatos e clientes"
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Novo Lead
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="Nenhum lead ainda"
        description="Adicione seu primeiro lead para começar a gerenciar seus contatos."
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Adicionar Lead
          </Button>
        }
      />
    </div>
  )
}

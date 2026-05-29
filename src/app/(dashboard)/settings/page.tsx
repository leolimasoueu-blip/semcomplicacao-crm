import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu workspace, membros e plano"
      />
      <EmptyState
        icon={Settings}
        title="Configurações em breve"
        description="Gerenciamento de membros, planos e integrações serão configurados aqui."
      />
    </div>
  )
}

import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DashboardFunnelChart } from "@/components/dashboard/funnel-chart"
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals"
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed"
import { getActiveWorkspaceId } from "@/lib/supabase/queries/workspaces"
import { getDashboardData } from "@/lib/supabase/queries/dashboard"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  const workspaceId = await getActiveWorkspaceId()
  const { metrics, funnelData, upcomingDeals, recentActivities } =
    await getDashboardData(workspaceId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas métricas comerciais"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de Leads"
          value={String(metrics.totalLeads)}
          icon={Users}
          iconClassName="bg-sky-500"
        />
        <MetricCard
          label="Negócios Abertos"
          value={String(metrics.openDeals)}
          icon={Briefcase}
          iconClassName="bg-violet-500"
        />
        <MetricCard
          label="Valor do Pipeline"
          value={formatCurrency(metrics.pipelineValue)}
          icon={DollarSign}
          iconClassName="bg-amber-500"
        />
        <MetricCard
          label="Taxa de Conversão"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          iconClassName="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardFunnelChart data={funnelData} />
        <UpcomingDeals deals={upcomingDeals} />
      </div>

      <RecentActivityFeed activities={recentActivities} />
    </div>
  )
}

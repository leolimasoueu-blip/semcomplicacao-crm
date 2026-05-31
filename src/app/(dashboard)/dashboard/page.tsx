"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { PeriodSelector, type Period } from "@/components/dashboard/period-selector"
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals"
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed"
import { MOCK_LEADS, MOCK_DEALS } from "@/lib/mock-data"

const DashboardFunnelChart = dynamic(
  () => import("@/components/dashboard/funnel-chart").then((m) => m.DashboardFunnelChart),
  { ssr: false }
)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function computeMetrics() {
  const totalLeads = MOCK_LEADS.length
  const openDeals = MOCK_DEALS.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  )
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const closedWon = MOCK_DEALS.filter((d) => d.stage === "closed_won").length
  const closedLost = MOCK_DEALS.filter((d) => d.stage === "closed_lost").length
  const conversionRate =
    closedWon + closedLost > 0
      ? Math.round((closedWon / (closedWon + closedLost)) * 100)
      : 0

  return { totalLeads, openDeals: openDeals.length, pipelineValue, conversionRate }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const { totalLeads, openDeals, pipelineValue, conversionRate } = computeMetrics()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas métricas comerciais"
        action={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de Leads"
          value={String(totalLeads)}
          change={12}
          icon={Users}
          iconClassName="bg-sky-500"
        />
        <MetricCard
          label="Negócios Abertos"
          value={String(openDeals)}
          change={5}
          icon={Briefcase}
          iconClassName="bg-violet-500"
        />
        <MetricCard
          label="Valor do Pipeline"
          value={formatCurrency(pipelineValue)}
          change={-3}
          icon={DollarSign}
          iconClassName="bg-amber-500"
        />
        <MetricCard
          label="Taxa de Conversão"
          value={`${conversionRate}%`}
          change={8}
          icon={TrendingUp}
          iconClassName="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardFunnelChart />
        <UpcomingDeals />
      </div>

      <RecentActivityFeed />
    </div>
  )
}

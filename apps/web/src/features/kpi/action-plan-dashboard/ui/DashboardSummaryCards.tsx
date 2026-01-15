import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Progress } from "@/shared/ui/components/progress"
import { BarChart, FileText, AlertTriangle, TrendingUp } from "lucide-react"
import type { BffDashboardSummary } from "../types"

interface DashboardSummaryCardsProps {
  summary: BffDashboardSummary
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const cards = [
    {
      title: "総KPI数",
      value: summary.totalKpiCount,
      icon: BarChart,
      color: "text-primary",
    },
    {
      title: "総プラン数",
      value: summary.totalPlanCount,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "遅延件数",
      value: summary.delayedPlanCount,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "完了件数",
      value: summary.completedPlanCount,
      icon: TrendingUp,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">全体進捗率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{summary.overallProgressRate}%</span>
            </div>
            <Progress value={summary.overallProgressRate} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffBudgetTrendFilters, BffBudgetConsumptionMonth } from "@epm/contracts/bff/budget-trend-report"

interface BudgetConsumptionChartProps {
  filters: BffBudgetTrendFilters
  selectedOrgId: string
}

export function BudgetConsumptionChart({ filters, selectedOrgId }: BudgetConsumptionChartProps) {
  const client = useBffClient()
  const [months, setMonths] = useState<BffBudgetConsumptionMonth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChart() {
      setLoading(true)
      try {
        const response = await client.getConsumptionChart(filters, selectedOrgId)
        setMonths(response.months)
      } finally {
        setLoading(false)
      }
    }
    fetchChart()
  }, [client, filters, selectedOrgId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>予算消化率推移</CardTitle>
          <p className="text-sm text-muted-foreground">
            実績消化率（青）と計画消化率（緑）の推移
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--positive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--positive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value, name) => {
                    if (value == null) return ["-", name]
                    if (name === "actualRate") return [`${value}%`, "実績消化率"]
                    if (name === "planRate") return [`${value}%`, "計画消化率"]
                    return [String(value), String(name)]
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "14px" }}
                  formatter={(value) => {
                    if (value === "actualRate") return "実績消化率"
                    if (value === "planRate") return "計画消化率"
                    return value
                  }}
                />
                <ReferenceLine y={100} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="planRate"
                  stroke="hsl(var(--positive))"
                  strokeWidth={2}
                  fill="url(#colorPlan)"
                />
                <Area
                  type="monotone"
                  dataKey="actualRate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorActual)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* データテーブル */}
      <Card>
        <CardHeader>
          <CardTitle>月次詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">月</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">予算累計</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">実績累計</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">実績消化率</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">計画消化率</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">差異</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => (
                  <tr key={row.monthNo} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2 px-3 font-medium">{row.month}</td>
                    <td className="text-right py-2 px-3">¥{row.budget.toLocaleString()}M</td>
                    <td className="text-right py-2 px-3">
                      {row.consumed !== null ? `¥${row.consumed.toLocaleString()}M` : "-"}
                    </td>
                    <td className="text-right py-2 px-3 font-semibold text-primary">
                      {row.actualRate !== null ? `${row.actualRate}%` : "-"}
                    </td>
                    <td className="text-right py-2 px-3 text-positive">{row.planRate}%</td>
                    <td
                      className={`text-right py-2 px-3 font-semibold ${
                        row.varianceRate !== null && row.varianceRate >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {row.varianceRate !== null ? `${row.varianceRate.toFixed(1)}%` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

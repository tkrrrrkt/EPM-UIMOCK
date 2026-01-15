"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffBudgetTrendFilters, BffBudgetYearComparisonMonth } from "@epm/contracts/bff/budget-trend-report"

interface BudgetYearComparisonProps {
  filters: BffBudgetTrendFilters
  selectedOrgId: string
}

export function BudgetYearComparison({ filters, selectedOrgId }: BudgetYearComparisonProps) {
  const client = useBffClient()
  const [months, setMonths] = useState<BffBudgetYearComparisonMonth[]>([])
  const [ytdData, setYtdData] = useState({ current: 0, prior: 0, variance: 0, rate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true)
      try {
        const response = await client.getYearComparison(filters, selectedOrgId)
        setMonths(response.months)
        setYtdData({
          current: response.ytdCurrentYear,
          prior: response.ytdPriorYear,
          variance: response.ytdVariance,
          rate: response.ytdVarianceRate,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchComparison()
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
      {/* YTDサマリー */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">当年累計</p>
            <p className="text-2xl font-bold text-foreground">¥{ytdData.current.toLocaleString()}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">前年累計</p>
            <p className="text-2xl font-bold text-foreground">¥{ytdData.prior.toLocaleString()}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">前年差異</p>
            <p className={`text-2xl font-bold ${ytdData.variance >= 0 ? "text-positive" : "text-negative"}`}>
              {ytdData.variance >= 0 ? "+" : ""}¥{ytdData.variance.toLocaleString()}M ({ytdData.rate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 月次比較グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>月次前年比較</CardTitle>
          <p className="text-sm text-muted-foreground">
            当年実績（青）と前年実績（灰）の月次比較
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value, name) => {
                    if (value == null) return ["-", name]
                    if (name === "currentYear") return [`¥${value}M`, "当年"]
                    if (name === "priorYear") return [`¥${value}M`, "前年"]
                    return [String(value), String(name)]
                  }}
                />
                <Legend
                  formatter={(value) => {
                    if (value === "currentYear") return "当年"
                    if (value === "priorYear") return "前年"
                    return value
                  }}
                />
                <Bar dataKey="priorYear" fill="hsl(var(--muted-foreground))" opacity={0.5} />
                <Bar dataKey="currentYear" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 詳細テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>月次詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">月</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">当年</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">前年</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">差異</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">差異率</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => (
                  <tr key={row.monthNo} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2 px-3 font-medium">{row.month}</td>
                    <td className="text-right py-2 px-3">
                      {row.currentYear !== null ? `¥${row.currentYear}M` : "-"}
                    </td>
                    <td className="text-right py-2 px-3">
                      {row.priorYear !== null ? `¥${row.priorYear}M` : "-"}
                    </td>
                    <td
                      className={`text-right py-2 px-3 font-semibold ${
                        row.variance !== null && row.variance >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {row.variance !== null ? `${row.variance >= 0 ? "+" : ""}¥${row.variance}M` : "-"}
                    </td>
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

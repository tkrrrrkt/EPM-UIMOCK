"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, Skeleton, Progress } from "@/shared/ui"
import { TrendingUp, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffBudgetTrendFilters, BffBudgetTrendSummary as SummaryType } from "@epm/contracts/bff/budget-trend-report"

interface BudgetTrendSummaryProps {
  filters: BffBudgetTrendFilters
  selectedOrgId: string
}

export function BudgetTrendSummary({ filters, selectedOrgId }: BudgetTrendSummaryProps) {
  const client = useBffClient()
  const [summary, setSummary] = useState<SummaryType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true)
      try {
        const response = await client.getSummary(filters, selectedOrgId)
        setSummary(response.summary)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [client, filters, selectedOrgId])

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* 予算消化率 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">予算消化率</p>
            <div className="rounded-full bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            {summary.consumptionRate.toFixed(1)}%
          </p>
          <Progress value={summary.consumptionRate} className="h-2 mb-2" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">計画比:</span>
            <span className={`text-sm font-semibold flex items-center ${summary.varianceRate >= 0 ? "text-positive" : "text-negative"}`}>
              {summary.varianceRate >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {summary.varianceRate >= 0 ? "+" : ""}{summary.varianceRate.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 累計実績 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">累計実績</p>
            <div className="rounded-full bg-budget/10 p-2">
              <Target className="h-5 w-5 text-budget" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            ¥{summary.ytdActual.toLocaleString()}M
          </p>
          <p className="text-sm text-muted-foreground">
            予算: ¥{summary.ytdBudget.toLocaleString()}M
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">差異:</span>
            <span className={`text-sm font-semibold ${summary.variance >= 0 ? "text-positive" : "text-negative"}`}>
              {summary.variance >= 0 ? "+" : ""}¥{summary.variance.toLocaleString()}M
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 着地見込 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">着地見込</p>
            <div className="rounded-full bg-forecast/10 p-2">
              <Calendar className="h-5 w-5 text-forecast" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            ¥{summary.landingForecast.toLocaleString()}M
          </p>
          <p className="text-sm text-muted-foreground">
            年間予算: ¥{summary.annualBudget.toLocaleString()}M
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">達成率:</span>
            <span className={`text-sm font-semibold ${summary.landingVariance >= 0 ? "text-positive" : "text-negative"}`}>
              {((summary.landingForecast / summary.annualBudget) * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 前年比較 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">前年同期比</p>
            <div className={`rounded-full p-2 ${summary.priorYearVariance >= 0 ? "bg-positive/10" : "bg-negative/10"}`}>
              {summary.priorYearVariance >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-positive" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-negative" />
              )}
            </div>
          </div>
          <p className={`text-3xl font-bold ${summary.priorYearVarianceRate >= 0 ? "text-positive" : "text-negative"}`}>
            {summary.priorYearVarianceRate >= 0 ? "+" : ""}{summary.priorYearVarianceRate.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            前年実績: ¥{summary.priorYearActual.toLocaleString()}M
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">差異:</span>
            <span className={`text-sm font-semibold ${summary.priorYearVariance >= 0 ? "text-positive" : "text-negative"}`}>
              {summary.priorYearVariance >= 0 ? "+" : ""}¥{summary.priorYearVariance.toLocaleString()}M
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

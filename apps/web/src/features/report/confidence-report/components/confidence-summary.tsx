"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, Skeleton } from "@/shared/ui"
import { TrendingUp, Target, DollarSign, Briefcase } from "lucide-react"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffConfidenceReportFilters, BffConfidenceReportSummary } from "@epm/contracts/bff/confidence-report"

interface ConfidenceSummaryProps {
  filters: BffConfidenceReportFilters
  selectedOrgId: string
}

export function ConfidenceSummary({ filters, selectedOrgId }: ConfidenceSummaryProps) {
  const client = useBffClient()
  const [summary, setSummary] = useState<BffConfidenceReportSummary | null>(null)
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

  const expectedRate = (summary.expectedValue / summary.budget) * 100
  const vsLastMonth = summary.expectedValue - summary.previousExpectedValue
  const vsLastMonthRate = (vsLastMonth / summary.previousExpectedValue) * 100
  const highConfidenceRate = (summary.highConfidence / summary.expectedValue) * 100

  const formatCurrency = (value: number) => {
    const billions = value / 100000000
    return `${billions.toFixed(2)}億円`
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* 期待値合計 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">期待値合計</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCurrency(summary.expectedValue)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">予算対比:</span>
                <span className={`text-sm font-semibold ${expectedRate >= 100 ? "text-positive" : "text-negative"}`}>
                  {expectedRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 確度S+A合計 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">高確度（S+A）</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCurrency(summary.highConfidence)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">期待値の</span>
                <span className="text-sm font-semibold text-positive">
                  {highConfidenceRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="rounded-full bg-positive/10 p-3">
              <Target className="h-6 w-6 text-positive" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 総見込額 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">総見込額</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCurrency(summary.totalForecast)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">前月比:</span>
                <span className={`text-sm font-semibold ${vsLastMonth >= 0 ? "text-positive" : "text-negative"}`}>
                  {vsLastMonth >= 0 ? "+" : ""}
                  {vsLastMonthRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="rounded-full bg-budget/10 p-3">
              <DollarSign className="h-6 w-6 text-budget" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 案件数 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">案件数</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.projectCount}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">平均単価:</span>
                <span className="text-sm font-semibold text-foreground">
                  {(summary.totalForecast / summary.projectCount / 10000).toFixed(0)}万円
                </span>
              </div>
            </div>
            <div className="rounded-full bg-forecast/10 p-3">
              <Briefcase className="h-6 w-6 text-forecast" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

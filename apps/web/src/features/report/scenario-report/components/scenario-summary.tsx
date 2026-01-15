"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, Skeleton } from "@/shared/ui"
import { TrendingUp, TrendingDown, Target } from "lucide-react"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffScenarioReportFilters, BffScenarioReportSummaryResponse } from "@epm/contracts/bff/scenario-report"

interface ScenarioSummaryProps {
  filters: BffScenarioReportFilters
  selectedOrgId: string
}

export function ScenarioSummary({ filters, selectedOrgId }: ScenarioSummaryProps) {
  const client = useBffClient()
  const [data, setData] = useState<BffScenarioReportSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await client.getSummary(filters, selectedOrgId)
        setData(response)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [client, filters, selectedOrgId])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const downside = data.summary.normal - data.summary.worst
  const upside = data.summary.best - data.summary.normal

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-scenario-normal" />
            <h3 className="text-sm font-medium text-muted-foreground">ノーマル（計画）</h3>
          </div>
          <p className="text-2xl font-bold">¥{data.summary.normal.toLocaleString()}M</p>
          <p className="text-xs text-muted-foreground mt-1">
            予算達成率: {data.normalVsBudgetRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-scenario-worst" />
            <h3 className="text-sm font-medium text-muted-foreground">ダウンサイドリスク</h3>
          </div>
          <p className="text-2xl font-bold text-scenario-worst">
            -¥{downside.toLocaleString()}M
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ワースト: ¥{data.summary.worst.toLocaleString()}M ({data.worstVsBudgetRate.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-scenario-best" />
            <h3 className="text-sm font-medium text-muted-foreground">アップサイド機会</h3>
          </div>
          <p className="text-2xl font-bold text-scenario-best">
            +¥{upside.toLocaleString()}M
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ベスト: ¥{data.summary.best.toLocaleString()}M ({data.bestVsBudgetRate.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 bg-gradient-to-r from-scenario-worst to-scenario-best rounded" />
            <h3 className="text-sm font-medium text-muted-foreground">シナリオ幅</h3>
          </div>
          <p className="text-2xl font-bold">¥{data.summary.range.toLocaleString()}M</p>
          <p className="text-xs text-muted-foreground mt-1">
            ブレ幅: ±{data.summary.rangeRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { MockBffClient } from "../api/MockBffClient"
import type { BffClient } from "../api/BffClient"
import type { BffDashboardData, BffDashboardQuery } from "../types"
import { DashboardSummaryCards } from "./DashboardSummaryCards"
import { DashboardFilterPanel } from "./DashboardFilterPanel"
import { KpiGroupList } from "./KpiGroupList"
import { getErrorMessage } from "../lib/error-messages"
import { Button } from "@/shared/ui/components/button"
import { RefreshCw } from "lucide-react"

const bffClient: BffClient = new MockBffClient()

export function DashboardPage() {
  const [data, setData] = useState<BffDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<BffDashboardQuery>({})

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await bffClient.getDashboardData(query)
      setData(result)
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(errorCode))
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (newQuery: BffDashboardQuery) => {
    setQuery(newQuery)
  }

  const handleRefresh = () => {
    loadData()
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={handleRefresh}>再試行</Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPI・アクションプランダッシュボード</h1>
          <p className="text-muted-foreground mt-1">最終更新: {new Date(data.lastUpdatedAt).toLocaleString("ja-JP")}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      <DashboardSummaryCards summary={data.summary} />

      <DashboardFilterPanel query={query} onChange={handleFilterChange} loading={loading} />

      <KpiGroupList kpiGroups={data.kpiGroups} bffClient={bffClient} />
    </div>
  )
}

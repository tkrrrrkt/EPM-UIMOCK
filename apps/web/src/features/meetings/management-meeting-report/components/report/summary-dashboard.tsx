'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/components/card'
import { Skeleton } from '@/shared/ui/components/skeleton'
import { Progress } from '@/shared/ui/components/progress'
import { KpiCard } from './kpi-card'
import type { BffClient } from '../../api/bff-client'
import type { KpiCardDto, SubmissionStatusSummaryDto } from '@epm/contracts/bff/meetings'

interface SummaryDashboardProps {
  client: BffClient
  eventId: string
}

export function SummaryDashboard({ client, eventId }: SummaryDashboardProps) {
  const [kpiCards, setKpiCards] = useState<KpiCardDto[]>([])
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatusSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [kpiData, statusData] = await Promise.all([
        client.getKpiCards(eventId),
        client.getSubmissionStatus(eventId),
      ])
      setKpiCards(kpiData.items)
      setSubmissionStatus(statusData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [client, eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate key metrics
  const atRiskCount = kpiCards.filter((k) => k.status === 'ERROR').length
  const warningCount = kpiCards.filter((k) => k.status === 'WARNING').length
  const onTrackCount = kpiCards.filter((k) => k.status === 'SUCCESS').length

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Submission Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              提出状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {submissionStatus?.summary.submissionRate ?? 0}%
            </div>
            <Progress
              value={submissionStatus?.summary.submissionRate ?? 0}
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {submissionStatus?.summary.submitted ?? 0} /{' '}
              {submissionStatus?.summary.total ?? 0} 部門
            </div>
          </CardContent>
        </Card>

        {/* On Track KPIs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              順調
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              {onTrackCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              達成率100%以上のKPI
            </p>
          </CardContent>
        </Card>

        {/* Warning KPIs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              注意
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning">
              {warningCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              達成率90-99%のKPI
            </p>
          </CardContent>
        </Card>

        {/* At Risk KPIs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              要注意
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              {atRiskCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              達成率90%未満のKPI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">KPIサマリー</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.subjectId} data={kpi} />
          ))}
        </div>
      </div>

      {/* Highlights / Attention Items */}
      {atRiskCount > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              要注目項目
            </CardTitle>
            <CardDescription>
              達成率が90%を下回っているKPIがあります
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {kpiCards
                .filter((k) => k.status === 'ERROR')
                .map((kpi) => (
                  <li
                    key={kpi.subjectId}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{kpi.subjectName}</p>
                      <p className="text-sm text-muted-foreground">
                        予算差異: {kpi.varianceRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono text-destructive">
                        {kpi.achievementRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">達成率</p>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

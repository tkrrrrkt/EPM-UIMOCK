'use client'

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KpiDashboardConfig } from '@epm/contracts/bff/meetings'

interface KpiDashboardPreviewProps {
  config: KpiDashboardConfig
}

// Mock KPI dashboard data for preview
const mockKpiDashboardData = [
  {
    name: '売上高',
    actual: 125000000,
    target: 120000000,
    achievement: 104.2,
    status: 'ON_TRACK' as const,
    trend: [80, 85, 90, 95, 100, 104],
  },
  {
    name: '営業利益率',
    actual: 12.0,
    target: 15.0,
    achievement: 80.0,
    status: 'AT_RISK' as const,
    trend: [15, 14, 13, 12, 12, 12],
  },
  {
    name: '顧客満足度',
    actual: 4.2,
    target: 4.5,
    achievement: 93.3,
    status: 'ON_TRACK' as const,
    trend: [4.0, 4.1, 4.1, 4.2, 4.2, 4.2],
  },
  {
    name: '従業員エンゲージメント',
    actual: 65,
    target: 80,
    achievement: 81.3,
    status: 'OFF_TRACK' as const,
    trend: [70, 68, 66, 65, 64, 65],
  },
]

export function KpiDashboardPreview({ config }: KpiDashboardPreviewProps) {
  const columns = config.columns || 2

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'AT_RISK':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'OFF_TRACK':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">順調</Badge>
      case 'AT_RISK':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">要注意</Badge>
      case 'OFF_TRACK':
        return <Badge className="bg-red-100 text-red-700 border-red-200">未達</Badge>
      default:
        return null
    }
  }

  // Filter based on config if specified
  const filteredKpis = config.filterByStatus
    ? mockKpiDashboardData.filter((kpi) => config.filterByStatus?.includes(kpi.status))
    : mockKpiDashboardData

  return (
    <div
      className={cn('grid gap-4')}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {filteredKpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(kpi.status)}
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
              </div>
              {getStatusBadge(kpi.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {kpi.actual.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                / {kpi.target.toLocaleString()}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  kpi.status === 'ON_TRACK' && 'bg-emerald-500',
                  kpi.status === 'AT_RISK' && 'bg-yellow-500',
                  kpi.status === 'OFF_TRACK' && 'bg-red-500'
                )}
                style={{ width: `${Math.min(kpi.achievement, 100)}%` }}
              />
            </div>

            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>達成率 {kpi.achievement.toFixed(1)}%</span>
            </div>

            {/* Mini trend chart */}
            {config.showChart && (
              <div className="mt-3 flex items-end gap-0.5 h-8">
                {kpi.trend.map((value, i) => {
                  const max = Math.max(...kpi.trend)
                  const min = Math.min(...kpi.trend)
                  const range = max - min || 1
                  const height = ((value - min) / range) * 100
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-t',
                        i === kpi.trend.length - 1 ? 'bg-primary' : 'bg-primary/40'
                      )}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  )
                })}
              </div>
            )}

            {/* Related actions */}
            {config.showActions && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  関連アクション: 2件
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

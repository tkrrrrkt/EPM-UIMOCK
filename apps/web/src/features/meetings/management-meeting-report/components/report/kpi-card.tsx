'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { cn } from '@/lib/utils'
import { KpiCardStatusBadge } from '../shared/status-badge'
import type { KpiCardDto } from '@epm/contracts/bff/meetings'

interface KpiCardProps {
  data: KpiCardDto
}

export function KpiCard({ data }: KpiCardProps) {
  const formatValue = (value: number) => {
    if (data.formatType === 'currency') {
      // Format as Japanese Yen (億円, 万円, etc.)
      if (value >= 100000000) {
        return `${(value / 100000000).toFixed(1)}億${data.unit || '円'}`
      }
      if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}万${data.unit || '円'}`
      }
      return `${value.toLocaleString()}${data.unit || '円'}`
    }
    if (data.formatType === 'percentage') {
      return `${value.toFixed(1)}%`
    }
    return `${value.toLocaleString()}${data.unit || ''}`
  }

  const formatRate = (rate: number) => {
    const sign = rate > 0 ? '+' : ''
    return `${sign}${rate.toFixed(1)}%`
  }

  const getTrendIcon = () => {
    if (data.varianceRate > 0) {
      return <TrendingUp className="h-4 w-4" />
    }
    if (data.varianceRate < 0) {
      return <TrendingDown className="h-4 w-4" />
    }
    return <Minus className="h-4 w-4" />
  }

  const getStatusColor = () => {
    switch (data.status) {
      case 'SUCCESS':
        return 'text-success'
      case 'WARNING':
        return 'text-warning'
      case 'ERROR':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const progressPercent = Math.min((data.actual / data.budget) * 100, 100)
  const forecastPercent = Math.min(
    ((data.actual + data.forecast) / data.budget) * 100,
    100,
  )

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {data.subjectName}
          </CardTitle>
          <KpiCardStatusBadge status={data.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Value */}
        <div>
          <div className="text-2xl font-bold font-mono">
            {formatValue(data.actual + data.forecast)}
          </div>
          <div className="text-xs text-muted-foreground">
            予算: {formatValue(data.budget)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            {/* Actual progress */}
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>実績: {formatValue(data.actual)}</span>
            <span>見込: {formatValue(data.forecast)}</span>
          </div>
        </div>

        {/* Achievement Rate & Variance */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-xs text-muted-foreground">達成率</div>
            <div className={cn('text-lg font-bold font-mono', getStatusColor())}>
              {data.achievementRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">予算差異</div>
            <div
              className={cn(
                'text-sm font-medium flex items-center gap-1 justify-end',
                data.varianceRate >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {getTrendIcon()}
              {formatRate(data.varianceRate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

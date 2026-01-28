'use client'

import { Card, CardContent } from '@/shared/ui'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KpiCardConfig } from '@epm/contracts/bff/meetings'

interface KpiCardPreviewProps {
  config: KpiCardConfig
}

// Mock KPI data for preview
const mockKpiData = [
  { name: '売上高', actual: 125000000, target: 120000000, variance: 5000000, varianceRate: 4.2, trend: 'up' as const },
  { name: '営業利益', actual: 15000000, target: 18000000, variance: -3000000, varianceRate: -16.7, trend: 'down' as const },
  { name: '経常利益', actual: 14500000, target: 14500000, variance: 0, varianceRate: 0, trend: 'flat' as const },
  { name: '売上総利益', actual: 45000000, target: 43000000, variance: 2000000, varianceRate: 4.7, trend: 'up' as const },
]

export function KpiCardPreview({ config }: KpiCardPreviewProps) {
  const columns = config.columns || 3
  const displayData = mockKpiData.slice(0, Math.min(mockKpiData.length, columns * 2))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div
      className={cn('grid gap-4')}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {displayData.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{kpi.name}</span>
              {config.showTrend && <TrendIcon trend={kpi.trend} />}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{formatCurrency(kpi.actual)}</span>
            </div>
            {config.showTarget && (
              <div className="mt-1 text-xs text-muted-foreground">
                目標: {formatCurrency(kpi.target)}
              </div>
            )}
            {config.showVariance && (
              <div
                className={cn(
                  'mt-1 text-sm font-medium',
                  kpi.variance > 0 && 'text-emerald-600',
                  kpi.variance < 0 && 'text-red-600',
                  kpi.variance === 0 && 'text-muted-foreground'
                )}
              >
                {formatPercent(kpi.varianceRate)} ({formatCurrency(kpi.variance)})
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

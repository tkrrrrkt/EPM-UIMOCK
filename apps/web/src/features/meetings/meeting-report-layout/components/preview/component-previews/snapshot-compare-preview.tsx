'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SnapshotCompareConfig } from '@epm/contracts/bff/meetings'

interface SnapshotComparePreviewProps {
  config: SnapshotCompareConfig
}

// Mock comparison data for preview
const mockComparisonData = [
  { metric: '売上高', current: 125000000, previous: 118000000, change: 7000000, changePercent: 5.9, direction: 'up' as const },
  { metric: '営業利益', current: 15000000, previous: 17000000, change: -2000000, changePercent: -11.8, direction: 'down' as const },
  { metric: '経常利益', current: 14500000, previous: 14500000, change: 0, changePercent: 0, direction: 'same' as const },
  { metric: '売上総利益率', current: 36.0, previous: 34.5, change: 1.5, changePercent: 4.3, direction: 'up' as const, isPercent: true },
]

export function SnapshotComparePreview({ config }: SnapshotComparePreviewProps) {
  const formatValue = (value: number, isPercent?: boolean) => {
    if (isPercent) {
      return `${value.toFixed(1)}%`
    }
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const formatChange = (value: number, changePercent: number, isPercent?: boolean) => {
    const sign = value >= 0 ? '+' : ''
    if (isPercent) {
      return `${sign}${value.toFixed(1)}pt (${sign}${changePercent.toFixed(1)}%)`
    }
    return `${sign}${formatValue(value)} (${sign}${changePercent.toFixed(1)}%)`
  }

  const DirectionIcon = ({ direction }: { direction: 'up' | 'down' | 'same' }) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-emerald-500" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">前回比較</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>今回: 2024年1月度</span>
            <span>前回: 2023年12月度</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockComparisonData.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <DirectionIcon direction={item.direction} />
                <span className="font-medium">{item.metric}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">前回</div>
                  <div className="font-mono">{formatValue(item.previous, item.isPercent)}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">今回</div>
                  <div className="font-mono font-medium">{formatValue(item.current, item.isPercent)}</div>
                </div>
                <div
                  className={cn(
                    'text-right font-mono text-sm min-w-[120px]',
                    item.direction === 'up' && 'text-emerald-600',
                    item.direction === 'down' && 'text-red-600',
                    item.direction === 'same' && 'text-muted-foreground'
                  )}
                >
                  {formatChange(item.change, item.changePercent, item.isPercent)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

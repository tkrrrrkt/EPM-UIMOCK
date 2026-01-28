'use client'

import { Card, CardContent } from '@/shared/ui'
import type { ChartConfig } from '@epm/contracts/bff/meetings'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'

interface ChartPreviewProps {
  config: ChartConfig
}

export function ChartPreview({ config }: ChartPreviewProps) {
  const chartType = config.chartType || 'bar'

  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <TrendingUp className="h-12 w-12 text-muted-foreground" />
      case 'waterfall':
        return <Activity className="h-12 w-12 text-muted-foreground" />
      default:
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />
    }
  }

  const getChartTypeName = () => {
    switch (chartType) {
      case 'line':
        return '折れ線グラフ'
      case 'bar':
        return '棒グラフ'
      case 'waterfall':
        return 'ウォーターフォールチャート'
      case 'pie':
        return '円グラフ'
      case 'area':
        return 'エリアチャート'
      default:
        return 'チャート'
    }
  }

  // Render a placeholder chart visualization
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Chart area placeholder */}
          <div className="flex items-center justify-center bg-muted/30 py-12">
            <div className="text-center">
              {getChartIcon()}
              <p className="mt-2 text-sm text-muted-foreground">{getChartTypeName()}</p>
            </div>
          </div>

          {/* Mock chart bars/lines */}
          <div className="p-4">
            <div className="flex items-end justify-between gap-2 h-24">
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '70%' }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '85%' }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '60%' }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '90%' }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '75%' }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: '95%' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>4月</span>
              <span>5月</span>
              <span>6月</span>
              <span>7月</span>
              <span>8月</span>
              <span>9月</span>
            </div>
          </div>

          {/* Legend */}
          {config.showLegend && config.series && (
            <div className="flex items-center gap-4 px-4 pb-4">
              {config.series.map((s, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                  />
                  <span className="text-xs text-muted-foreground">{s.name || s.dataKey}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Input, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { BarChart3, LineChart, AreaChart, PieChart, TrendingUp, Circle } from 'lucide-react'
import type { ChartConfig } from '../../types'

const chartTypeOptions = [
  { value: 'waterfall', label: 'ウォーターフォール', icon: TrendingUp },
  { value: 'bar', label: '棒グラフ', icon: BarChart3 },
  { value: 'line', label: '折れ線グラフ', icon: LineChart },
  { value: 'area', label: '面グラフ', icon: AreaChart },
  { value: 'pie', label: '円グラフ', icon: PieChart },
  { value: 'donut', label: 'ドーナツ', icon: Circle },
]

const xAxisOptions = [
  { value: 'period', label: '期間' },
  { value: 'organization', label: '組織' },
  { value: 'subject', label: '勘定科目' },
]

export function ChartConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: ChartConfig
  }>()

  const config = watch('configJson') as ChartConfig

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const isWaterfall = config.chartType === 'waterfall'

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chartType">チャートタイプ</Label>
        <Select
          value={config.chartType || 'bar'}
          onValueChange={(value) => updateConfig({ chartType: value as ChartConfig['chartType'] })}
        >
          <SelectTrigger id="chartType">
            <SelectValue placeholder="チャートタイプを選択" />
          </SelectTrigger>
          <SelectContent>
            {chartTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="xAxis">X軸</Label>
        <Select
          value={config.xAxis || 'period'}
          onValueChange={(value) => updateConfig({ xAxis: value as ChartConfig['xAxis'] })}
        >
          <SelectTrigger id="xAxis">
            <SelectValue placeholder="X軸を選択" />
          </SelectTrigger>
          <SelectContent>
            {xAxisOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>表示オプション</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showLegend"
              checked={config.showLegend ?? false}
              onCheckedChange={(checked) => updateConfig({ showLegend: checked === true })}
            />
            <Label htmlFor="showLegend" className="font-normal">
              凡例
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDataLabels"
              checked={config.showDataLabels ?? false}
              onCheckedChange={(checked) => updateConfig({ showDataLabels: checked === true })}
            />
            <Label htmlFor="showDataLabels" className="font-normal">
              データラベル
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showGrid"
              checked={config.showGrid ?? false}
              onCheckedChange={(checked) => updateConfig({ showGrid: checked === true })}
            />
            <Label htmlFor="showGrid" className="font-normal">
              グリッド線
            </Label>
          </div>
        </div>
      </div>

      {isWaterfall && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <Label className="text-sm font-medium">ウォーターフォール設定</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="startLabel" className="text-xs">
                開始ラベル
              </Label>
              <Input
                id="startLabel"
                value={config.waterfallConfig?.startLabel ?? ''}
                onChange={(e) =>
                  updateConfig({
                    waterfallConfig: {
                      ...config.waterfallConfig,
                      startLabel: e.target.value,
                    },
                  })
                }
                placeholder="予算"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endLabel" className="text-xs">
                終了ラベル
              </Label>
              <Input
                id="endLabel"
                value={config.waterfallConfig?.endLabel ?? ''}
                onChange={(e) =>
                  updateConfig({
                    waterfallConfig: {
                      ...config.waterfallConfig,
                      endLabel: e.target.value,
                    },
                  })
                }
                placeholder="実績"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Input, Checkbox, RadioGroup, RadioGroupItem } from '@/shared/ui'
import type { KpiDashboardConfig } from '../../types'

const statusOptions = [
  { value: 'ON_TRACK', label: '順調' },
  { value: 'AT_RISK', label: 'リスクあり' },
  { value: 'OFF_TRACK', label: '未達' },
]

export function KpiDashboardConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: KpiDashboardConfig
  }>()

  const config = watch('configJson') as KpiDashboardConfig

  const updateConfig = (updates: Partial<KpiDashboardConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const toggleStatus = (status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK') => {
    const current = config.filterByStatus || []
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
    updateConfig({ filterByStatus: updated as ('ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')[] })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>レイアウト</Label>
        <RadioGroup
          value={config.layout || 'grid'}
          onValueChange={(value) => updateConfig({ layout: value as 'grid' | 'list' })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="grid" id="kpi-grid" />
            <Label htmlFor="kpi-grid" className="font-normal">
              グリッド
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="list" id="kpi-list" />
            <Label htmlFor="kpi-list" className="font-normal">
              リスト
            </Label>
          </div>
        </RadioGroup>
      </div>

      {config.layout === 'grid' && (
        <div className="space-y-2">
          <Label>グリッド列数</Label>
          <RadioGroup
            value={String(config.columns || 3)}
            onValueChange={(value) => updateConfig({ columns: Number(value) as 2 | 3 | 4 })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="kpi-cols-2" />
              <Label htmlFor="kpi-cols-2" className="font-normal">
                2列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="kpi-cols-3" />
              <Label htmlFor="kpi-cols-3" className="font-normal">
                3列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="kpi-cols-4" />
              <Label htmlFor="kpi-cols-4" className="font-normal">
                4列
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label>ステータスフィルタ</Label>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`kpi-status-${option.value}`}
                checked={(config.filterByStatus || []).includes(option.value as 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')}
                onCheckedChange={() => toggleStatus(option.value as 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')}
              />
              <Label htmlFor={`kpi-status-${option.value}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>表示オプション</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showChart"
              checked={config.showChart ?? false}
              onCheckedChange={(checked) => updateConfig({ showChart: checked === true })}
            />
            <Label htmlFor="showChart" className="font-normal">
              推移グラフ
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showActions"
              checked={config.showActions ?? false}
              onCheckedChange={(checked) => updateConfig({ showActions: checked === true })}
            />
            <Label htmlFor="showActions" className="font-normal">
              アクション
            </Label>
          </div>
        </div>
      </div>

      {config.showChart && (
        <div className="space-y-1">
          <Label htmlFor="chartPeriods" className="text-xs">
            グラフ期間数
          </Label>
          <Input
            id="chartPeriods"
            type="number"
            value={config.chartPeriods ?? 6}
            onChange={(e) => updateConfig({ chartPeriods: Number(e.target.value) })}
            min={1}
            max={12}
          />
        </div>
      )}
    </div>
  )
}

'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Input, Checkbox, RadioGroup, RadioGroupItem, Badge } from '@/shared/ui'
import { X } from 'lucide-react'
import type { KpiCardConfig } from '../../types'

const mockSubjects = [
  { id: 'sub-sales', name: '売上高' },
  { id: 'sub-profit', name: '営業利益' },
  { id: 'sub-cost', name: 'コスト' },
  { id: 'sub-margin', name: '粗利率' },
  { id: 'sub-ebitda', name: 'EBITDA' },
]

export function KpiCardConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: KpiCardConfig
  }>()

  const config = watch('configJson') as KpiCardConfig

  const updateConfig = (updates: Partial<KpiCardConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const toggleSubject = (subjectId: string) => {
    const current = config.subjectIds || []
    const updated = current.includes(subjectId)
      ? current.filter((id) => id !== subjectId)
      : [...current, subjectId]
    updateConfig({ subjectIds: updated })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>表示科目</Label>
        <div className="flex flex-wrap gap-2">
          {mockSubjects.map((subject) => {
            const isSelected = (config.subjectIds || []).includes(subject.id)
            return (
              <Badge
                key={subject.id}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleSubject(subject.id)}
              >
                {subject.name}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>レイアウト</Label>
        <RadioGroup
          value={config.layout || 'grid'}
          onValueChange={(value) => updateConfig({ layout: value as 'grid' | 'list' })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="grid" id="layout-grid" />
            <Label htmlFor="layout-grid" className="font-normal">
              グリッド
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="list" id="layout-list" />
            <Label htmlFor="layout-list" className="font-normal">
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
              <RadioGroupItem value="2" id="cols-2" />
              <Label htmlFor="cols-2" className="font-normal">
                2列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="cols-3" />
              <Label htmlFor="cols-3" className="font-normal">
                3列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="cols-4" />
              <Label htmlFor="cols-4" className="font-normal">
                4列
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label>表示オプション</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showTarget"
              checked={config.showTarget ?? false}
              onCheckedChange={(checked) => updateConfig({ showTarget: checked === true })}
            />
            <Label htmlFor="showTarget" className="font-normal">
              目標値
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showVariance"
              checked={config.showVariance ?? false}
              onCheckedChange={(checked) => updateConfig({ showVariance: checked === true })}
            />
            <Label htmlFor="showVariance" className="font-normal">
              差異
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showTrend"
              checked={config.showTrend ?? false}
              onCheckedChange={(checked) => updateConfig({ showTrend: checked === true })}
            />
            <Label htmlFor="showTrend" className="font-normal">
              トレンド
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSparkline"
              checked={config.showSparkline ?? false}
              onCheckedChange={(checked) => updateConfig({ showSparkline: checked === true })}
            />
            <Label htmlFor="showSparkline" className="font-normal">
              スパークライン
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>閾値設定</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="dangerThreshold" className="text-xs">
              危険（%）
            </Label>
            <Input
              id="dangerThreshold"
              type="number"
              value={config.thresholds?.danger ?? ''}
              onChange={(e) =>
                updateConfig({
                  thresholds: {
                    ...config.thresholds,
                    danger: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="warningThreshold" className="text-xs">
              警告（%）
            </Label>
            <Input
              id="warningThreshold"
              type="number"
              value={config.thresholds?.warning ?? ''}
              onChange={(e) =>
                updateConfig({
                  thresholds: {
                    ...config.thresholds,
                    warning: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="-5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

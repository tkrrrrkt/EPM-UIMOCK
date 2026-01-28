'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { ApProgressConfig } from '../../types'

type ProgressStatus = NonNullable<ApProgressConfig['filterByStatus']>[number]

const displayModeOptions: { key: keyof Pick<ApProgressConfig, 'showGantt' | 'showKanban' | 'showProgress' | 'showMilestones'>; label: string }[] = [
  { key: 'showGantt', label: 'ガントチャート' },
  { key: 'showKanban', label: 'カンバン' },
  { key: 'showProgress', label: '進捗バー' },
  { key: 'showMilestones', label: 'マイルストーン' },
]

const groupByOptions = [
  { value: 'kpi', label: 'KPI' },
  { value: 'assignee', label: '担当者' },
  { value: 'status', label: 'ステータス' },
]

const statusOptions: { value: ProgressStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'COMPLETED', label: '完了' },
  { value: 'DELAYED', label: '遅延' },
]

export function ApProgressConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: ApProgressConfig
  }>()

  const config = watch('configJson') as ApProgressConfig

  const updateConfig = (updates: Partial<ApProgressConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const toggleStatus = (status: ProgressStatus) => {
    const current = config.filterByStatus || []
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
    updateConfig({ filterByStatus: updated })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>表示モード</Label>
        <div className="grid grid-cols-2 gap-2">
          {displayModeOptions.map((option) => (
            <div key={option.key} className="flex items-center space-x-2">
              <Checkbox
                id={`display-${option.key}`}
                checked={config[option.key] ?? false}
                onCheckedChange={(checked) =>
                  updateConfig({ [option.key]: checked === true } as Partial<ApProgressConfig>)
                }
              />
              <Label htmlFor={`display-${option.key}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>ステータスフィルタ</Label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`ap-status-${option.value}`}
                checked={(config.filterByStatus || []).includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              />
              <Label htmlFor={`ap-status-${option.value}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="groupBy">グループ化</Label>
        <Select
          value={config.groupBy || 'kpi'}
          onValueChange={(value) => updateConfig({ groupBy: value as 'kpi' | 'assignee' | 'status' })}
        >
          <SelectTrigger id="groupBy">
            <SelectValue placeholder="グループ化を選択" />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

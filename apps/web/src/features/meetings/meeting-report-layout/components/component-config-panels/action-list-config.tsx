'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { ActionListConfig } from '../../types'

type ActionStatus = NonNullable<ActionListConfig['filterStatus']>[number]
type SortBy = NonNullable<ActionListConfig['sortBy']>

const sortByOptions: { value: SortBy; label: string }[] = [
  { value: 'dueDate', label: '期限日' },
  { value: 'priority', label: '優先度' },
  { value: 'status', label: 'ステータス' },
  { value: 'createdAt', label: '作成日' },
]

const statusOptions: { value: ActionStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'COMPLETED', label: '完了' },
  { value: 'CANCELLED', label: '中止' },
]

export function ActionListConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: ActionListConfig
  }>()

  const config = watch('configJson') as ActionListConfig

  const updateConfig = (updates: Partial<ActionListConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const toggleStatus = (status: ActionStatus) => {
    const current = config.filterStatus || []
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
    updateConfig({ filterStatus: updated })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>ステータスフィルタ</Label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={(config.filterStatus || []).includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              />
              <Label htmlFor={`status-${option.value}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortBy">ソート順</Label>
        <Select
          value={config.sortBy || 'dueDate'}
          onValueChange={(value) => updateConfig({ sortBy: value as SortBy })}
        >
          <SelectTrigger id="sortBy">
            <SelectValue placeholder="ソート順を選択" />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allowStatusChange"
          checked={config.allowStatusChange ?? false}
          onCheckedChange={(checked) => updateConfig({ allowStatusChange: checked === true })}
        />
        <Label htmlFor="allowStatusChange" className="font-normal">
          ステータス変更を許可
        </Label>
      </div>
    </div>
  )
}

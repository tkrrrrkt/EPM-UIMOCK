'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { TableConfig } from '../../types'

const rowAxisOptions = [
  { value: 'organization', label: '組織' },
  { value: 'subject', label: '勘定科目' },
  { value: 'period', label: '期間' },
]

const compareModeOptions = [
  { value: 'BUDGET_VS_ACTUAL', label: '予算 vs 実績' },
  { value: 'BUDGET_VS_ACTUAL_FORECAST', label: '予算 vs 実績 vs 見込' },
  { value: 'YOY', label: '前年同期比' },
  { value: 'MOM', label: '前月比' },
]

const columnOptions = [
  { value: 'budget', label: '予算' },
  { value: 'actual', label: '実績' },
  { value: 'forecast', label: '見込' },
  { value: 'variance', label: '差異' },
  { value: 'varianceRate', label: '差異率' },
]

export function TableConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: TableConfig
  }>()

  const config = watch('configJson') as TableConfig

  const updateConfig = (updates: Partial<TableConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  const toggleColumn = (column: string) => {
    const current = config.columns || []
    const updated = current.includes(column as TableConfig['columns'][number])
      ? current.filter((c) => c !== column)
      : [...current, column as TableConfig['columns'][number]]
    updateConfig({ columns: updated })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rowAxis">行軸</Label>
        <Select
          value={config.rowAxis || 'subject'}
          onValueChange={(value) =>
            updateConfig({ rowAxis: value as 'organization' | 'subject' | 'period' })
          }
        >
          <SelectTrigger id="rowAxis">
            <SelectValue placeholder="行軸を選択" />
          </SelectTrigger>
          <SelectContent>
            {rowAxisOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="compareMode">比較モード</Label>
        <Select
          value={config.compareMode || 'BUDGET_VS_ACTUAL'}
          onValueChange={(value) => updateConfig({ compareMode: value as TableConfig['compareMode'] })}
        >
          <SelectTrigger id="compareMode">
            <SelectValue placeholder="比較モードを選択" />
          </SelectTrigger>
          <SelectContent>
            {compareModeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>表示列</Label>
        <div className="grid grid-cols-2 gap-2">
          {columnOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`col-${option.value}`}
                checked={(config.columns || []).includes(option.value as TableConfig['columns'][number])}
                onCheckedChange={() => toggleColumn(option.value)}
              />
              <Label htmlFor={`col-${option.value}`} className="font-normal">
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
              id="showTotal"
              checked={config.showTotal ?? false}
              onCheckedChange={(checked) => updateConfig({ showTotal: checked === true })}
            />
            <Label htmlFor="showTotal" className="font-normal">
              合計行
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSubtotal"
              checked={config.showSubtotal ?? false}
              onCheckedChange={(checked) => updateConfig({ showSubtotal: checked === true })}
            />
            <Label htmlFor="showSubtotal" className="font-normal">
              小計行
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="highlightVariance"
              checked={config.highlightVariance ?? false}
              onCheckedChange={(checked) => updateConfig({ highlightVariance: checked === true })}
            />
            <Label htmlFor="highlightVariance" className="font-normal">
              差異ハイライト
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

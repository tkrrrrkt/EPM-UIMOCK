'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Input, Checkbox, RadioGroup, RadioGroupItem } from '@/shared/ui'
import type { SnapshotCompareConfig } from '../../types'

export function SnapshotCompareConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: SnapshotCompareConfig
  }>()

  const config = watch('configJson') as SnapshotCompareConfig

  const updateConfig = (updates: Partial<SnapshotCompareConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>比較対象</Label>
        <RadioGroup
          value={config.compareTarget || 'previous_meeting'}
          onValueChange={(value) =>
            updateConfig({ compareTarget: value as 'previous_meeting' | 'specific_snapshot' })
          }
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="previous_meeting" id="compare-previous" />
            <Label htmlFor="compare-previous" className="font-normal">
              前回会議
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific_snapshot" id="compare-specific" />
            <Label htmlFor="compare-specific" className="font-normal">
              特定スナップショット
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>表示オプション</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="highlightChanges"
              checked={config.highlightChanges ?? false}
              onCheckedChange={(checked) => updateConfig({ highlightChanges: checked === true })}
            />
            <Label htmlFor="highlightChanges" className="font-normal">
              変更箇所をハイライト
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDirection"
              checked={config.showDirection ?? false}
              onCheckedChange={(checked) => updateConfig({ showDirection: checked === true })}
            />
            <Label htmlFor="showDirection" className="font-normal">
              増減方向を表示
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPercent"
              checked={config.showPercentage ?? false}
              onCheckedChange={(checked) => updateConfig({ showPercentage: checked === true })}
            />
            <Label htmlFor="showPercent" className="font-normal">
              変化率を表示
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>閾値設定</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="significantChange" className="text-xs">
              有意な変化（%）
            </Label>
            <Input
              id="significantChange"
              type="number"
              value={config.thresholds?.significantChange ?? ''}
              onChange={(e) =>
                updateConfig({
                  thresholds: {
                    ...config.thresholds,
                    significantChange: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="5"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="majorChange" className="text-xs">
              重大な変化（%）
            </Label>
            <Input
              id="majorChange"
              type="number"
              value={config.thresholds?.majorChange ?? ''}
              onChange={(e) =>
                updateConfig({
                  thresholds: {
                    ...config.thresholds,
                    majorChange: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

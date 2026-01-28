'use client'

import { useFormContext } from 'react-hook-form'
import { Label, Checkbox, RadioGroup, RadioGroupItem } from '@/shared/ui'
import type { SubmissionDisplayConfig } from '../../types'

export function SubmissionDisplayConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: SubmissionDisplayConfig
  }>()

  const config = watch('configJson') as SubmissionDisplayConfig

  const updateConfig = (updates: Partial<SubmissionDisplayConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>表示モード</Label>
        <RadioGroup
          value={config.displayMode || 'tree'}
          onValueChange={(value) =>
            updateConfig({ displayMode: value as 'tree' | 'flat' | 'card' })
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tree" id="display-tree" />
            <Label htmlFor="display-tree" className="font-normal">
              ツリー
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flat" id="display-flat" />
            <Label htmlFor="display-flat" className="font-normal">
              フラット
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="display-card" />
            <Label htmlFor="display-card" className="font-normal">
              カード
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>表示オプション</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showOrgHierarchy"
              checked={config.showOrganizationHierarchy ?? false}
              onCheckedChange={(checked) =>
                updateConfig({ showOrganizationHierarchy: checked === true })
              }
            />
            <Label htmlFor="showOrgHierarchy" className="font-normal">
              組織階層を表示
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSubmissionStatus"
              checked={config.showSubmissionStatus ?? false}
              onCheckedChange={(checked) => updateConfig({ showSubmissionStatus: checked === true })}
            />
            <Label htmlFor="showSubmissionStatus" className="font-normal">
              提出ステータスを表示
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="defaultExpanded"
              checked={config.expandByDefault ?? false}
              onCheckedChange={(checked) => updateConfig({ expandByDefault: checked === true })}
            />
            <Label htmlFor="defaultExpanded" className="font-normal">
              初期状態で展開
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

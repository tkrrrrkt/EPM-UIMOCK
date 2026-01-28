'use client'

import { useFormContext } from 'react-hook-form'
import { Label, RadioGroup, RadioGroupItem } from '@/shared/ui'
import type { ReportLinkConfig } from '../../types'

export function ReportLinkConfigPanel() {
  const { watch, setValue } = useFormContext<{
    configJson: ReportLinkConfig
  }>()

  const config = watch('configJson') as ReportLinkConfig

  const updateConfig = (updates: Partial<ReportLinkConfig>) => {
    setValue('configJson', { ...config, ...updates }, { shouldDirty: true })
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
            <RadioGroupItem value="grid" id="link-grid" />
            <Label htmlFor="link-grid" className="font-normal">
              グリッド
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="list" id="link-list" />
            <Label htmlFor="link-list" className="font-normal">
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
              <RadioGroupItem value="2" id="link-cols-2" />
              <Label htmlFor="link-cols-2" className="font-normal">
                2列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="link-cols-3" />
              <Label htmlFor="link-cols-3" className="font-normal">
                3列
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="link-cols-4" />
              <Label htmlFor="link-cols-4" className="font-normal">
                4列
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        リンクの追加・編集はコンポーネント設定画面から行います。
      </p>
    </div>
  )
}

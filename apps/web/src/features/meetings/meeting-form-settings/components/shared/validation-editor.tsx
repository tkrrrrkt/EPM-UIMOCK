'use client'

import type { FieldValidationDto, FormFieldType } from '../../api/bff-client'
import { Input, Label } from '@/shared/ui'

interface ValidationEditorProps {
  fieldType: FormFieldType
  validation: FieldValidationDto | null
  onChange: (validation: FieldValidationDto | null) => void
  maxLength?: number | null
  onMaxLengthChange?: (value: number | null) => void
}

export function ValidationEditor({
  fieldType,
  validation,
  onChange,
  maxLength,
  onMaxLengthChange,
}: ValidationEditorProps) {
  const handleChange = (field: keyof FieldValidationDto, value: number | string[] | undefined) => {
    const newValidation = { ...validation, [field]: value }
    // 空の値を除去
    for (const key of Object.keys(newValidation) as Array<keyof FieldValidationDto>) {
      if (newValidation[key] === undefined || newValidation[key] === null) {
        delete newValidation[key]
      }
    }
    onChange(Object.keys(newValidation).length > 0 ? newValidation : null)
  }

  // TEXT / TEXTAREA: maxLength
  if (fieldType === 'TEXT' || fieldType === 'TEXTAREA') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxLength">最大文字数</Label>
          <Input
            id="maxLength"
            type="number"
            min={1}
            value={maxLength ?? ''}
            onChange={(e) =>
              onMaxLengthChange?.(e.target.value ? Number.parseInt(e.target.value, 10) : null)
            }
            placeholder="例: 2000"
          />
        </div>
      </div>
    )
  }

  // NUMBER: min/max
  if (fieldType === 'NUMBER') {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium">数値範囲</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min" className="text-xs text-muted-foreground">
              最小値
            </Label>
            <Input
              id="min"
              type="number"
              value={validation?.min ?? ''}
              onChange={(e) =>
                handleChange('min', e.target.value ? Number.parseFloat(e.target.value) : undefined)
              }
              placeholder="例: 0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max" className="text-xs text-muted-foreground">
              最大値
            </Label>
            <Input
              id="max"
              type="number"
              value={validation?.max ?? ''}
              onChange={(e) =>
                handleChange('max', e.target.value ? Number.parseFloat(e.target.value) : undefined)
              }
              placeholder="例: 1000000"
            />
          </div>
        </div>
      </div>
    )
  }

  // FILE: allowedTypes, maxSize
  if (fieldType === 'FILE') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="allowedTypes">
            許可ファイル形式
            <span className="ml-1 text-xs text-muted-foreground">（カンマ区切り）</span>
          </Label>
          <Input
            id="allowedTypes"
            value={validation?.allowedTypes?.join(', ') ?? ''}
            onChange={(e) => {
              const types = e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
              handleChange('allowedTypes', types.length > 0 ? types : undefined)
            }}
            placeholder="例: pdf, xlsx, pptx"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSize">最大ファイルサイズ（MB）</Label>
          <Input
            id="maxSize"
            type="number"
            min={1}
            value={validation?.maxSize ? Math.round(validation.maxSize / 1048576) : ''}
            onChange={(e) =>
              handleChange(
                'maxSize',
                e.target.value ? Number.parseInt(e.target.value, 10) * 1048576 : undefined
              )
            }
            placeholder="例: 10"
          />
        </div>
      </div>
    )
  }

  return null
}

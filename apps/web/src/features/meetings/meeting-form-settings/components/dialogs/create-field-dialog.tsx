'use client'

import React from 'react'
import { useState } from 'react'
import type { FormFieldType, FieldOptionDto, FieldValidationDto } from '../../api/bff-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { OptionsEditor } from '../shared/options-editor'
import { ValidationEditor } from '../shared/validation-editor'

interface CreateFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionName: string
  onSubmit: (data: {
    fieldCode: string
    fieldName: string
    fieldType: FormFieldType
    isRequired: boolean
    placeholder?: string
    options?: FieldOptionDto[]
    validation?: FieldValidationDto
    maxLength?: number
    helpText?: string
  }) => Promise<void>
}

const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: 'TEXT', label: 'テキスト' },
  { value: 'TEXTAREA', label: '長文テキスト' },
  { value: 'NUMBER', label: '数値' },
  { value: 'SELECT', label: '単一選択' },
  { value: 'MULTI_SELECT', label: '複数選択' },
  { value: 'DATE', label: '日付' },
  { value: 'FILE', label: 'ファイル' },
  { value: 'FORECAST_QUOTE', label: '見込引用' },
]

export function CreateFieldDialog({
  open,
  onOpenChange,
  sectionName,
  onSubmit,
}: CreateFieldDialogProps) {
  const [fieldCode, setFieldCode] = useState('')
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FormFieldType>('TEXT')
  const [isRequired, setIsRequired] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const [helpText, setHelpText] = useState('')
  const [options, setOptions] = useState<FieldOptionDto[]>([{ value: '', label: '' }])
  const [validation, setValidation] = useState<FieldValidationDto | null>(null)
  const [maxLength, setMaxLength] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const showOptionsEditor = fieldType === 'SELECT' || fieldType === 'MULTI_SELECT'
  const showValidationEditor = ['TEXT', 'TEXTAREA', 'NUMBER', 'FILE'].includes(fieldType)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!fieldCode.trim()) {
      newErrors.fieldCode = '項目コードは必須です'
    } else if (!/^[A-Z0-9_]+$/.test(fieldCode)) {
      newErrors.fieldCode = '英大文字・数字・アンダースコアのみ使用できます'
    } else if (fieldCode.length > 50) {
      newErrors.fieldCode = '50文字以内で入力してください'
    }
    if (!fieldName.trim()) {
      newErrors.fieldName = '項目名は必須です'
    } else if (fieldName.length > 200) {
      newErrors.fieldName = '200文字以内で入力してください'
    }
    if (showOptionsEditor) {
      const validOptions = options.filter((o) => o.value.trim() && o.label.trim())
      if (validOptions.length === 0) {
        newErrors.options = '選択肢を1つ以上設定してください'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const validOptions = showOptionsEditor
        ? options.filter((o) => o.value.trim() && o.label.trim())
        : undefined

      await onSubmit({
        fieldCode,
        fieldName,
        fieldType,
        isRequired,
        placeholder: placeholder.trim() || undefined,
        options: validOptions,
        validation: validation || undefined,
        maxLength: maxLength ?? undefined,
        helpText: helpText.trim() || undefined,
      })
      resetForm()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFieldCode('')
    setFieldName('')
    setFieldType('TEXT')
    setIsRequired(false)
    setPlaceholder('')
    setHelpText('')
    setOptions([{ value: '', label: '' }])
    setValidation(null)
    setMaxLength(null)
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>項目の追加</DialogTitle>
          <DialogDescription>「{sectionName}」に新しい項目を追加します。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fieldCode">
                項目コード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fieldCode"
                value={fieldCode}
                onChange={(e) => setFieldCode(e.target.value.toUpperCase())}
                placeholder="例: SALES_OUTLOOK"
                className={errors.fieldCode ? 'border-destructive' : ''}
              />
              {errors.fieldCode && <p className="text-sm text-destructive">{errors.fieldCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldName">
                項目名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="例: 売上見通し"
                className={errors.fieldName ? 'border-destructive' : ''}
              />
              {errors.fieldName && <p className="text-sm text-destructive">{errors.fieldName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">
              項目タイプ <span className="text-destructive">*</span>
            </Label>
            <Select value={fieldType} onValueChange={(v) => setFieldType(v as FormFieldType)}>
              <SelectTrigger id="fieldType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked === true)}
            />
            <Label htmlFor="isRequired" className="cursor-pointer">
              必須項目
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder">プレースホルダー</Label>
            <Input
              id="placeholder"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="入力欄に表示するヒント"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpText">ヘルプテキスト</Label>
            <Textarea
              id="helpText"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="入力のガイダンス"
              rows={2}
            />
          </div>

          {showOptionsEditor && (
            <OptionsEditor options={options} onChange={setOptions} error={errors.options} />
          )}

          {showValidationEditor && (
            <ValidationEditor
              fieldType={fieldType}
              validation={validation}
              onChange={setValidation}
              maxLength={maxLength}
              onMaxLengthChange={setMaxLength}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import type {
  FormFieldDto,
  FormFieldType,
  FieldOptionDto,
  FieldValidationDto,
  UpdateFormFieldDto,
} from '../api/bff-client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { Trash2, FormInput } from 'lucide-react'
import { OptionsEditor } from './shared/options-editor'
import { ValidationEditor } from './shared/validation-editor'
import { FieldTypeBadge } from './shared/field-type-badge'

interface FieldDetailPanelProps {
  field: FormFieldDto
  onUpdate: (data: UpdateFormFieldDto) => Promise<void>
  onDelete: () => void
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

export function FieldDetailPanel({ field, onUpdate, onDelete }: FieldDetailPanelProps) {
  const [fieldName, setFieldName] = useState(field.fieldName)
  const [fieldType, setFieldType] = useState<FormFieldType>(field.fieldType)
  const [isRequired, setIsRequired] = useState(field.isRequired)
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? '')
  const [helpText, setHelpText] = useState(field.helpText ?? '')
  const [options, setOptions] = useState<FieldOptionDto[]>(
    field.options ?? [{ value: '', label: '' }]
  )
  const [validation, setValidation] = useState<FieldValidationDto | null>(field.validation ?? null)
  const [maxLength, setMaxLength] = useState<number | null>(field.maxLength ?? null)
  const [isActive, setIsActive] = useState(field.isActive)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const showOptionsEditor = fieldType === 'SELECT' || fieldType === 'MULTI_SELECT'
  const showValidationEditor = ['TEXT', 'TEXTAREA', 'NUMBER', 'FILE'].includes(fieldType)

  // Reset form when field changes
  useEffect(() => {
    setFieldName(field.fieldName)
    setFieldType(field.fieldType)
    setIsRequired(field.isRequired)
    setPlaceholder(field.placeholder ?? '')
    setHelpText(field.helpText ?? '')
    setOptions(field.options ?? [{ value: '', label: '' }])
    setValidation(field.validation ?? null)
    setMaxLength(field.maxLength ?? null)
    setIsActive(field.isActive)
    setHasChanges(false)
    setErrors({})
  }, [field])

  // Track changes
  useEffect(() => {
    const changed =
      fieldName !== field.fieldName ||
      fieldType !== field.fieldType ||
      isRequired !== field.isRequired ||
      placeholder !== (field.placeholder ?? '') ||
      helpText !== (field.helpText ?? '') ||
      JSON.stringify(options) !== JSON.stringify(field.options ?? [{ value: '', label: '' }]) ||
      JSON.stringify(validation) !== JSON.stringify(field.validation ?? null) ||
      maxLength !== (field.maxLength ?? null) ||
      isActive !== field.isActive
    setHasChanges(changed)
  }, [fieldName, fieldType, isRequired, placeholder, helpText, options, validation, maxLength, isActive, field])

  const validate = () => {
    const newErrors: Record<string, string> = {}
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

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const validOptions = showOptionsEditor
        ? options.filter((o) => o.value.trim() && o.label.trim())
        : undefined

      await onUpdate({
        fieldName,
        fieldType,
        isRequired,
        placeholder: placeholder.trim() || undefined,
        helpText: helpText.trim() || undefined,
        options: validOptions,
        validation: validation || undefined,
        maxLength: maxLength ?? undefined,
        isActive,
      })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFieldName(field.fieldName)
    setFieldType(field.fieldType)
    setIsRequired(field.isRequired)
    setPlaceholder(field.placeholder ?? '')
    setHelpText(field.helpText ?? '')
    setOptions(field.options ?? [{ value: '', label: '' }])
    setValidation(field.validation ?? null)
    setMaxLength(field.maxLength ?? null)
    setIsActive(field.isActive)
    setHasChanges(false)
    setErrors({})
  }

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FormInput className="h-5 w-5 text-primary" />
            項目設定
          </CardTitle>
          <FieldTypeBadge type={field.fieldType} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fieldCode">項目コード</Label>
          <Input id="fieldCode" value={field.fieldCode} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">項目コードは変更できません</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fieldName">
            項目名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fieldName"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className={errors.fieldName ? 'border-destructive' : ''}
          />
          {errors.fieldName && <p className="text-sm text-destructive">{errors.fieldName}</p>}
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

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="cursor-pointer">
              有効にする
            </Label>
            <p className="text-xs text-muted-foreground">
              無効にすると、この項目は表示されません
            </p>
          </div>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
            >
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import type { FormFieldDto, FormFieldType } from '../../api/bff-client'
import { Input, Button, Label, Checkbox } from '@/shared/ui'
import { Calendar, Upload, Quote, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormPreviewFieldProps {
  field: FormFieldDto
}

export function FormPreviewField({ field }: FormPreviewFieldProps) {
  const renderField = () => {
    switch (field.fieldType) {
      case 'TEXT':
        return (
          <Input
            type="text"
            placeholder={field.placeholder ?? undefined}
            defaultValue={field.defaultValue ?? undefined}
            maxLength={field.maxLength ?? undefined}
            disabled
            className="bg-muted/50"
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={field.placeholder ?? undefined}
            defaultValue={field.defaultValue ?? undefined}
            maxLength={field.maxLength ?? undefined}
            disabled
          />
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            placeholder={field.placeholder ?? undefined}
            defaultValue={field.defaultValue ?? undefined}
            min={field.validation?.min}
            max={field.validation?.max}
            disabled
            className="bg-muted/50"
          />
        )

      case 'SELECT':
        return (
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              disabled
              defaultValue=""
            >
              <option value="" disabled>
                {field.placeholder ?? '選択してください'}
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
        )

      case 'MULTI_SELECT':
        return (
          <div className="space-y-2 rounded-md border border-input bg-muted/50 p-3">
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${opt.value}`} disabled />
                <Label
                  htmlFor={`${field.id}-${opt.value}`}
                  className="text-sm font-normal text-muted-foreground"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
            {(!field.options || field.options.length === 0) && (
              <p className="text-sm text-muted-foreground">選択肢が設定されていません</p>
            )}
          </div>
        )

      case 'DATE':
        return (
          <div className="relative">
            <Input
              type="text"
              placeholder="YYYY/MM/DD"
              disabled
              className="bg-muted/50 pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        )

      case 'FILE':
        return (
          <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 p-6">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ファイルをドラッグ＆ドロップ
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              または
            </p>
            <Button variant="outline" size="sm" className="mt-2" disabled>
              ファイルを選択
            </Button>
            {field.validation?.allowedTypes && (
              <p className="mt-2 text-xs text-muted-foreground">
                対応形式: {field.validation.allowedTypes.join(', ')}
              </p>
            )}
            {field.validation?.maxSize && (
              <p className="text-xs text-muted-foreground">
                最大サイズ: {Math.round(field.validation.maxSize / 1024 / 1024)}MB
              </p>
            )}
          </div>
        )

      case 'FORECAST_QUOTE':
        return (
          <div className="rounded-md border border-input bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">見込データ引用</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between border-b border-border pb-2">
                <span>売上高</span>
                <span className="font-mono">¥ ---,---,---</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span>営業利益</span>
                <span className="font-mono">¥ ---,---,---</span>
              </div>
              <div className="flex justify-between">
                <span>経常利益</span>
                <span className="font-mono">¥ ---,---,---</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ※ 最新の見込データが自動的に引用されます
            </p>
          </div>
        )

      default:
        return (
          <div className="rounded-md border border-input bg-muted/50 p-3 text-sm text-muted-foreground">
            未対応のフィールドタイプ: {field.fieldType}
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-1">
        <Label className={cn(
          'text-sm font-medium',
          !field.isActive && 'text-muted-foreground line-through'
        )}>
          {field.fieldName}
        </Label>
        {field.isRequired && (
          <span className="text-destructive text-sm">*</span>
        )}
        {!field.isActive && (
          <span className="text-xs text-muted-foreground ml-2">(非アクティブ)</span>
        )}
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      <div className={cn(!field.isActive && 'opacity-50')}>
        {renderField()}
      </div>
    </div>
  )
}

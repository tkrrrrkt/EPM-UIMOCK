'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/ui'
import { Trash2, Save, X } from 'lucide-react'
import type { ReportLayoutDto, UpdateReportLayoutDto } from '../types'

interface LayoutDetailPanelProps {
  layout: ReportLayoutDto
  onSave: (data: UpdateReportLayoutDto) => void
  onDelete: () => void
  onCancel: () => void
  isSaving?: boolean
}

interface FormData {
  layoutCode: string
  layoutName: string
  description: string
  isDefault: boolean
  isActive: boolean
}

export function LayoutDetailPanel({
  layout,
  onSave,
  onDelete,
  onCancel,
  isSaving,
}: LayoutDetailPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      description: layout.description || '',
      isDefault: layout.isDefault,
      isActive: layout.isActive,
    },
  })

  useEffect(() => {
    reset({
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      description: layout.description || '',
      isDefault: layout.isDefault,
      isActive: layout.isActive,
    })
  }, [layout, reset])

  const onSubmit = (data: FormData) => {
    onSave({
      layoutCode: data.layoutCode,
      layoutName: data.layoutName,
      description: data.description || undefined,
      isDefault: data.isDefault,
      isActive: data.isActive,
    })
  }

  const isDefault = watch('isDefault')
  const isActive = watch('isActive')

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">レイアウト設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layoutCode">
                レイアウトコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="layoutCode"
                {...register('layoutCode', {
                  required: 'レイアウトコードは必須です',
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: '英数字とアンダースコアのみ使用できます',
                  },
                })}
                placeholder="MONTHLY_STD"
                className="font-mono"
              />
              {errors.layoutCode && (
                <p className="text-sm text-destructive">{errors.layoutCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="layoutName">
                レイアウト名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="layoutName"
                {...register('layoutName', {
                  required: 'レイアウト名は必須です',
                })}
                placeholder="月次標準レイアウト"
              />
              {errors.layoutName && (
                <p className="text-sm text-destructive">{errors.layoutName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="レイアウトの説明を入力..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) =>
                  setValue('isDefault', checked === true, { shouldDirty: true })
                }
              />
              <Label htmlFor="isDefault" className="font-normal">
                デフォルトレイアウトとして設定
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue('isActive', checked === true, { shouldDirty: true })
                }
              />
              <Label htmlFor="isActive" className="font-normal">
                有効
              </Label>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={layout.isDefault}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              <Button type="submit" size="sm" disabled={!isDirty || isSaving}>
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

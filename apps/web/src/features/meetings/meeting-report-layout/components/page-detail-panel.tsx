'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/ui'
import { Trash2, Save, X } from 'lucide-react'
import type { ReportPageDto, UpdateReportPageDto, ReportPageType } from '../types'

interface PageDetailPanelProps {
  page: ReportPageDto
  onSave: (data: UpdateReportPageDto) => void
  onDelete: () => void
  onCancel: () => void
  isSaving?: boolean
}

interface FormData {
  pageCode: string
  pageName: string
  pageType: ReportPageType
  expandDimensionId: string
  isActive: boolean
}

const pageTypeOptions: { value: ReportPageType; label: string }[] = [
  { value: 'FIXED', label: '固定ページ' },
  { value: 'PER_DEPARTMENT', label: '部門別展開' },
  { value: 'PER_BU', label: 'BU別展開' },
]

const dimensionOptions = [
  { value: 'dim-org', label: '組織軸' },
  { value: 'dim-product', label: '製品軸' },
  { value: 'dim-region', label: '地域軸' },
]

export function PageDetailPanel({
  page,
  onSave,
  onDelete,
  onCancel,
  isSaving,
}: PageDetailPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      pageCode: page.pageCode,
      pageName: page.pageName,
      pageType: page.pageType,
      expandDimensionId: page.expandDimensionId || '',
      isActive: page.isActive,
    },
  })

  useEffect(() => {
    reset({
      pageCode: page.pageCode,
      pageName: page.pageName,
      pageType: page.pageType,
      expandDimensionId: page.expandDimensionId || '',
      isActive: page.isActive,
    })
  }, [page, reset])

  const pageType = watch('pageType')
  const isActive = watch('isActive')
  const showDimension = pageType === 'PER_DEPARTMENT' || pageType === 'PER_BU'

  const onSubmit = (data: FormData) => {
    onSave({
      pageCode: data.pageCode,
      pageName: data.pageName,
      pageType: data.pageType,
      expandDimensionId: showDimension ? data.expandDimensionId : null,
      isActive: data.isActive,
    })
  }

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">ページ設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageCode">
                ページコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pageCode"
                {...register('pageCode', {
                  required: 'ページコードは必須です',
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: '英数字とアンダースコアのみ使用できます',
                  },
                })}
                placeholder="SUMMARY"
                className="font-mono"
              />
              {errors.pageCode && (
                <p className="text-sm text-destructive">{errors.pageCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageName">
                ページ名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pageName"
                {...register('pageName', {
                  required: 'ページ名は必須です',
                })}
                placeholder="エグゼクティブサマリー"
              />
              {errors.pageName && (
                <p className="text-sm text-destructive">{errors.pageName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageType">
                ページタイプ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={pageType}
                onValueChange={(value) =>
                  setValue('pageType', value as ReportPageType, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="pageType">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {pageTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showDimension && (
              <div className="space-y-2">
                <Label htmlFor="expandDimensionId">展開軸</Label>
                <Select
                  value={watch('expandDimensionId')}
                  onValueChange={(value) => setValue('expandDimensionId', value, { shouldDirty: true })}
                >
                  <SelectTrigger id="expandDimensionId">
                    <SelectValue placeholder="展開軸を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
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
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
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

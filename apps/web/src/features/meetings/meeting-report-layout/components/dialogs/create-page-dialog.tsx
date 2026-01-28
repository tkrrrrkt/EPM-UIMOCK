'use client'

import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'
import type { CreateReportPageDto, ReportPageType } from '../../types'

interface CreatePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateReportPageDto) => void
  layoutId: string
  isLoading?: boolean
}

interface FormData {
  pageCode: string
  pageName: string
  pageType: ReportPageType
  expandDimensionId: string
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

export function CreatePageDialog({ open, onOpenChange, onSubmit, layoutId, isLoading }: CreatePageDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      pageCode: '',
      pageName: '',
      pageType: 'FIXED',
      expandDimensionId: '',
    },
  })

  const pageType = watch('pageType')
  const showDimension = pageType === 'PER_DEPARTMENT' || pageType === 'PER_BU'

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      layoutId,
      pageCode: data.pageCode,
      pageName: data.pageName,
      pageType: data.pageType,
      expandDimensionId: showDimension ? data.expandDimensionId : undefined,
    })
    reset()
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ページ追加</DialogTitle>
          <DialogDescription>レイアウトに新しいページを追加します。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-pageCode">
              ページコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-pageCode"
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
            {errors.pageCode && <p className="text-sm text-destructive">{errors.pageCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-pageName">
              ページ名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-pageName"
              {...register('pageName', {
                required: 'ページ名は必須です',
              })}
              placeholder="エグゼクティブサマリー"
            />
            {errors.pageName && <p className="text-sm text-destructive">{errors.pageName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-pageType">
              ページタイプ <span className="text-destructive">*</span>
            </Label>
            <Select value={pageType} onValueChange={(value) => setValue('pageType', value as ReportPageType)}>
              <SelectTrigger id="create-pageType">
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
              <Label htmlFor="create-expandDimensionId">展開軸</Label>
              <Select value={watch('expandDimensionId')} onValueChange={(value) => setValue('expandDimensionId', value)}>
                <SelectTrigger id="create-expandDimensionId">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

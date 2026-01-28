'use client'

import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'
import type { CreateReportLayoutDto } from '../../types'

interface CreateLayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateReportLayoutDto) => void
  meetingTypeId: string
  isLoading?: boolean
}

interface FormData {
  layoutCode: string
  layoutName: string
  description: string
  isDefault: boolean
}

export function CreateLayoutDialog({
  open,
  onOpenChange,
  onSubmit,
  meetingTypeId,
  isLoading,
}: CreateLayoutDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      layoutCode: '',
      layoutName: '',
      description: '',
      isDefault: false,
    },
  })

  const isDefault = watch('isDefault')

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      meetingTypeId,
      layoutCode: data.layoutCode,
      layoutName: data.layoutName,
      description: data.description || undefined,
      isDefault: data.isDefault,
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
          <DialogTitle>レイアウト追加</DialogTitle>
          <DialogDescription>新しいレポートレイアウトを作成します。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-layoutCode">
              レイアウトコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-layoutCode"
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
            {errors.layoutCode && <p className="text-sm text-destructive">{errors.layoutCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-layoutName">
              レイアウト名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-layoutName"
              {...register('layoutName', {
                required: 'レイアウト名は必須です',
              })}
              placeholder="月次標準レイアウト"
            />
            {errors.layoutName && <p className="text-sm text-destructive">{errors.layoutName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">説明</Label>
            <Textarea id="create-description" {...register('description')} placeholder="レイアウトの説明を入力..." rows={2} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setValue('isDefault', checked === true)}
            />
            <Label htmlFor="create-isDefault" className="font-normal">
              デフォルトレイアウトとして設定
            </Label>
          </div>

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

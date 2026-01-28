'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'
import { Check, FileText, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LayoutTemplateDto, CreateLayoutFromTemplateDto } from '../../types'

interface TemplateSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateLayoutFromTemplateDto) => void
  templates: LayoutTemplateDto[] | undefined
  meetingTypeId: string
  isLoading?: boolean
}

interface FormData {
  layoutCode: string
  layoutName: string
}

export function TemplateSelectDialog({
  open,
  onOpenChange,
  onSubmit,
  templates,
  meetingTypeId,
  isLoading,
}: TemplateSelectDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplateDto | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      layoutCode: '',
      layoutName: '',
    },
  })

  const handleFormSubmit = (data: FormData) => {
    if (!selectedTemplate) return

    onSubmit({
      meetingTypeId,
      templateId: selectedTemplate.id,
      layoutCode: data.layoutCode,
      layoutName: data.layoutName,
    })
    reset()
    setSelectedTemplate(null)
  }

  const handleClose = () => {
    reset()
    setSelectedTemplate(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>テンプレートからレイアウト作成</DialogTitle>
          <DialogDescription>テンプレートを選択して、新しいレイアウトを作成します。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            {templates?.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-colors hover:border-primary/50',
                  selectedTemplate?.id === template.id && 'border-primary bg-primary/5'
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{template.templateName}</CardTitle>
                      {selectedTemplate?.id === template.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {template.pageCount} ページ
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Layers className="mr-1 h-3 w-3" />
                        {template.componentCount} コンポーネント
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardContent>
              </Card>
            ))}

            {(!templates || templates.length === 0) && (
              <p className="py-8 text-center text-sm text-muted-foreground">利用可能なテンプレートがありません</p>
            )}
          </div>

          {selectedTemplate && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="template-layoutCode">
                  レイアウトコード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-layoutCode"
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
                <Label htmlFor="template-layoutName">
                  レイアウト名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-layoutName"
                  {...register('layoutName', {
                    required: 'レイアウト名は必須です',
                  })}
                  placeholder="月次標準レイアウト"
                />
                {errors.layoutName && <p className="text-sm text-destructive">{errors.layoutName.message}</p>}
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
          )}

          {!selectedTemplate && (
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

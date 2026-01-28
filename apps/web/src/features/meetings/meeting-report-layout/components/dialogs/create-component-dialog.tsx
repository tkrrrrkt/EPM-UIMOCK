'use client'

import React from 'react'
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
  RadioGroup,
  RadioGroupItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'
import { BarChart3, Table2, LayoutGrid, Link, ListChecks, GitCompare, Gauge, Target, FileInput } from 'lucide-react'
import type { CreateReportComponentDto, ReportComponentType, ReportDataSource, ComponentWidth } from '../../types'

interface CreateComponentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateReportComponentDto) => void
  pageId: string
  isLoading?: boolean
}

interface FormData {
  componentCode: string
  componentName: string
  componentType: ReportComponentType
  dataSource: ReportDataSource
  width: ComponentWidth
}

const componentTypeOptions: {
  value: ReportComponentType
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    value: 'KPI_CARD',
    label: 'KPIカード',
    description: '主要指標のカード表示',
    icon: LayoutGrid,
  },
  {
    value: 'TABLE',
    label: '表',
    description: '予実対比等のテーブル',
    icon: Table2,
  },
  {
    value: 'CHART',
    label: 'グラフ',
    description: '各種チャート',
    icon: BarChart3,
  },
  {
    value: 'SUBMISSION_DISPLAY',
    label: '報告表示',
    description: '提出データの表示',
    icon: FileInput,
  },
  {
    value: 'REPORT_LINK',
    label: 'リンク集',
    description: 'レポートへのリンク',
    icon: Link,
  },
  {
    value: 'ACTION_LIST',
    label: 'アクション一覧',
    description: 'アクションアイテム',
    icon: ListChecks,
  },
  {
    value: 'SNAPSHOT_COMPARE',
    label: 'スナップショット比較',
    description: '前回比較',
    icon: GitCompare,
  },
  {
    value: 'KPI_DASHBOARD',
    label: 'KPIダッシュボード',
    description: 'KPI一覧表示',
    icon: Gauge,
  },
  {
    value: 'AP_PROGRESS',
    label: 'AP進捗',
    description: 'アクションプラン進捗',
    icon: Target,
  },
]

const dataSourceOptions: { value: ReportDataSource; label: string }[] = [
  { value: 'FACT', label: '実績データ' },
  { value: 'KPI', label: 'KPIデータ' },
  { value: 'SUBMISSION', label: '提出データ' },
  { value: 'SNAPSHOT', label: 'スナップショット' },
  { value: 'EXTERNAL', label: '外部データ' },
]

export function CreateComponentDialog({ open, onOpenChange, onSubmit, pageId, isLoading }: CreateComponentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      componentCode: '',
      componentName: '',
      componentType: 'KPI_CARD',
      dataSource: 'FACT',
      width: 'FULL',
    },
  })

  const componentType = watch('componentType')
  const width = watch('width')

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      pageId,
      componentCode: data.componentCode,
      componentName: data.componentName,
      componentType: data.componentType,
      dataSource: data.dataSource,
      width: data.width,
    })
    reset()
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>コンポーネント追加</DialogTitle>
          <DialogDescription>ページに新しいコンポーネントを追加します。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-componentCode">
              コンポーネントコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-componentCode"
              {...register('componentCode', {
                required: 'コンポーネントコードは必須です',
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: '英数字とアンダースコアのみ使用できます',
                },
              })}
              placeholder="KPI_CARDS"
              className="font-mono"
            />
            {errors.componentCode && <p className="text-sm text-destructive">{errors.componentCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-componentName">
              コンポーネント名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-componentName"
              {...register('componentName', {
                required: 'コンポーネント名は必須です',
              })}
              placeholder="主要KPIカード"
            />
            {errors.componentName && <p className="text-sm text-destructive">{errors.componentName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-componentType">
              コンポーネントタイプ <span className="text-destructive">*</span>
            </Label>
            <Select
              value={componentType}
              onValueChange={(value) => setValue('componentType', value as ReportComponentType)}
            >
              <SelectTrigger id="create-componentType">
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {componentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-dataSource">
              データソース <span className="text-destructive">*</span>
            </Label>
            <Select value={watch('dataSource')} onValueChange={(value) => setValue('dataSource', value as ReportDataSource)}>
              <SelectTrigger id="create-dataSource">
                <SelectValue placeholder="データソースを選択" />
              </SelectTrigger>
              <SelectContent>
                {dataSourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              幅 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={width} onValueChange={(value) => setValue('width', value as ComponentWidth)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FULL" id="create-width-full" />
                <Label htmlFor="create-width-full" className="font-normal">
                  FULL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HALF" id="create-width-half" />
                <Label htmlFor="create-width-half" className="font-normal">
                  HALF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="THIRD" id="create-width-third" />
                <Label htmlFor="create-width-third" className="font-normal">
                  THIRD
                </Label>
              </div>
            </RadioGroup>
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

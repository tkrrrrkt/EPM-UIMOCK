'use client'

import { useForm, FormProvider } from 'react-hook-form'
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
  RadioGroup,
  RadioGroupItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/ui'
import { Trash2, Save, X } from 'lucide-react'
import { KpiCardConfigPanel } from './component-config-panels/kpi-card-config'
import { TableConfigPanel } from './component-config-panels/table-config'
import { ChartConfigPanel } from './component-config-panels/chart-config'
import { SubmissionDisplayConfigPanel } from './component-config-panels/submission-display-config'
import { ReportLinkConfigPanel } from './component-config-panels/report-link-config'
import { ActionListConfigPanel } from './component-config-panels/action-list-config'
import { SnapshotCompareConfigPanel } from './component-config-panels/snapshot-compare-config'
import { KpiDashboardConfigPanel } from './component-config-panels/kpi-dashboard-config'
import { ApProgressConfigPanel } from './component-config-panels/ap-progress-config'
import type {
  ReportComponentDto,
  UpdateReportComponentDto,
  ReportComponentType,
  ReportDataSource,
  ComponentWidth,
  ComponentHeight,
  ComponentConfig,
} from '../types'

interface ComponentDetailPanelProps {
  component: ReportComponentDto
  onSave: (data: UpdateReportComponentDto) => void
  onDelete: () => void
  onCancel: () => void
  isSaving?: boolean
}

interface FormData {
  componentCode: string
  componentName: string
  componentType: ReportComponentType
  dataSource: ReportDataSource
  width: ComponentWidth
  height: ComponentHeight
  isActive: boolean
  configJson: ComponentConfig
}

const componentTypeOptions: {
  value: ReportComponentType
  label: string
  description: string
}[] = [
  { value: 'KPI_CARD', label: 'KPIカード', description: '主要指標のカード表示' },
  { value: 'TABLE', label: '表', description: '予実対比等のテーブル' },
  { value: 'CHART', label: 'グラフ', description: '各種チャート' },
  { value: 'SUBMISSION_DISPLAY', label: '報告表示', description: '提出データの表示' },
  { value: 'REPORT_LINK', label: 'リンク集', description: 'レポートへのリンク' },
  { value: 'ACTION_LIST', label: 'アクション一覧', description: 'アクションアイテム' },
  { value: 'SNAPSHOT_COMPARE', label: 'スナップショット比較', description: '前回比較' },
  { value: 'KPI_DASHBOARD', label: 'KPIダッシュボード', description: 'KPI一覧表示' },
  { value: 'AP_PROGRESS', label: 'AP進捗', description: 'アクションプラン進捗' },
]

const dataSourceOptions: { value: ReportDataSource; label: string }[] = [
  { value: 'FACT', label: '実績データ' },
  { value: 'KPI', label: 'KPIデータ' },
  { value: 'SUBMISSION', label: '提出データ' },
  { value: 'SNAPSHOT', label: 'スナップショット' },
  { value: 'EXTERNAL', label: '外部データ' },
]

const heightOptions: { value: ComponentHeight; label: string }[] = [
  { value: 'AUTO', label: '自動' },
  { value: 'SMALL', label: '小' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LARGE', label: '大' },
]

export function ComponentDetailPanel({
  component,
  onSave,
  onDelete,
  onCancel,
  isSaving,
}: ComponentDetailPanelProps) {
  const methods = useForm<FormData>({
    defaultValues: {
      componentCode: component.componentCode,
      componentName: component.componentName,
      componentType: component.componentType,
      dataSource: component.dataSource,
      width: component.width,
      height: component.height || 'AUTO',
      isActive: component.isActive,
      configJson: component.configJson,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods

  useEffect(() => {
    reset({
      componentCode: component.componentCode,
      componentName: component.componentName,
      componentType: component.componentType,
      dataSource: component.dataSource,
      width: component.width,
      height: component.height || 'AUTO',
      isActive: component.isActive,
      configJson: component.configJson,
    })
  }, [component, reset])

  const componentType = watch('componentType')
  const width = watch('width')
  const isActive = watch('isActive')

  const onSubmit = (data: FormData) => {
    onSave({
      componentCode: data.componentCode,
      componentName: data.componentName,
      componentType: data.componentType,
      dataSource: data.dataSource,
      width: data.width,
      height: data.height === 'AUTO' ? undefined : data.height,
      isActive: data.isActive,
      configJson: data.configJson,
    })
  }

  const renderConfigPanel = () => {
    switch (componentType) {
      case 'KPI_CARD':
        return <KpiCardConfigPanel />
      case 'TABLE':
        return <TableConfigPanel />
      case 'CHART':
        return <ChartConfigPanel />
      case 'SUBMISSION_DISPLAY':
        return <SubmissionDisplayConfigPanel />
      case 'REPORT_LINK':
        return <ReportLinkConfigPanel />
      case 'ACTION_LIST':
        return <ActionListConfigPanel />
      case 'SNAPSHOT_COMPARE':
        return <SnapshotCompareConfigPanel />
      case 'KPI_DASHBOARD':
        return <KpiDashboardConfigPanel />
      case 'AP_PROGRESS':
        return <ApProgressConfigPanel />
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">コンポーネント設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="componentCode">
                  コンポーネントコード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="componentCode"
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
                {errors.componentCode && (
                  <p className="text-sm text-destructive">{errors.componentCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="componentName">
                  コンポーネント名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="componentName"
                  {...register('componentName', {
                    required: 'コンポーネント名は必須です',
                  })}
                  placeholder="主要KPIカード"
                />
                {errors.componentName && (
                  <p className="text-sm text-destructive">{errors.componentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="componentType">
                  コンポーネントタイプ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={componentType}
                  onValueChange={(value) =>
                    setValue('componentType', value as ReportComponentType, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="componentType">
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataSource">
                  データソース <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('dataSource')}
                  onValueChange={(value) =>
                    setValue('dataSource', value as ReportDataSource, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="dataSource">
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
                <RadioGroup
                  value={width}
                  onValueChange={(value) =>
                    setValue('width', value as ComponentWidth, {
                      shouldDirty: true,
                    })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FULL" id="width-full" />
                    <Label htmlFor="width-full" className="font-normal">
                      FULL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HALF" id="width-half" />
                    <Label htmlFor="width-half" className="font-normal">
                      HALF
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="THIRD" id="width-third" />
                    <Label htmlFor="width-third" className="font-normal">
                      THIRD
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">高さ</Label>
                <Select
                  value={watch('height')}
                  onValueChange={(value) =>
                    setValue('height', value as ComponentHeight, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="height">
                    <SelectValue placeholder="高さを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Component-specific config panel */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                {componentTypeOptions.find((o) => o.value === componentType)?.label || ''}
                固有設定
              </h4>
              {renderConfigPanel()}
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
    </FormProvider>
  )
}

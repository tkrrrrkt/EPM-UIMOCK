'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Input } from '@/shared/ui/components/input'
import { Label } from '@/shared/ui/components/label'
import { Textarea } from '@/shared/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/components/card'
import { cn } from '@/lib/utils'
import type { BffClient } from '../../api/bff-client'
import type { CreateMeetingEventDto } from '@epm/contracts/bff/meetings'

interface EventCreateWizardProps {
  client: BffClient
}

const MEETING_TYPES = [
  { id: 'mt-001', code: 'MONTHLY_MGMT', name: '月次経営会議' },
  { id: 'mt-002', code: 'QUARTERLY_MGMT', name: '四半期経営会議' },
  { id: 'mt-003', code: 'BOARD_MEETING', name: '取締役会' },
]

const FISCAL_YEARS = [2026, 2025, 2024]

const PERIODS = [
  { id: 'p-202601', name: '2026年1月度' },
  { id: 'p-202602', name: '2026年2月度' },
  { id: 'p-202603', name: '2026年3月度' },
  { id: 'p-202604', name: '2026年4月度' },
  { id: 'p-202605', name: '2026年5月度' },
  { id: 'p-202606', name: '2026年6月度' },
  { id: 'p-202607', name: '2026年7月度' },
  { id: 'p-202608', name: '2026年8月度' },
  { id: 'p-202609', name: '2026年9月度' },
  { id: 'p-202610', name: '2026年10月度' },
  { id: 'p-202611', name: '2026年11月度' },
  { id: 'p-202612', name: '2026年12月度' },
  { id: 'p-2026Q1', name: '2026年度Q1' },
  { id: 'p-2026Q2', name: '2026年度Q2' },
  { id: 'p-2026Q3', name: '2026年度Q3' },
  { id: 'p-2026Q4', name: '2026年度Q4' },
]

const STEPS = [
  { id: 1, name: '基本情報', description: '会議種別と名称を設定' },
  { id: 2, name: 'スケジュール', description: '日程と期限を設定' },
  { id: 3, name: '確認', description: '入力内容を確認' },
]

interface FormData {
  meetingTypeId: string
  eventName: string
  targetFiscalYear: number
  targetPeriodId: string
  submissionDeadline: string
  distributionDate: string
  meetingDate: string
  notes: string
}

export function EventCreateWizard({ client }: EventCreateWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    meetingTypeId: '',
    eventName: '',
    targetFiscalYear: 2026,
    targetPeriodId: '',
    submissionDeadline: '',
    distributionDate: '',
    meetingDate: '',
    notes: '',
  })

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceedStep1 = formData.meetingTypeId && formData.eventName && formData.targetFiscalYear
  const canProceedStep2 = formData.submissionDeadline && formData.meetingDate

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleCancel = () => {
    router.push('/meetings/management-meeting-report')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const createData: CreateMeetingEventDto = {
        meetingTypeId: formData.meetingTypeId,
        eventName: formData.eventName,
        targetFiscalYear: formData.targetFiscalYear,
        targetPeriodId: formData.targetPeriodId || undefined,
        submissionDeadline: formData.submissionDeadline
          ? new Date(formData.submissionDeadline).toISOString()
          : undefined,
        distributionDate: formData.distributionDate
          ? new Date(formData.distributionDate).toISOString()
          : undefined,
        meetingDate: formData.meetingDate
          ? new Date(formData.meetingDate).toISOString()
          : undefined,
        notes: formData.notes || undefined,
      }

      await client.createEvent(createData)
      router.push('/meetings/management-meeting-report')
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMeetingTypeName = (id: string) => {
    return MEETING_TYPES.find((t) => t.id === id)?.name || '-'
  }

  const getPeriodName = (id: string) => {
    return PERIODS.find((p) => p.id === id)?.name || '-'
  }

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">新規会議イベント作成</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ウィザード形式で会議イベントを作成します
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center gap-8">
            {STEPS.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                      step.id < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id === currentStep
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        step.id === currentStep
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'ml-8 h-0.5 w-16',
                      step.id < currentStep ? 'bg-primary' : 'bg-muted',
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  会議の種別と基本的な情報を入力してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meeting Type */}
                <div className="space-y-2">
                  <Label htmlFor="meetingType">
                    会議種別 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.meetingTypeId}
                    onValueChange={(v) => updateFormData('meetingTypeId', v)}
                  >
                    <SelectTrigger id="meetingType">
                      <SelectValue placeholder="会議種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="eventName">
                    イベント名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventName"
                    placeholder="例: 6月度経営会議"
                    value={formData.eventName}
                    onChange={(e) => updateFormData('eventName', e.target.value)}
                  />
                </div>

                {/* Fiscal Year */}
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">
                    対象年度 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(formData.targetFiscalYear)}
                    onValueChange={(v) => updateFormData('targetFiscalYear', Number(v))}
                  >
                    <SelectTrigger id="fiscalYear">
                      <SelectValue placeholder="年度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {FISCAL_YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}年度
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Period */}
                <div className="space-y-2">
                  <Label htmlFor="targetPeriod">対象期間</Label>
                  <Select
                    value={formData.targetPeriodId || 'none'}
                    onValueChange={(v) => updateFormData('targetPeriodId', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger id="targetPeriod">
                      <SelectValue placeholder="対象期間を選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      {PERIODS.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>スケジュール</CardTitle>
                <CardDescription>
                  報告の提出期限と会議日程を設定してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submission Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="submissionDeadline">
                    提出期限 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="submissionDeadline"
                    type="datetime-local"
                    value={formData.submissionDeadline}
                    onChange={(e) =>
                      updateFormData('submissionDeadline', e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    部門からの報告提出の締め切り日時
                  </p>
                </div>

                {/* Distribution Date */}
                <div className="space-y-2">
                  <Label htmlFor="distributionDate">資料配信日</Label>
                  <Input
                    id="distributionDate"
                    type="datetime-local"
                    value={formData.distributionDate}
                    onChange={(e) =>
                      updateFormData('distributionDate', e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    会議参加者への資料配信予定日時
                  </p>
                </div>

                {/* Meeting Date */}
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">
                    会議日 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="meetingDate"
                    type="datetime-local"
                    value={formData.meetingDate}
                    onChange={(e) => updateFormData('meetingDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    経営会議の開催日時
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    placeholder="特記事項があれば入力してください"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>入力内容の確認</CardTitle>
                <CardDescription>
                  以下の内容で会議イベントを作成します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">会議種別</dt>
                    <dd className="font-medium">
                      {getMeetingTypeName(formData.meetingTypeId)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">イベント名</dt>
                    <dd className="font-medium">{formData.eventName}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">対象年度</dt>
                    <dd className="font-medium">{formData.targetFiscalYear}年度</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">対象期間</dt>
                    <dd className="font-medium">
                      {formData.targetPeriodId
                        ? getPeriodName(formData.targetPeriodId)
                        : '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">提出期限</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(formData.submissionDeadline)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">資料配信日</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(formData.distributionDate)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">会議日</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(formData.meetingDate)}
                    </dd>
                  </div>
                  {formData.notes && (
                    <div className="py-2">
                      <dt className="text-muted-foreground mb-1">備考</dt>
                      <dd className="text-sm bg-muted/50 p-3 rounded-md">
                        {formData.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t bg-background">
        <div className="flex justify-between max-w-2xl mx-auto">
          <Button variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>

          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
              >
                次へ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    作成
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

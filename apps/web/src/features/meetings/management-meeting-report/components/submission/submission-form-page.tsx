'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
} from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Input } from '@/shared/ui/components/input'
import { Label } from '@/shared/ui/components/label'
import { Textarea } from '@/shared/ui/components/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/components/card'
import { Skeleton } from '@/shared/ui/components/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog'
import { MeetingEventStatusBadge, SubmissionStatusBadge } from '../shared/status-badge'
import type { BffClient } from '../../api/bff-client'
import type {
  MeetingEventDto,
  MeetingSubmissionDto,
  MeetingSubmissionValueDto,
  SaveSubmissionValueDto,
} from '@epm/contracts/bff/meetings'

interface SubmissionFormPageProps {
  client: BffClient
  eventId: string
  departmentStableId: string
}

interface FormValues {
  [fieldId: string]: string | number | undefined
}

export function SubmissionFormPage({
  client,
  eventId,
  departmentStableId,
}: SubmissionFormPageProps) {
  const router = useRouter()

  // Data state
  const [event, setEvent] = useState<MeetingEventDto | null>(null)
  const [submission, setSubmission] = useState<MeetingSubmissionDto | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formValues, setFormValues] = useState<FormValues>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [eventData, submissionData] = await Promise.all([
        client.getEventById(eventId),
        client.getSubmission(eventId, departmentStableId),
      ])
      setEvent(eventData)
      setSubmission(submissionData)

      // Initialize form values
      const initialValues: FormValues = {}
      submissionData.values.forEach((v) => {
        if (v.valueText !== undefined) initialValues[v.fieldId] = v.valueText
        else if (v.valueNumber !== undefined) initialValues[v.fieldId] = v.valueNumber
      })
      setFormValues(initialValues)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [client, eventId, departmentStableId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Group fields by section
  const groupedFields = submission?.values.reduce(
    (acc, field) => {
      const sectionKey = field.sectionCode || 'OTHER'
      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          sectionName: field.sectionName || 'その他',
          fields: [],
        }
      }
      acc[sectionKey].fields.push(field)
      return acc
    },
    {} as Record<string, { sectionName: string; fields: MeetingSubmissionValueDto[] }>,
  ) || {}

  // Handlers
  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }))
    setIsDirty(true)
  }

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveDialog(true)
    } else {
      router.back()
    }
  }

  const handleSaveDraft = async () => {
    if (!submission) return

    setIsSaving(true)
    try {
      const values: SaveSubmissionValueDto[] = Object.entries(formValues).map(
        ([fieldId, value]) => ({
          fieldId,
          valueText: typeof value === 'string' ? value : undefined,
          valueNumber: typeof value === 'number' ? value : undefined,
        }),
      )

      await client.saveSubmission({
        meetingEventId: eventId,
        submissionLevel: submission.submissionLevel,
        departmentStableId: departmentStableId,
        values,
      })

      setIsDirty(false)
      // Show success toast or notification
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmitConfirm = async () => {
    if (!submission) return

    setIsSubmitting(true)
    try {
      // First save the draft
      const values: SaveSubmissionValueDto[] = Object.entries(formValues).map(
        ([fieldId, value]) => ({
          fieldId,
          valueText: typeof value === 'string' ? value : undefined,
          valueNumber: typeof value === 'number' ? value : undefined,
        }),
      )

      const savedSubmission = await client.saveSubmission({
        meetingEventId: eventId,
        submissionLevel: submission.submissionLevel,
        departmentStableId: departmentStableId,
        values,
      })

      // Then submit
      await client.submitSubmission(savedSubmission.id)

      router.push(`/meetings/management-meeting-report/${eventId}`)
    } catch (error) {
      console.error('Failed to submit:', error)
    } finally {
      setIsSubmitting(false)
      setShowSubmitDialog(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Check if required fields are filled
  const requiredFieldsFilled = submission?.values
    .filter((f) => f.isRequired)
    .every((f) => {
      const value = formValues[f.fieldId]
      return value !== undefined && value !== ''
    }) ?? false

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b bg-background">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!event || !submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">データの取得に失敗しました</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">報告登録</h1>
              <SubmissionStatusBadge status={submission.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {event.eventName}への報告を入力してください
            </p>
          </div>
        </div>
      </div>

      {/* Context Bar */}
      <div className="px-6 py-3 bg-muted/30 border-b">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">会議:</span>
            <span className="font-medium">{event.eventName}</span>
            <MeetingEventStatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">部門:</span>
            <span className="font-medium">{submission.departmentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">提出期限:</span>
            <span className="font-medium text-warning">
              {formatDate(event.submissionDeadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {Object.entries(groupedFields).map(([sectionCode, section]) => (
            <Card key={sectionCode}>
              <CardHeader>
                <CardTitle>{section.sectionName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.fieldId} className="space-y-2">
                    <Label htmlFor={field.fieldId}>
                      {field.fieldName}
                      {field.isRequired && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>

                    {field.fieldType === 'TEXT' && (
                      <Input
                        id={field.fieldId}
                        value={(formValues[field.fieldId] as string) || ''}
                        onChange={(e) =>
                          handleFieldChange(field.fieldId, e.target.value)
                        }
                        placeholder={`${field.fieldName}を入力`}
                      />
                    )}

                    {field.fieldType === 'TEXTAREA' && (
                      <Textarea
                        id={field.fieldId}
                        value={(formValues[field.fieldId] as string) || ''}
                        onChange={(e) =>
                          handleFieldChange(field.fieldId, e.target.value)
                        }
                        placeholder={`${field.fieldName}を入力`}
                        rows={5}
                        className="resize-y"
                      />
                    )}

                    {field.fieldType === 'NUMBER' && (
                      <Input
                        id={field.fieldId}
                        type="number"
                        value={(formValues[field.fieldId] as number) || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            field.fieldId,
                            e.target.value ? Number(e.target.value) : '',
                          )
                        }
                        placeholder={`${field.fieldName}を入力`}
                      />
                    )}

                    {field.fieldType === 'DATE' && (
                      <Input
                        id={field.fieldId}
                        type="date"
                        value={(formValues[field.fieldId] as string) || ''}
                        onChange={(e) =>
                          handleFieldChange(field.fieldId, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t bg-background">
        <div className="flex justify-end gap-4 max-w-3xl mx-auto">
          <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                下書き保存
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmitClick}
            disabled={!requiredFieldsFilled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                提出中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                提出
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>報告を提出しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              提出後は内容を編集できなくなります。よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitConfirm}>
              提出する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>変更を破棄しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              保存されていない変更があります。このまま離れると変更内容が失われます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>編集を続ける</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>
              変更を破棄
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

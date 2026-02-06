'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@/shared/ui'
import { ReminderDialog } from './ReminderDialog'
import { bffClient } from '../api'
import type {
  UnifiedEventType,
  BffSubmissionListResponse,
  BffDepartmentSubmission,
  SubmissionStatus,
} from '@epm/contracts/bff/unified-events'
import {
  AlertCircle,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Mail,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubmissionStatusTabProps {
  eventType: UnifiedEventType
  eventId: string
}

// Status config
const STATUS_CONFIG: Record<SubmissionStatus, { label: string; icon: React.ReactNode; className: string }> = {
  NOT_STARTED: {
    label: '未着手',
    icon: <Circle className="h-4 w-4" />,
    className: 'text-gray-500 bg-gray-100',
  },
  IN_PROGRESS: {
    label: '入力中',
    icon: <Edit className="h-4 w-4" />,
    className: 'text-yellow-600 bg-yellow-100',
  },
  SUBMITTED: {
    label: '提出済',
    icon: <Send className="h-4 w-4" />,
    className: 'text-blue-600 bg-blue-100',
  },
  APPROVED: {
    label: '承認済',
    icon: <CheckCircle className="h-4 w-4" />,
    className: 'text-green-600 bg-green-100',
  },
  REJECTED: {
    label: '差戻し',
    icon: <XCircle className="h-4 w-4" />,
    className: 'text-red-600 bg-red-100',
  },
  OVERDUE: {
    label: '期限超過',
    icon: <AlertCircle className="h-4 w-4" />,
    className: 'text-orange-600 bg-orange-100',
  },
}

const STATUS_FILTER_OPTIONS: { value: SubmissionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'すべて' },
  { value: 'NOT_STARTED', label: '未着手' },
  { value: 'IN_PROGRESS', label: '入力中' },
  { value: 'SUBMITTED', label: '提出済' },
  { value: 'APPROVED', label: '承認済' },
  { value: 'REJECTED', label: '差戻し' },
  { value: 'OVERDUE', label: '期限超過' },
]

function formatDateTime(isoString: string | null): string {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SubmissionStatusTab({ eventType, eventId }: SubmissionStatusTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BffSubmissionListResponse | null>(null)
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)

  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const request = statusFilter !== 'ALL' ? { status: [statusFilter] } : {}
      const response = await bffClient.listSubmissions(eventType, eventId, request)
      setData(response)
      setSelectedDepartments([])
    } catch (error) {
      toast({
        title: 'エラー',
        description: '登録状況の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [eventType, eventId, statusFilter, toast])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!data) return
    if (checked) {
      // Select only remindable departments (NOT_STARTED, IN_PROGRESS, OVERDUE)
      const remindable = data.departments
        .filter((d) => ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(d.status))
        .map((d) => d.departmentId)
      setSelectedDepartments(remindable)
    } else {
      setSelectedDepartments([])
    }
  }, [data])

  const handleSelectDepartment = useCallback((departmentId: string, checked: boolean) => {
    setSelectedDepartments((prev) =>
      checked ? [...prev, departmentId] : prev.filter((id) => id !== departmentId)
    )
  }, [])

  const isRemindable = (status: SubmissionStatus): boolean => {
    return ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(status)
  }

  const handleOpenReminder = useCallback(() => {
    if (selectedDepartments.length === 0) {
      toast({
        title: '選択エラー',
        description: '催促対象の部門を選択してください',
        variant: 'destructive',
      })
      return
    }
    setReminderDialogOpen(true)
  }, [selectedDepartments, toast])

  const handleSendReminder = useCallback(async (message: string) => {
    try {
      const response = await bffClient.sendReminder(eventType, eventId, {
        departmentIds: selectedDepartments,
        message,
      })
      if (response.success) {
        toast({
          title: '催促送信完了',
          description: response.message,
        })
        setReminderDialogOpen(false)
        setSelectedDepartments([])
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '催促の送信に失敗しました',
        variant: 'destructive',
      })
    }
  }, [eventType, eventId, selectedDepartments, toast])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-sm text-muted-foreground">読み込み中...</span>
      </div>
    )
  }

  if (!data) return null

  const { summary, departments } = data
  const remindableDepts = departments.filter((d) => isRemindable(d.status))
  const allRemindableSelected = remindableDepts.length > 0 &&
    remindableDepts.every((d) => selectedDepartments.includes(d.departmentId))

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">登録状況サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">対象部門数</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <p className="text-2xl font-bold text-green-600">
              {summary.approved + summary.submitted}
            </p>
            <p className="text-xs text-muted-foreground">提出/承認済</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-600">
              {summary.inProgress + summary.notStarted}
            </p>
            <p className="text-xs text-muted-foreground">未提出</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-50">
            <p className="text-2xl font-bold text-orange-600">{summary.overdue}</p>
            <p className="text-xs text-muted-foreground">期限超過</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">完了率</span>
            <span className="font-medium">{summary.completionRate}%</span>
          </div>
          <Progress value={summary.completionRate} className="h-2" />
        </div>

        {summary.daysUntilDeadline !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              summary.daysUntilDeadline < 0 ? 'text-red-600' :
              summary.daysUntilDeadline <= 3 ? 'text-orange-600' :
              'text-muted-foreground'
            )}>
              締切まで {summary.daysUntilDeadline < 0 ? `${Math.abs(summary.daysUntilDeadline)}日超過` : `${summary.daysUntilDeadline}日`}
            </span>
          </div>
        )}
      </Card>

      {/* Filter & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">ステータス:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as SubmissionStatus | 'ALL')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSubmissions}
            disabled={loading}
          >
            <RotateCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenReminder}
          disabled={selectedDepartments.length === 0}
        >
          <Mail className="h-4 w-4 mr-1" />
          催促送信 ({selectedDepartments.length})
        </Button>
      </div>

      {/* Departments Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allRemindableSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={remindableDepts.length === 0}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">部門</TableHead>
              <TableHead className="w-[120px]">ステータス</TableHead>
              <TableHead className="w-[140px]">最終更新</TableHead>
              <TableHead className="w-[100px]">更新者</TableHead>
              <TableHead className="w-[150px]">承認状況</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <span className="text-sm text-muted-foreground">
                    対象部門がありません
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => {
                const statusConfig = STATUS_CONFIG[dept.status]
                const canRemind = isRemindable(dept.status)
                const isSelected = selectedDepartments.includes(dept.departmentId)

                return (
                  <TableRow
                    key={dept.departmentId}
                    className={cn(isSelected && 'bg-muted/30')}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectDepartment(dept.departmentId, checked as boolean)
                        }
                        disabled={!canRemind}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="font-medium"
                        style={{ paddingLeft: `${(dept.departmentLevel - 1) * 16}px` }}
                      >
                        {dept.departmentLevel > 1 && (
                          <span className="text-muted-foreground mr-1">└</span>
                        )}
                        {dept.departmentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                          statusConfig.className
                        )}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(dept.lastUpdatedAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dept.lastUpdatedBy || '-'}
                    </TableCell>
                    <TableCell>
                      {dept.approvalInfo ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">ステップ:</span>
                            <span className="font-medium">
                              {dept.approvalInfo.currentStep}/{dept.approvalInfo.maxSteps}
                            </span>
                          </div>
                          {dept.approvalInfo.nextApproverName && (
                            <div className="text-muted-foreground mt-0.5">
                              次: {dept.approvalInfo.nextApproverName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reminder Dialog */}
      <ReminderDialog
        open={reminderDialogOpen}
        selectedDepartments={
          data.departments.filter((d) => selectedDepartments.includes(d.departmentId))
        }
        onClose={() => setReminderDialogOpen(false)}
        onConfirm={handleSendReminder}
      />
    </div>
  )
}

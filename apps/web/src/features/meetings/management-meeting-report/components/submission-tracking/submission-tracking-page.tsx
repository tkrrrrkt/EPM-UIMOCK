'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Mail, AlertTriangle, CheckCircle, Clock, FileText, Users } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { Badge } from '@/shared/ui/components/badge'
import { Checkbox } from '@/shared/ui/components/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select'
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
import { useToast } from '@/hooks/use-toast'
import type { BffClient } from '../../api/bff-client'
import type { MeetingEventDto, SubmissionTrackingDto, SubmissionStatus } from '@epm/contracts/bff/meetings'
import { SubmissionStatusLabel } from '@epm/contracts/bff/meetings'

interface SubmissionTrackingPageProps {
  bffClient: BffClient
  eventId: string
  onBack: () => void
}

export function SubmissionTrackingPage({
  bffClient,
  eventId,
  onBack,
}: SubmissionTrackingPageProps) {
  const { toast } = useToast()
  const [event, setEvent] = useState<MeetingEventDto | null>(null)
  const [tracking, setTracking] = useState<SubmissionTrackingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [showRemindDialog, setShowRemindDialog] = useState(false)
  const [reminding, setReminding] = useState(false)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventData, trackingData] = await Promise.all([
        bffClient.getEventById(eventId),
        bffClient.getSubmissionTracking(eventId),
      ])
      setEvent(eventData)
      setTracking(trackingData)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'データの取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDept = (deptId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepts([...selectedDepts, deptId])
    } else {
      setSelectedDepts(selectedDepts.filter((id) => id !== deptId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unsubmittedDepts = filteredItems
        .filter((item) => item.status !== 'SUBMITTED')
        .map((item) => item.departmentStableId)
      setSelectedDepts(unsubmittedDepts)
    } else {
      setSelectedDepts([])
    }
  }

  const handleRemind = async () => {
    if (selectedDepts.length === 0) return

    try {
      setReminding(true)
      await bffClient.remindSubmission(eventId, {
        departmentStableIds: selectedDepts,
      })
      toast({
        title: '催促メール送信',
        description: `${selectedDepts.length}件の部門に催促メールを送信しました`,
      })
      setSelectedDepts([])
      setShowRemindDialog(false)
      await loadData()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '催促メールの送信に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setReminding(false)
    }
  }

  const filteredItems = tracking?.items.filter((item) => {
    if (statusFilter === 'all') return true
    return item.status === statusFilter
  }) || []

  const getStatusBadge = (status: SubmissionStatus, isOverdue: boolean) => {
    if (isOverdue && status !== 'SUBMITTED') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          期限超過
        </Badge>
      )
    }

    switch (status) {
      case 'SUBMITTED':
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            {SubmissionStatusLabel.SUBMITTED}
          </Badge>
        )
      case 'DRAFT':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
            <Clock className="h-3 w-3" />
            {SubmissionStatusLabel.DRAFT}
          </Badge>
        )
      case 'NOT_STARTED':
        return (
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {SubmissionStatusLabel.NOT_STARTED}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">登録状況管理</h1>
          <p className="text-muted-foreground">
            {event?.eventName} - 部門別の報告登録状況
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>全体</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracking?.summary.total}</div>
            <p className="text-xs text-muted-foreground">
              提出率: {tracking && tracking.summary.total > 0
                ? Math.round((tracking.summary.submitted / tracking.summary.total) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-success">提出済</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{tracking?.summary.submitted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-warning">作成中</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{tracking?.summary.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未着手</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracking?.summary.notStarted}</div>
          </CardContent>
        </Card>
        <Card className={tracking?.summary.overdue ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardDescription className="text-destructive">期限超過</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{tracking?.summary.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Actions */}
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="SUBMITTED">提出済</SelectItem>
            <SelectItem value="DRAFT">作成中</SelectItem>
            <SelectItem value="NOT_STARTED">未着手</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setShowRemindDialog(true)}
          disabled={selectedDepts.length === 0}
        >
          <Mail className="h-4 w-4 mr-2" />
          一括催促（{selectedDepts.length}件）
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredItems.filter((i) => i.status !== 'SUBMITTED').length > 0 &&
                    selectedDepts.length === filteredItems.filter((i) => i.status !== 'SUBMITTED').length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>部門名</TableHead>
              <TableHead>レベル</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>提出日時</TableHead>
              <TableHead>提出者</TableHead>
              <TableHead>最終催促</TableHead>
              <TableHead className="w-24">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.departmentStableId}
                className={item.isOverdue ? 'bg-destructive/5' : ''}
              >
                <TableCell>
                  {item.status !== 'SUBMITTED' && (
                    <Checkbox
                      checked={selectedDepts.includes(item.departmentStableId)}
                      onCheckedChange={(checked) =>
                        handleSelectDept(item.departmentStableId, !!checked)
                      }
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.departmentName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.level === 'DEPARTMENT' ? '部門' : item.level === 'BU' ? '事業部' : '全社'}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(item.status, item.isOverdue)}</TableCell>
                <TableCell>{formatDate(item.submittedAt)}</TableCell>
                <TableCell>{item.submittedBy || '-'}</TableCell>
                <TableCell>{formatDate(item.lastRemindedAt)}</TableCell>
                <TableCell>
                  {item.status !== 'SUBMITTED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDepts([item.departmentStableId])
                        setShowRemindDialog(true)
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  対象データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Remind Dialog */}
      <AlertDialog open={showRemindDialog} onOpenChange={setShowRemindDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>催促メールを送信しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              選択した {selectedDepts.length} 件の部門に催促メールを送信します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reminding}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemind} disabled={reminding}>
              {reminding ? '送信中...' : '送信する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

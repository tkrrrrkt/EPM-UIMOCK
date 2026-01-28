'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Lock, Camera, AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { Badge } from '@/shared/ui/components/badge'
import { Checkbox } from '@/shared/ui/components/checkbox'
import { Textarea } from '@/shared/ui/components/textarea'
import { Label } from '@/shared/ui/components/label'
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
import type {
  MeetingEventDto,
  SnapshotType,
  CloseEventResultDto,
} from '@epm/contracts/bff/meetings'
import { MeetingEventStatusLabel, SnapshotTypeLabel } from '@epm/contracts/bff/meetings'

interface EventClosePageProps {
  bffClient: BffClient
  eventId: string
  onBack: () => void
  onCloseComplete?: (result: CloseEventResultDto) => void
}

const SNAPSHOT_TYPES: SnapshotType[] = ['FACT_SUMMARY', 'KPI_STATUS', 'ACTION_PROGRESS']

export function EventClosePage({
  bffClient,
  eventId,
  onBack,
  onCloseComplete,
}: EventClosePageProps) {
  const { toast } = useToast()
  const [event, setEvent] = useState<MeetingEventDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Form state
  const [includeSnapshot, setIncludeSnapshot] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<SnapshotType[]>(['FACT_SUMMARY', 'KPI_STATUS'])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const eventData = await bffClient.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '会議情報の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: SnapshotType, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    }
  }

  const handleClose = async () => {
    try {
      setClosing(true)
      const result = await bffClient.closeEvent(eventId, {
        includeSnapshot,
        snapshotTypes: includeSnapshot ? selectedTypes : undefined,
        notes: notes || undefined,
      })

      toast({
        title: '会議をクローズしました',
        description: includeSnapshot
          ? `${result.snapshotIds?.length || 0}件のスナップショットを取得しました`
          : '会議が正常にクローズされました',
      })

      setShowConfirmDialog(false)
      onCloseComplete?.(result)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '会議のクローズに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setClosing(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    const label = MeetingEventStatusLabel[status as keyof typeof MeetingEventStatusLabel] || status

    switch (status) {
      case 'HELD':
        return <Badge className="bg-primary/10 text-primary border-primary/20">{label}</Badge>
      case 'CLOSED':
        return <Badge variant="secondary">{label}</Badge>
      default:
        return <Badge variant="outline">{label}</Badge>
    }
  }

  const isCloseDisabled = !event || event.status === 'CLOSED' || event.status === 'ARCHIVED'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">会議クローズ</h1>
          <p className="text-muted-foreground">
            {event?.eventName}を終了し、クローズ処理を行います
          </p>
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            会議情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">会議名</Label>
              <p className="font-medium">{event?.eventName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">会議種別</Label>
              <p className="font-medium">{event?.meetingTypeName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">対象期間</Label>
              <p className="font-medium">{event?.targetPeriodName || `${event?.targetFiscalYear}年度`}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">会議日</Label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(event?.meetingDate)}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <Label className="text-muted-foreground text-sm">現在のステータス</Label>
            <div className="mt-1">{getStatusBadge(event?.status)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Already Closed Warning */}
      {isCloseDisabled && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                この会議は既にクローズ済みまたはアーカイブ済みです
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Snapshot Settings Card */}
      {!isCloseDisabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                スナップショット設定
              </CardTitle>
              <CardDescription>
                クローズ時に取得するデータのスナップショットを選択します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSnapshot"
                  checked={includeSnapshot}
                  onCheckedChange={(checked) => setIncludeSnapshot(!!checked)}
                />
                <Label htmlFor="includeSnapshot" className="font-medium">
                  スナップショットを取得する
                </Label>
              </div>

              {includeSnapshot && (
                <div className="ml-6 space-y-3 border-l-2 pl-4">
                  <Label className="text-sm text-muted-foreground">取得する種別:</Label>
                  {SNAPSHOT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                      />
                      <Label htmlFor={`type-${type}`}>
                        {SnapshotTypeLabel[type]}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>クローズ備考</CardTitle>
              <CardDescription>
                クローズに関するメモを残すことができます（任意）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="クローズに関する備考やメモを入力..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          キャンセル
        </Button>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isCloseDisabled}
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          会議をクローズ
        </Button>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              会議をクローズしますか？
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <strong>{event?.eventName}</strong> をクローズします。
              </p>
              <p>
                クローズ後は報告の編集ができなくなります。
                {includeSnapshot && selectedTypes.length > 0 && (
                  <span className="block mt-1">
                    {selectedTypes.length}種類のスナップショットが取得されます。
                  </span>
                )}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={closing}>
              {closing ? 'クローズ中...' : 'クローズする'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

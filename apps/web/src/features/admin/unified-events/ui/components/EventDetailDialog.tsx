'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@/shared/ui'
import { SubmissionStatusTab } from './SubmissionStatusTab'
import { bffClient } from '../api'
import type {
  BffUnifiedEvent,
  BffUnifiedEventDetailResponse,
  UnifiedEventType,
} from '@epm/contracts/bff/unified-events'
import {
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Clock,
  User,
  X,
} from 'lucide-react'

interface EventDetailDialogProps {
  open: boolean
  event: BffUnifiedEvent | null
  onClose: () => void
}

// Event type icon mapping
const EVENT_TYPE_ICONS: Record<UnifiedEventType, React.ReactNode> = {
  BUDGET: <FileText className="h-5 w-5" />,
  FORECAST: <TrendingUp className="h-5 w-5" />,
  MEETING: <Users className="h-5 w-5" />,
  MTP: <Target className="h-5 w-5" />,
  GUIDELINE: <BookOpen className="h-5 w-5" />,
}

// Event type label mapping
const EVENT_TYPE_LABELS: Record<UnifiedEventType, string> = {
  BUDGET: '予算',
  FORECAST: '見込',
  MEETING: '経営会議',
  MTP: '中期計画',
  GUIDELINE: 'ガイドライン',
}

// Event type color mapping
const EVENT_TYPE_COLORS: Record<UnifiedEventType, string> = {
  BUDGET: 'bg-blue-100 text-blue-700',
  FORECAST: 'bg-purple-100 text-purple-700',
  MEETING: 'bg-green-100 text-green-700',
  MTP: 'bg-orange-100 text-orange-700',
  GUIDELINE: 'bg-gray-100 text-gray-700',
}

function formatDate(isoString: string | null): string {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventDetailDialog({ open, event, onClose }: EventDetailDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<BffUnifiedEventDetailResponse | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadDetail = useCallback(async () => {
    if (!event) return

    setLoading(true)
    try {
      const response = await bffClient.getEventDetail(event.eventType, event.id)
      setDetail(response)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'イベント詳細の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [event, toast])

  useEffect(() => {
    if (open && event) {
      loadDetail()
      setActiveTab('overview')
    }
  }, [open, event, loadDetail])

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${EVENT_TYPE_COLORS[event.eventType]}`}
            >
              {EVENT_TYPE_ICONS[event.eventType]}
            </div>
            <div>
              <DialogTitle className="text-xl">{event.eventName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </Badge>
                <Badge variant="secondary">{event.statusLabel}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger
              value="submissions"
              disabled={!event.hasSubmissionTracking}
            >
              登録状況
            </TabsTrigger>
            <TabsTrigger value="history" disabled>
              履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-muted-foreground">読み込み中...</span>
              </div>
            ) : detail ? (
              <div className="space-y-4">
                {/* Basic Info Card */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">対象期間</p>
                      <p className="text-sm font-medium">{detail.targetPeriod}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">ステータス</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{detail.statusLabel}</Badge>
                        <span className="text-xs text-muted-foreground">
                          (内部: {detail.status})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">締切日</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{formatDate(detail.deadline)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">登録状況管理</p>
                      <p className="text-sm">
                        {detail.hasSubmissionTracking ? '対象' : '対象外'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">作成日時</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(detail.createdAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">作成者</p>
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{detail.createdBy || '-'}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Period Info Card (for BUDGET/FORECAST) */}
                {(detail.periodStart || detail.periodEnd) && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">期間詳細</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">開始日</p>
                        <p className="text-sm">{formatDate(detail.periodStart)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">終了日</p>
                        <p className="text-sm">{formatDate(detail.periodEnd)}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Progress Card (for events with submission tracking) */}
                {event.progress && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">進捗状況</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            完了: {event.progress.completed} / {event.progress.total}
                          </span>
                          <span className="font-medium">{event.progress.rate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${event.progress.rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    閉じる
                  </Button>
                  {/* Phase 2: Navigate to actual event page */}
                  <Button disabled>
                    詳細画面へ
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="submissions" className="mt-4">
            {event.hasSubmissionTracking && (
              <SubmissionStatusTab
                eventType={event.eventType}
                eventId={event.id}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                履歴機能は将来実装予定です
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

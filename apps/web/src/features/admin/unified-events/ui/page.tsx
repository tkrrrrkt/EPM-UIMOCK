'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Filter } from 'lucide-react'
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  useToast,
} from '@/shared/ui'
import { EventListTable } from './components/EventListTable'
import { EventDetailDialog } from './components/EventDetailDialog'
import { bffClient } from './api'
import type {
  BffUnifiedEvent,
  BffUnifiedEventListRequest,
  UnifiedEventType,
} from '@epm/contracts/bff/unified-events'

const EVENT_TYPE_OPTIONS: { value: UnifiedEventType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'すべて' },
  { value: 'BUDGET', label: '予算' },
  { value: 'FORECAST', label: '見込' },
  { value: 'MEETING', label: '経営会議' },
  { value: 'MTP', label: '中期計画' },
  { value: 'GUIDELINE', label: 'ガイドライン' },
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'すべて' },
  { value: '下書き', label: '下書き' },
  { value: '受付中', label: '受付中' },
  { value: '承認済', label: '承認済' },
  { value: '確定済', label: '確定済' },
  { value: '完了', label: '完了' },
]

export default function UnifiedEventsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Data state
  const [events, setEvents] = useState<BffUnifiedEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filter state
  const [eventType, setEventType] = useState<UnifiedEventType | 'ALL'>('ALL')
  const [statusLabel, setStatusLabel] = useState<string>('ALL')
  const [keyword, setKeyword] = useState('')

  // Detail dialog state
  const [selectedEvent, setSelectedEvent] = useState<BffUnifiedEvent | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const request: BffUnifiedEventListRequest = {
        page,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }

      if (eventType !== 'ALL') {
        request.eventType = eventType
      }
      if (statusLabel !== 'ALL') {
        request.statusLabel = statusLabel
      }
      if (keyword.trim()) {
        request.keyword = keyword.trim()
      }

      const response = await bffClient.listEvents(request)
      setEvents(response.items)
      setTotalCount(response.totalCount)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'イベント一覧の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, eventType, statusLabel, keyword, toast])

  // Load on mount and when filters change
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [eventType, statusLabel, keyword])

  const handleEventClick = useCallback((event: BffUnifiedEvent) => {
    setSelectedEvent(event)
    setDetailDialogOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false)
    setSelectedEvent(null)
  }, [])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">統一イベント管理</h1>
          <p className="text-muted-foreground mt-1">
            各種イベントの一覧と登録状況を横断的に管理
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={loadEvents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">フィルタ:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">種別:</span>
            <Select
              value={eventType}
              onValueChange={(value) => setEventType(value as UnifiedEventType | 'ALL')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ステータス:</span>
            <Select value={statusLabel} onValueChange={setStatusLabel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">検索:</span>
            <Input
              placeholder="イベント名で検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {totalCount}件中 {(page - 1) * pageSize + 1}〜
            {Math.min(page * pageSize, totalCount)}件を表示
          </p>
        </div>

        {/* Event list table */}
        <EventListTable
          events={events}
          loading={loading}
          onEventClick={handleEventClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              次へ
            </Button>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <EventDetailDialog
        open={detailDialogOpen}
        event={selectedEvent}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

'use client'

import {
  Badge,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import type { BffUnifiedEvent, UnifiedEventType } from '@epm/contracts/bff/unified-events'
import {
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Target,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventListTableProps {
  events: BffUnifiedEvent[]
  loading?: boolean
  onEventClick: (event: BffUnifiedEvent) => void
}

// Event type icon mapping
const EVENT_TYPE_ICONS: Record<UnifiedEventType, React.ReactNode> = {
  BUDGET: <FileText className="h-4 w-4" />,
  FORECAST: <TrendingUp className="h-4 w-4" />,
  MEETING: <Users className="h-4 w-4" />,
  MTP: <Target className="h-4 w-4" />,
  GUIDELINE: <BookOpen className="h-4 w-4" />,
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

// Status badge variant mapping
const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  '下書き': 'outline',
  '受付中': 'secondary',
  '受付開始': 'secondary',
  '承認済': 'default',
  '確定済': 'default',
  '配布済': 'default',
  '開催済': 'secondary',
  '完了': 'default',
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
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function EventListTable({ events, loading, onEventClick }: EventListTableProps) {
  if (events.length === 0 && !loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">イベントがありません</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">種別</TableHead>
            <TableHead className="min-w-[200px]">イベント名</TableHead>
            <TableHead className="w-[150px]">対象期間</TableHead>
            <TableHead className="w-[100px]">ステータス</TableHead>
            <TableHead className="w-[120px]">締切</TableHead>
            <TableHead className="w-[150px]">進捗</TableHead>
            <TableHead className="w-[100px]">作成日</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <span className="text-sm text-muted-foreground">読み込み中...</span>
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow
                key={event.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onEventClick(event)}
              >
                <TableCell>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
                      EVENT_TYPE_COLORS[event.eventType]
                    )}
                  >
                    {EVENT_TYPE_ICONS[event.eventType]}
                    {EVENT_TYPE_LABELS[event.eventType]}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{event.eventName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {event.targetPeriod}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANTS[event.statusLabel] || 'outline'}>
                    {event.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {event.deadline ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.deadline)}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {event.progress ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {event.progress.completed}/{event.progress.total}
                        </span>
                        <span className="font-medium">{event.progress.rate}%</span>
                      </div>
                      <Progress value={event.progress.rate} className="h-1.5" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Clock,
} from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Input } from '@/shared/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { Skeleton } from '@/shared/ui/components/skeleton'
import { MeetingEventStatusBadge } from '../shared/status-badge'
import type { BffClient } from '../../api/bff-client'
import type { MeetingEventDto, MeetingEventStatus, GetMeetingEventsQueryDto } from '@epm/contracts/bff/meetings'
import { MeetingEventStatusLabel } from '@epm/contracts/bff/meetings'

interface EventListPageProps {
  client: BffClient
}

const MEETING_TYPES = [
  { id: 'mt-001', name: '月次経営会議' },
  { id: 'mt-002', name: '四半期経営会議' },
  { id: 'mt-003', name: '取締役会' },
]

const FISCAL_YEARS = [2026, 2025, 2024]

const PAGE_SIZES = [10, 20, 50]

export function EventListPage({ client }: EventListPageProps) {
  const router = useRouter()

  // State
  const [events, setEvents] = useState<MeetingEventDto[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [keyword, setKeyword] = useState('')
  const [meetingTypeId, setMeetingTypeId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [fiscalYear, setFiscalYear] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const query: GetMeetingEventsQueryDto = {
        page,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }

      if (keyword.trim()) query.keyword = keyword.trim()
      if (meetingTypeId) query.meetingTypeId = meetingTypeId
      if (status) query.status = status as MeetingEventStatus
      if (fiscalYear) query.fiscalYear = Number(fiscalYear)

      const result = await client.getEvents(query)
      setEvents(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }, [client, page, pageSize, keyword, meetingTypeId, status, fiscalYear])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [keyword, meetingTypeId, status, fiscalYear])

  // Handlers
  const handleRowClick = (event: MeetingEventDto) => {
    // Navigate to report view for this event
    router.push(`/meetings/management-meeting-report/${event.id}`)
  }

  const handleCreateNew = () => {
    router.push('/meetings/management-meeting-report/create')
  }

  const handleClearFilters = () => {
    setKeyword('')
    setMeetingTypeId('')
    setStatus('')
    setFiscalYear('')
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const hasFilters = keyword || meetingTypeId || status || fiscalYear

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">会議イベント一覧</h1>
            <p className="text-sm text-muted-foreground mt-1">
              経営会議のイベント管理と報告収集状況を確認
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            新規イベント作成
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 bg-muted/30 border-b">
        <div className="flex flex-wrap items-center gap-4">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="イベント名・コードで検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Meeting Type Filter */}
          <Select value={meetingTypeId || 'all'} onValueChange={(v) => setMeetingTypeId(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="会議種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {MEETING_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {Object.entries(MeetingEventStatusLabel).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fiscal Year Filter */}
          <Select value={fiscalYear || 'all'} onValueChange={(v) => setFiscalYear(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="年度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {FISCAL_YEARS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}年度
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              フィルタをクリア
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        <Card className="border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">コード</TableHead>
                <TableHead>イベント名</TableHead>
                <TableHead className="w-[140px]">会議種別</TableHead>
                <TableHead className="w-[100px]">対象期間</TableHead>
                <TableHead className="w-[100px]">ステータス</TableHead>
                <TableHead className="w-[120px]">提出期限</TableHead>
                <TableHead className="w-[120px]">会議日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {hasFilters
                          ? '条件に一致するイベントがありません'
                          : '会議イベントがありません'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hasFilters
                          ? 'フィルタ条件を変更してください'
                          : '新しいイベントを作成してください'}
                      </p>
                      {!hasFilters && (
                        <Button className="mt-4" onClick={handleCreateNew}>
                          <Plus className="h-4 w-4 mr-2" />
                          新規イベント作成
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                events.map((event) => (
                  <TableRow
                    key={event.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(event)}
                  >
                    <TableCell className="font-mono text-sm">
                      {event.eventCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {event.eventName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.meetingTypeName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.targetPeriodName || '-'}
                    </TableCell>
                    <TableCell>
                      <MeetingEventStatusBadge status={event.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.submissionDeadline)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.meetingDate)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="px-6 py-4 border-t bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>表示件数:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-4">
                {totalCount}件中 {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, totalCount)}件を表示
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

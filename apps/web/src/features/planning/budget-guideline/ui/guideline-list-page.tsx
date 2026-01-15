"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Copy, Trash2 } from "lucide-react"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import { CreateEventDialog } from "../dialogs/create-event-dialog"
import { DuplicateEventDialog } from "../dialogs/duplicate-event-dialog"
import { DeleteConfirmDialog } from "../dialogs/delete-confirm-dialog"
import type {
  BffGuidelineEventSummary,
  GuidelineEventStatus,
  PeriodType,
} from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

export function GuidelineListPage() {
  const [events, setEvents] = useState<BffGuidelineEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<GuidelineEventStatus | "ALL">("ALL")
  const [fiscalYearFilter, setFiscalYearFilter] = useState<number | "ALL">("ALL")
  const [periodTypeFilter, setPeriodTypeFilter] = useState<PeriodType | "ALL">("ALL")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<BffGuidelineEventSummary | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [statusFilter, fiscalYearFilter, periodTypeFilter])

  async function loadEvents() {
    try {
      setLoading(true)
      const response = await bffClient.listEvents({
        page: 1,
        pageSize: 100,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        fiscalYear: fiscalYearFilter === "ALL" ? undefined : fiscalYearFilter,
        periodType: periodTypeFilter === "ALL" ? undefined : periodTypeFilter,
        sortBy: "updatedAt",
        sortOrder: "desc",
      })
      setEvents(response.items)
    } catch (error) {
      toast({
        title: "エラー",
        description: "イベントの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleDuplicate(event: BffGuidelineEventSummary) {
    setSelectedEvent(event)
    setDuplicateDialogOpen(true)
  }

  function handleDelete(event: BffGuidelineEventSummary) {
    setSelectedEvent(event)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!selectedEvent) return

    try {
      await bffClient.deleteEvent(selectedEvent.id)
      toast({
        title: "削除完了",
        description: "イベントを削除しました",
      })
      loadEvents()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "GUIDELINE_EVENT_CONFIRMED_DELETE_DENIED"
          ? "確定済みイベントは削除できません"
          : "イベントの削除に失敗しました"
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  function getStatusBadgeVariant(status: GuidelineEventStatus) {
    return status === "CONFIRMED" ? "default" : "secondary"
  }

  function getStatusLabel(status: GuidelineEventStatus) {
    return status === "CONFIRMED" ? "確定" : "下書き"
  }

  function getPeriodTypeLabel(periodType: PeriodType, periodNo: number) {
    switch (periodType) {
      case "ANNUAL":
        return "年度"
      case "HALF":
        return `H${periodNo}`
      case "QUARTER":
        return `Q${periodNo}`
      default:
        return periodType
    }
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">予算ガイドライン</h1>
            <p className="text-pretty mt-2 text-muted-foreground">中期経営計画と年度予算の間に位置する指針を管理</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            新規作成
          </Button>
        </div>

        {/* Filter Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">フィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ステータス</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as GuidelineEventStatus | "ALL")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    <SelectItem value="DRAFT">下書き</SelectItem>
                    <SelectItem value="CONFIRMED">確定</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">年度</label>
                <Select
                  value={String(fiscalYearFilter)}
                  onValueChange={(value) => setFiscalYearFilter(value === "ALL" ? "ALL" : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">期間種別</label>
                <Select
                  value={periodTypeFilter}
                  onValueChange={(value) => setPeriodTypeFilter(value as PeriodType | "ALL")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    <SelectItem value="ANNUAL">年度</SelectItem>
                    <SelectItem value="HALF">半期</SelectItem>
                    <SelectItem value="QUARTER">四半期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>イベントコード</TableHead>
                    <TableHead>イベント名</TableHead>
                    <TableHead className="text-center">年度</TableHead>
                    <TableHead className="text-center">期間種別</TableHead>
                    <TableHead className="text-center">ステータス</TableHead>
                    <TableHead>更新日時</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="mx-auto h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="mx-auto h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="mx-auto h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        イベントが見つかりません
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow
                        key={event.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => (window.location.href = `/planning/guideline/${event.id}`)}
                      >
                        <TableCell className="font-medium font-mono text-sm">{event.eventCode}</TableCell>
                        <TableCell>{event.eventName}</TableCell>
                        <TableCell className="text-center">FY{event.fiscalYear}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{getPeriodTypeLabel(event.periodType, event.periodNo)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(event.status)}>{getStatusLabel(event.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDateTime(event.updatedAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicate(event)
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(event)
                                }}
                                className="text-destructive"
                                disabled={event.status === "CONFIRMED"}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateEventDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreated={loadEvents} />

      {selectedEvent && (
        <>
          <DuplicateEventDialog
            open={duplicateDialogOpen}
            onOpenChange={setDuplicateDialogOpen}
            sourceEvent={selectedEvent}
            onDuplicated={loadEvents}
          />
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            event={selectedEvent}
            onDeleted={handleConfirmDelete}
          />
        </>
      )}
    </div>
  )
}

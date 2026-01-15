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
import { CreateEventDialog } from "./dialogs/create-event-dialog"
import { DuplicateEventDialog } from "./dialogs/duplicate-event-dialog"
import { DeleteConfirmDialog } from "./dialogs/delete-confirm-dialog"
import { formatDateTime } from "../utils/format"
import type { BffMtpEventSummary, MtpEventStatus } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

export function MtpEventListPage() {
  const [events, setEvents] = useState<BffMtpEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<MtpEventStatus | "ALL">("ALL")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<BffMtpEventSummary | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [statusFilter])

  async function loadEvents() {
    try {
      setLoading(true)
      const response = await bffClient.listEvents({
        page: 1,
        pageSize: 100,
        status: statusFilter === "ALL" ? undefined : statusFilter,
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

  function handleDuplicate(event: BffMtpEventSummary) {
    setSelectedEvent(event)
    setDuplicateDialogOpen(true)
  }

  function handleDelete(event: BffMtpEventSummary) {
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
        error instanceof Error && error.message === "MTP_EVENT_CONFIRMED_DELETE_DENIED"
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

  function getStatusBadgeVariant(status: MtpEventStatus) {
    return status === "CONFIRMED" ? "default" : "secondary"
  }

  function getStatusLabel(status: MtpEventStatus) {
    return status === "CONFIRMED" ? "確定" : "下書き"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">中期経営計画（MTP）</h1>
            <p className="text-pretty mt-2 text-muted-foreground">3〜5年スパンの経営目標値と戦略テーマを一元管理</p>
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
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-foreground">ステータス</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MtpEventStatus | "ALL")}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">すべて</SelectItem>
                  <SelectItem value="DRAFT">下書き</SelectItem>
                  <SelectItem value="CONFIRMED">確定</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead className="text-center">開始年度</TableHead>
                    <TableHead className="text-center">計画年数</TableHead>
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
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="mx-auto h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="mx-auto h-5 w-16" />
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
                        onClick={() => (window.location.href = `/planning/mtp/${event.id}`)}
                      >
                        <TableCell className="font-medium">{event.eventCode}</TableCell>
                        <TableCell>{event.eventName}</TableCell>
                        <TableCell className="text-center">FY{event.startFiscalYear}</TableCell>
                        <TableCell className="text-center">{event.planYears}年</TableCell>
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
      <CreateEventDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={loadEvents} />

      {selectedEvent && (
        <>
          <DuplicateEventDialog
            open={duplicateDialogOpen}
            onOpenChange={setDuplicateDialogOpen}
            event={selectedEvent}
            onSuccess={loadEvents}
          />
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="イベントを削除"
            description={`「${selectedEvent.eventName}」を削除してもよろしいですか？この操作は取り消せません。`}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  )
}

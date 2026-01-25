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
import {
  formatDateTime,
  getScenarioLabel,
  getScenarioBadgeVariant,
  getVersionStatusLabel,
  getVersionStatusBadgeVariant,
} from "../utils/format"
import type { BffPlanEventSummary, ScenarioType } from "@epm/contracts/bff/budget-entry"

const bffClient = new MockBffClient()

export function BudgetEventListPage() {
  const [events, setEvents] = useState<BffPlanEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioType | "ALL">("ALL")
  const [fiscalYearFilter, setFiscalYearFilter] = useState<string>("ALL")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<BffPlanEventSummary | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [scenarioFilter, fiscalYearFilter])

  async function loadEvents() {
    try {
      setLoading(true)
      const response = await bffClient.listEvents({
        page: 1,
        pageSize: 100,
        scenarioType: scenarioFilter === "ALL" ? undefined : scenarioFilter,
        fiscalYear: fiscalYearFilter === "ALL" ? undefined : Number(fiscalYearFilter),
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

  function handleDuplicate(event: BffPlanEventSummary) {
    setSelectedEvent(event)
    setDuplicateDialogOpen(true)
  }

  function handleDelete(event: BffPlanEventSummary) {
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
        error instanceof Error && error.message === "BUDGET_EVENT_HAS_FIXED_VERSION"
          ? "確定済みバージョンが存在するイベントは削除できません"
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

  // 年度の選択肢を生成（現在の年度から前後3年）
  const currentYear = new Date().getFullYear()
  const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).reverse()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">予算入力</h1>
            <p className="text-pretty mt-2 text-muted-foreground">
              予算・見込・実績のイベントを管理し、科目×月の予算データを入力
            </p>
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-foreground">シナリオ</label>
                <Select
                  value={scenarioFilter}
                  onValueChange={(value) => setScenarioFilter(value as ScenarioType | "ALL")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    <SelectItem value="BUDGET">予算</SelectItem>
                    <SelectItem value="FORECAST">見込</SelectItem>
                    <SelectItem value="ACTUAL">実績</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-foreground">年度</label>
                <Select value={fiscalYearFilter} onValueChange={setFiscalYearFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        FY{year}
                      </SelectItem>
                    ))}
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
                    <TableHead className="text-center">シナリオ</TableHead>
                    <TableHead className="text-center">年度</TableHead>
                    <TableHead className="text-center">バージョン</TableHead>
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
                          <Skeleton className="mx-auto h-6 w-16" />
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
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        イベントが見つかりません
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow
                        key={event.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => (window.location.href = `/transactions/budget-entry/${event.id}`)}
                      >
                        <TableCell className="font-medium">{event.eventCode}</TableCell>
                        <TableCell>{event.eventName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getScenarioBadgeVariant(event.scenarioType)}>
                            {getScenarioLabel(event.scenarioType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">FY{event.fiscalYear}</TableCell>
                        <TableCell className="text-center">
                          {event.latestVersionName}
                          <span className="ml-1 text-muted-foreground">({event.versionCount})</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getVersionStatusBadgeVariant(event.latestVersionStatus)}>
                            {getVersionStatusLabel(event.latestVersionStatus)}
                          </Badge>
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

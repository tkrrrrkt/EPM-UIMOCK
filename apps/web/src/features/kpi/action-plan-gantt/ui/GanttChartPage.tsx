"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/shared/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"
import { Loader2, Plus, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { DhtmlxGanttWrapper } from "./DhtmlxGanttWrapper"
import { WbsEditSheet } from "./WbsEditSheet"
import { WbsQuickEditPanel } from "./WbsQuickEditPanel"
import { MockBffClient } from "../api/MockBffClient"
import { getErrorMessage } from "../lib/error-messages"
import { convertToGanttData, convertTaskToUpdateRequest } from "../lib/gantt-data-converter"
import type { BffGanttData, BffGanttWbs, BffCreateWbsRequest, BffUpdateWbsRequest, ViewPeriod, DhtmlxTask, DhtmlxLink, DhtmlxGanttData } from "../types"

interface GanttChartPageProps {
  planId: string
}

export function GanttChartPage({ planId }: GanttChartPageProps) {
  const [bffData, setBffData] = useState<BffGanttData | null>(null)
  const [ganttData, setGanttData] = useState<DhtmlxGanttData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("day")

  // Quick Edit Panel（フローティングパネル）の状態
  const [quickEditWbs, setQuickEditWbs] = useState<BffGanttWbs | null>(null)
  const [quickEditPosition, setQuickEditPosition] = useState<{ x: number; y: number } | null>(null)

  // 詳細編集シートの状態
  const [editingWbs, setEditingWbs] = useState<BffGanttWbs | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  // 削除確認ダイアログの状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteTargetName, setDeleteTargetName] = useState<string>("")
  const deleteConfirmRef = useRef<(() => void) | null>(null)
  const deleteCancelRef = useRef<(() => void) | null>(null)

  const client = useMemo(() => new MockBffClient(), [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await client.getGanttData(planId)
      setBffData(result)
      // Convert to DHTMLX format
      const converted = convertToGanttData(result)
      setGanttData(converted)
    } catch (e) {
      const errorCode = e instanceof Error ? e.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(errorCode))
    } finally {
      setLoading(false)
    }
  }, [client, planId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle task updates from Gantt (drag, resize, progress change)
  const handleTaskUpdate = useCallback(
    async (task: DhtmlxTask) => {
      try {
        const updateData = convertTaskToUpdateRequest(task)

        // Find the original WBS item to get updatedAt for optimistic locking
        const originalWbs = bffData?.wbsItems.find((w) => w.id === task.id)
        if (!originalWbs) return

        // Update schedule
        await client.updateWbsSchedule(task.id, {
          startDate: updateData.startDate,
          dueDate: updateData.dueDate,
        })

        // Update progress if changed
        if (updateData.progressRate !== (originalWbs.progressRate ?? 0)) {
          await client.updateWbsProgress(task.id, {
            progressRate: updateData.progressRate,
          })
        }

        // Reload data to get fresh state
        await loadData()
      } catch (e) {
        console.error("Failed to update task:", e)
        // Reload to revert UI state
        await loadData()
      }
    },
    [bffData, client, loadData]
  )

  // Handle link creation
  const handleLinkCreate = useCallback(
    async (link: DhtmlxLink) => {
      try {
        await client.updateWbsDependency(link.target, {
          predecessorWbsId: link.source,
        })
        await loadData()
      } catch (e) {
        console.error("Failed to create link:", e)
        await loadData()
      }
    },
    [client, loadData]
  )

  // Handle link deletion
  const handleLinkDelete = useCallback(
    async (linkId: string) => {
      try {
        // Find the link to get the target WBS
        const link = ganttData?.links.find((l) => l.id === linkId)
        if (link) {
          await client.updateWbsDependency(link.target, {
            predecessorWbsId: null,
          })
        }
        await loadData()
      } catch (e) {
        console.error("Failed to delete link:", e)
        await loadData()
      }
    },
    [ganttData, client, loadData]
  )

  const handleTaskSelect = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
  }, [])

  // ダブルクリックでQuick Edit Panelを開く
  const handleTaskDblClick = useCallback(
    (taskId: string, position: { x: number; y: number }) => {
      const wbs = bffData?.wbsItems.find((w) => w.id === taskId)
      if (wbs) {
        setQuickEditWbs(wbs)
        setQuickEditPosition(position)
      }
    },
    [bffData]
  )

  // Quick Edit Panelを閉じる
  const handleQuickEditClose = useCallback(() => {
    setQuickEditWbs(null)
    setQuickEditPosition(null)
  }, [])

  // Quick Edit Panelから保存
  const handleQuickEditSave = useCallback(
    async (updates: Partial<BffGanttWbs>) => {
      if (!quickEditWbs) return

      try {
        // 基本情報の更新
        const updateRequest: BffUpdateWbsRequest = {
          wbsName: updates.wbsName ?? quickEditWbs.wbsName,
          assigneeEmployeeId: updates.assigneeEmployeeId ?? undefined,
          updatedAt: quickEditWbs.updatedAt,
        }
        await client.updateWbs(quickEditWbs.id, updateRequest)

        // スケジュールの更新
        if (updates.startDate !== undefined || updates.dueDate !== undefined) {
          await client.updateWbsSchedule(quickEditWbs.id, {
            startDate: updates.startDate ?? quickEditWbs.startDate,
            dueDate: updates.dueDate ?? quickEditWbs.dueDate,
          })
        }

        // 進捗率の更新
        if (updates.progressRate !== undefined && updates.progressRate !== null && updates.progressRate !== quickEditWbs.progressRate) {
          await client.updateWbsProgress(quickEditWbs.id, {
            progressRate: updates.progressRate,
          })
        }

        await loadData()
      } catch (e) {
        console.error("Failed to save WBS:", e)
        throw e
      }
    },
    [quickEditWbs, client, loadData]
  )

  // Quick Edit Panelから削除
  const handleQuickEditDelete = useCallback(async () => {
    if (!quickEditWbs) return

    try {
      await client.deleteWbs(quickEditWbs.id)
      setQuickEditWbs(null)
      setQuickEditPosition(null)
      await loadData()
    } catch (e) {
      console.error("Failed to delete WBS:", e)
    }
  }, [quickEditWbs, client, loadData])

  // Quick Edit Panelから詳細編集を開く
  const handleOpenFullEdit = useCallback(() => {
    if (quickEditWbs) {
      setEditingWbs(quickEditWbs)
      setIsEditSheetOpen(true)
      setQuickEditWbs(null)
      setQuickEditPosition(null)
    }
  }, [quickEditWbs])

  // 削除確認ダイアログを表示（EPMデザイン）
  const handleDeleteRequest = useCallback(
    (taskId: string, taskName: string, onConfirm: () => void, onCancel: () => void) => {
      setDeleteTargetId(taskId)
      setDeleteTargetName(taskName)
      deleteConfirmRef.current = onConfirm
      deleteCancelRef.current = onCancel
      setDeleteDialogOpen(true)
    },
    []
  )

  // 削除確定
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId) {
      try {
        await client.deleteWbs(deleteTargetId)
        deleteConfirmRef.current?.()
        await loadData()
      } catch (e) {
        console.error("Failed to delete WBS:", e)
        deleteCancelRef.current?.()
      }
    }
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
    setDeleteTargetName("")
  }, [deleteTargetId, client, loadData])

  // 削除キャンセル
  const handleDeleteCancel = useCallback(() => {
    deleteCancelRef.current?.()
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
    setDeleteTargetName("")
  }, [])

  // WBS追加ボタンのクリック
  const handleAddWbsClick = useCallback(() => {
    setEditingWbs(null) // nullで新規作成モード
    setIsEditSheetOpen(true)
  }, [])

  // WBS編集シートでの保存（新規作成・編集両対応）
  const handleWbsSave = useCallback(
    async (request: BffCreateWbsRequest | BffUpdateWbsRequest) => {
      try {
        if (editingWbs) {
          // 編集モード
          await client.updateWbs(editingWbs.id, request as BffUpdateWbsRequest)
        } else {
          // 新規作成モード
          await client.createWbs(request as BffCreateWbsRequest)
        }
        setIsEditSheetOpen(false)
        setEditingWbs(null)
        await loadData()
      } catch (e) {
        console.error("Failed to save WBS:", e)
      }
    },
    [editingWbs, client, loadData]
  )

  // WBS編集シートからの削除
  const handleWbsDeleteFromSheet = useCallback(async () => {
    if (!editingWbs) return

    try {
      await client.deleteWbs(editingWbs.id)
      setIsEditSheetOpen(false)
      setEditingWbs(null)
      await loadData()
    } catch (e) {
      console.error("Failed to delete WBS:", e)
    }
  }, [editingWbs, client, loadData])

  const handleZoomIn = () => {
    // ズームイン: 月 → 週 → 日（詳細化）
    if (viewPeriod === "month") setViewPeriod("week")
    else if (viewPeriod === "week") setViewPeriod("day")
  }

  const handleZoomOut = () => {
    // ズームアウト: 日 → 週 → 月（広域化）
    if (viewPeriod === "day") setViewPeriod("week")
    else if (viewPeriod === "week") setViewPeriod("month")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadData}>再読み込み</Button>
      </div>
    )
  }

  if (!bffData || !ganttData) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{bffData.planName}</h1>
          <p className="text-sm text-muted-foreground">
            ガントチャート（DHTMLX）
            <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Trial版</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadData} title="再読み込み">
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Select value={viewPeriod} onValueChange={(v) => setViewPeriod(v as ViewPeriod)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日表示</SelectItem>
              <SelectItem value="week">週表示</SelectItem>
              <SelectItem value="month">月表示</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={viewPeriod === "day"} title="ズームイン">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={viewPeriod === "month"} title="ズームアウト">
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button onClick={handleAddWbsClick}>
            <Plus className="w-4 h-4 mr-2" />
            WBS追加
          </Button>
        </div>
      </div>

      {/* DHTMLX Gantt Chart */}
      <div className="flex-1 overflow-hidden">
        <DhtmlxGanttWrapper
          tasks={ganttData.tasks}
          links={ganttData.links}
          viewPeriod={viewPeriod}
          selectedTaskId={selectedTaskId}
          onTaskUpdate={handleTaskUpdate}
          onLinkCreate={handleLinkCreate}
          onLinkDelete={handleLinkDelete}
          onTaskSelect={handleTaskSelect}
          onTaskDblClick={handleTaskDblClick}
          onDeleteRequest={handleDeleteRequest}
        />
      </div>

      {/* Footer info */}
      <div className="px-6 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between">
        <span>WBS: {ganttData.tasks.length}件 / 依存関係: {ganttData.links.length}件</span>
        <span>
          セルをクリックで直接編集 | ダブルクリックでクイック編集
        </span>
      </div>

      {/* Quick Edit Panel（フローティングパネル） */}
      {quickEditWbs && quickEditPosition && (
        <WbsQuickEditPanel
          wbs={quickEditWbs}
          position={quickEditPosition}
          onClose={handleQuickEditClose}
          onSave={handleQuickEditSave}
          onDelete={handleQuickEditDelete}
          onOpenFullEdit={handleOpenFullEdit}
        />
      )}

      {/* WBS詳細編集シート（新規作成・編集兼用） */}
      <WbsEditSheet
        wbs={editingWbs}
        open={isEditSheetOpen}
        allWbsItems={bffData?.wbsItems || []}
        planId={planId}
        onClose={() => {
          setIsEditSheetOpen(false)
          setEditingWbs(null)
        }}
        onSave={handleWbsSave}
        onDelete={editingWbs ? handleWbsDeleteFromSheet : undefined}
      />

      {/* 削除確認ダイアログ（EPMデザイン） */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>WBSを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTargetName}」を削除します。この操作は取り消せません。
              配下のWBSやタスクも一緒に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

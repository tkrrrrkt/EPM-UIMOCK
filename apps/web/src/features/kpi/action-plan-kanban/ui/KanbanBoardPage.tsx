"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { KanbanColumn } from "./KanbanColumn"
import { TaskCard } from "./TaskCard"
import { TaskDetailModal } from "./TaskDetailModal"
import { FilterPanel, type FilterValues } from "./FilterPanel"
import { LabelEditPopover } from "./LabelEditPopover"
import { createBffClient } from "../api"
import { getErrorMessage } from "../lib/error-messages"
import { toast } from "sonner"
import type { BffKanbanBoard, BffTaskCard, BffTaskStatus, BffTaskLabel } from "../types"

interface KanbanBoardPageProps {
  planId?: string
}

export function KanbanBoardPage({ planId = "plan-001" }: KanbanBoardPageProps) {
  const [client] = useState(() => createBffClient())
  const [board, setBoard] = useState<BffKanbanBoard | null>(null)
  const [statuses, setStatuses] = useState<BffTaskStatus[]>([])
  const [labels, setLabels] = useState<BffTaskLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<BffTaskCard | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    loadData()
  }, [planId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [boardData, statusesData, labelsData] = await Promise.all([
        client.getKanbanBoard(planId),
        client.getStatuses(planId),
        client.getLabels(planId),
      ])
      setBoard(boardData)
      setStatuses(statusesData.statuses)
      setLabels(labelsData.labels)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = board?.columns.flatMap((col) => col.tasks).find((t) => t.id === taskId)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over || !board) return

    const taskId = active.id as string
    const newStatusId = over.id as string

    // Find current task and status
    const currentColumn = board.columns.find((col) => col.tasks.some((t) => t.id === taskId))
    if (!currentColumn) return

    const task = currentColumn.tasks.find((t) => t.id === taskId)
    if (!task) return

    // If dropped on same column, ignore
    if (currentColumn.statusId === newStatusId) return

    // Find new column
    const newColumn = board.columns.find((col) => col.statusId === newStatusId)
    if (!newColumn) return

    try {
      // Update task status
      await client.updateTaskStatus(taskId, {
        statusId: newStatusId,
        sortOrder: newColumn.tasks.length + 1,
      })

      toast.success("タスクを移動しました")
      await loadData()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setIsDetailOpen(true)
  }

  const handleCreateTask = async (taskName: string, statusId: string) => {
    try {
      await client.createTask({
        wbsItemId: "wbs-001", // Mock WBS item
        taskName,
        statusId,
      })
      toast.success("タスクを作成しました")
      await loadData()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleUpdateStatus = async (
    statusId: string,
    updates: { statusName?: string; colorCode?: string; updatedAt: string },
  ) => {
    try {
      await client.updateStatus(statusId, updates)
      await loadData()
    } catch (error) {
      toast.error(getErrorMessage(error))
      throw error
    }
  }

  const handleDeleteStatus = async (statusId: string) => {
    try {
      await client.deleteStatus(statusId)
      toast.success("ステータスを削除しました")
      await loadData()
    } catch (error) {
      toast.error(getErrorMessage(error))
      throw error
    }
  }

  const handleCreateLabel = async (request: { labelCode: string; labelName: string; colorCode: string }) => {
    await client.createLabel(planId, request)
    await loadData()
  }

  const handleUpdateLabel = async (labelId: string, request: { labelName?: string; colorCode?: string; updatedAt: string }) => {
    await client.updateLabel(labelId, request)
    await loadData()
  }

  const handleDeleteLabel = async (labelId: string) => {
    await client.deleteLabel(labelId)
    await loadData()
  }

  const handleFilterChange = (filters: FilterValues) => {
    // Filter logic would be implemented here
    console.log("[kanban] Filters applied:", filters)
    toast.info("フィルタを適用しました")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">カンバンボードが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{board.planName}</h1>
            <p className="text-sm text-muted-foreground mt-1">アクションプランのタスク管理</p>
          </div>
          <div className="flex items-center gap-2">
            <FilterPanel
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              onFilterChange={handleFilterChange}
            />
            <LabelEditPopover
              planId={planId}
              labels={labels}
              onCreateLabel={handleCreateLabel}
              onUpdateLabel={handleUpdateLabel}
              onDeleteLabel={handleDeleteLabel}
            />
          </div>
        </div>
      </div>

      {/* Filter Panel (collapsible) */}
      {isFilterOpen && (
        <div className="px-6 pt-4">
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {board.columns.map((column) => {
              const status = statuses.find((s) => s.id === column.statusId)
              if (!status) return null

              return (
                <KanbanColumn
                  key={column.statusId}
                  column={column}
                  status={status}
                  onTaskClick={handleTaskClick}
                  onCreateTask={handleCreateTask}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteStatus={handleDeleteStatus}
                />
              )
            })}
          </div>

          <DragOverlay>{activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}</DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedTaskId(null)
          loadData()
        }}
        client={client}
        planId={planId}
        availableLabels={labels}
      />
    </div>
  )
}

'use client'

import * as React from 'react'
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective,
} from '@syncfusion/ej2-react-kanban'
import type { DragEventArgs, CardRenderedEventArgs } from '@syncfusion/ej2-kanban'
import { Calendar, CheckSquare, Users, Tag, Plus, Settings, MoreHorizontal } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { getBffClient } from '../api/client'
import type {
  BffKanbanBoard,
  BffKanbanColumn,
  BffTaskCard,
  KanbanTaskData,
  BffTaskStatus,
  BffTaskLabel,
  BffSelectableEmployee,
} from '../lib/types'
import { toKanbanTaskData } from '../lib/types'
import { TaskDetailModal } from './task-detail-modal'
import { CreateTaskDialog } from './create-task-dialog'
import { StatusSettingsDialog } from './status-settings-dialog'
import '../styles/syncfusion-kanban'

// ============================================
// Types
// ============================================

interface KanbanBoardProps {
  planId: string
}

// ============================================
// Main Component
// ============================================

export function KanbanBoard({ planId }: KanbanBoardProps) {
  const [board, setBoard] = React.useState<BffKanbanBoard | null>(null)
  const [tasks, setTasks] = React.useState<KanbanTaskData[]>([])
  const [columns, setColumns] = React.useState<BffKanbanColumn[]>([])
  const [statuses, setStatuses] = React.useState<BffTaskStatus[]>([])
  const [labels, setLabels] = React.useState<BffTaskLabel[]>([])
  const [employees, setEmployees] = React.useState<BffSelectableEmployee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Modal states
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [createDialogStatusId, setCreateDialogStatusId] = React.useState<string | null>(null)
  const [isStatusSettingsOpen, setIsStatusSettingsOpen] = React.useState(false)

  const kanbanRef = React.useRef<KanbanComponent>(null)

  // Data fetching
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const client = getBffClient()

      const [boardData, statusData, labelData, employeeData] = await Promise.all([
        client.getKanbanBoard(planId),
        client.getStatuses(planId),
        client.getLabels(planId),
        client.getSelectableEmployees(),
      ])

      setBoard(boardData)
      setColumns(boardData.columns)
      setStatuses(statusData)
      setLabels(labelData)
      setEmployees(employeeData)

      // Flatten tasks with status code
      const flatTasks: KanbanTaskData[] = []
      for (const column of boardData.columns) {
        for (const task of column.tasks) {
          flatTasks.push(toKanbanTaskData(task, column.statusCode))
        }
      }
      setTasks(flatTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Handle drag & drop
  const handleDragStop = React.useCallback(
    async (args: DragEventArgs) => {
      const draggedData = args.data as KanbanTaskData[]
      if (!draggedData || draggedData.length === 0) return

      const task = draggedData[0]
      const newStatusCode = task.Status

      // Find target column
      const targetColumn = columns.find((c) => c.statusCode === newStatusCode)
      if (!targetColumn) return

      try {
        const client = getBffClient()
        await client.updateTaskStatus(task.Id, {
          statusId: targetColumn.statusId,
          sortOrder: task.SortOrder,
        })
      } catch (err) {
        console.error('Failed to update task status:', err)
        // Reload to revert
        loadData()
      }
    },
    [columns, loadData]
  )

  // Handle card click
  const handleCardClick = React.useCallback((args: { data: KanbanTaskData }) => {
    setSelectedTaskId(args.data.Id)
  }, [])

  // Handle task creation
  const handleCreateTask = (statusId: string) => {
    setCreateDialogStatusId(statusId)
    setIsCreateDialogOpen(true)
  }

  const handleTaskCreated = async () => {
    setIsCreateDialogOpen(false)
    setCreateDialogStatusId(null)
    await loadData()
  }

  // Handle task detail close
  const handleTaskDetailClose = async (updated: boolean) => {
    setSelectedTaskId(null)
    if (updated) {
      await loadData()
    }
  }

  // Handle status settings
  const handleStatusSettingsClose = async (updated: boolean) => {
    setIsStatusSettingsOpen(false)
    if (updated) {
      await loadData()
    }
  }

  // Card template
  const cardTemplate = (data: KanbanTaskData) => {
    const isOverdue = data.DueDate && new Date(data.DueDate) < new Date()

    return (
      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        {/* Labels */}
        {data.Labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {data.Labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{ backgroundColor: label.colorCode, color: '#fff' }}
              >
                {label.labelName}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{data.Title}</h4>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {/* Due date */}
          {data.DueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(data.DueDate)}</span>
            </div>
          )}

          {/* Checklist progress */}
          {data.ChecklistTotal > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>
                {data.ChecklistCompleted}/{data.ChecklistTotal}
              </span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {data.Assignees.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Users className="w-3 h-3 text-gray-400" />
            <div className="flex -space-x-1">
              {data.Assignees.slice(0, 3).map((assignee) => (
                <div
                  key={assignee.employeeId}
                  className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border border-white"
                  title={assignee.employeeName}
                >
                  {assignee.employeeName.charAt(0)}
                </div>
              ))}
              {data.Assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border border-white">
                  +{data.Assignees.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Column header template
  const columnHeaderTemplate = (data: { keyField: string; headerText: string }) => {
    const column = columns.find((c) => c.statusCode === data.keyField)
    const taskCount = tasks.filter((t) => t.Status === data.keyField).length

    return (
      <div className="flex items-center justify-between w-full px-2 py-1">
        <div className="flex items-center gap-2">
          {column?.colorCode && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.colorCode }}
            />
          )}
          <span className="font-semibold text-gray-700">{data.headerText}</span>
          <span className="text-sm text-gray-400">({taskCount})</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => column && handleCreateTask(column.statusId)}>
              <Plus className="mr-2 h-4 w-4" />
              タスクを追加
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadData}>再読み込み</Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">{board?.planName}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsStatusSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            ステータス設定
          </Button>
          <Button size="sm" onClick={() => handleCreateTask(columns[0]?.statusId || '')}>
            <Plus className="mr-2 h-4 w-4" />
            タスク追加
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <KanbanComponent
          ref={kanbanRef}
          id="kanban"
          keyField="Status"
          dataSource={tasks}
          cardSettings={{
            contentField: 'Summary',
            headerField: 'Title',
            template: cardTemplate as unknown as string,
          }}
          cardClick={handleCardClick}
          dragStop={handleDragStop}
          enableTooltip={false}
          swimlaneSettings={{ keyField: '' }}
          allowDragAndDrop={true}
          cssClass="e-kanban-board"
        >
          <ColumnsDirective>
            {columns.map((column) => (
              <ColumnDirective
                key={column.statusId}
                keyField={column.statusCode}
                headerText={column.statusName}
                allowToggle={true}
                template={columnHeaderTemplate as unknown as string}
              />
            ))}
          </ColumnsDirective>
        </KanbanComponent>
      </div>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          planId={planId}
          statuses={statuses}
          labels={labels}
          employees={employees}
          onClose={handleTaskDetailClose}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        planId={planId}
        statusId={createDialogStatusId || undefined}
        onCreated={handleTaskCreated}
      />

      {/* Status Settings Dialog */}
      <StatusSettingsDialog
        open={isStatusSettingsOpen}
        onOpenChange={setIsStatusSettingsOpen}
        planId={planId}
        statuses={statuses}
        onClose={handleStatusSettingsClose}
      />
    </div>
  )
}

// ============================================
// Helpers
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

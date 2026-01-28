'use client'

import * as React from 'react'
import {
  GanttComponent,
  ColumnsDirective,
  ColumnDirective,
  Selection,
  Edit,
  Toolbar,
  Filter,
  Sort,
  Resize,
  DayMarkers,
  Inject,
  type IActionBeginEventArgs,
} from '@syncfusion/ej2-react-gantt'
import { registerLicense } from '@syncfusion/ej2-base'
import '../styles/syncfusion-gantt'
import { Button } from '@/shared/ui'
import { Plus, RefreshCw, Loader2 } from 'lucide-react'
import { getBffClient } from '../api/client'
import { toGanttDataSource, type GanttTaskData, type BffGanttData } from '../lib/types'
import { WbsEditDialog } from './wbs-edit-dialog'
import { WbsCreateDialog } from './wbs-create-dialog'

// Syncfusion License (環境変数から取得)
if (process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY) {
  registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY)
}

// ============================================
// Types
// ============================================

interface GanttChartProps {
  planId: string
}

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year'

// ============================================
// Main Component
// ============================================

export function GanttChart({ planId }: GanttChartProps) {
  const ganttRef = React.useRef<GanttComponent>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [ganttData, setGanttData] = React.useState<BffGanttData | null>(null)
  const [dataSource, setDataSource] = React.useState<GanttTaskData[]>([])
  const [viewMode, setViewMode] = React.useState<ViewMode>('Week')

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedWbsId, setSelectedWbsId] = React.useState<string | null>(null)
  const [parentWbsIdForCreate, setParentWbsIdForCreate] = React.useState<string | null>(null)

  // Fetch gantt data
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const client = getBffClient()
      const data = await client.getGanttData(planId)
      setGanttData(data)
      setDataSource(toGanttDataSource(data))
    } catch (err) {
      console.error('Failed to fetch gantt data:', err)
      setError('ガントチャートデータの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle task double-click (open edit dialog)
  const handleRecordDoubleClick = React.useCallback(
    (args: { rowData?: GanttTaskData; cancel?: boolean }) => {
      if (args.rowData?.TaskId) {
        args.cancel = true // Prevent default edit
        setSelectedWbsId(args.rowData.TaskId)
        setEditDialogOpen(true)
      }
    },
    []
  )

  // Handle taskbar drag (schedule update)
  const handleActionBegin = React.useCallback(
    async (args: IActionBeginEventArgs) => {
      if (args.requestType === 'save' && args.data) {
        const taskData = args.data as GanttTaskData
        try {
          const client = getBffClient()

          // Format dates
          const startDate = taskData.StartDate
            ? taskData.StartDate.toISOString().split('T')[0]
            : null
          const dueDate = taskData.EndDate ? taskData.EndDate.toISOString().split('T')[0] : null

          await client.updateWbsSchedule(taskData.TaskId, {
            startDate,
            dueDate,
          })
        } catch (err) {
          console.error('Failed to update schedule:', err)
          // Revert changes
          fetchData()
        }
      }
    },
    [fetchData]
  )

  // Handle add WBS button
  const handleAddWbs = React.useCallback(() => {
    const selected = ganttRef.current?.selectionModule?.getSelectedRecords()
    const parentId =
      selected && selected.length > 0 ? (selected[0] as GanttTaskData).TaskId : null
    setParentWbsIdForCreate(parentId)
    setCreateDialogOpen(true)
  }, [])

  // Handle dialog close
  const handleEditDialogClose = React.useCallback(
    (updated: boolean) => {
      setEditDialogOpen(false)
      setSelectedWbsId(null)
      if (updated) {
        fetchData()
      }
    },
    [fetchData]
  )

  const handleCreateDialogClose = React.useCallback(
    (created: boolean) => {
      setCreateDialogOpen(false)
      setParentWbsIdForCreate(null)
      if (created) {
        fetchData()
      }
    },
    [fetchData]
  )

  // View mode change
  const changeViewMode = React.useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (ganttRef.current) {
      const timelineSettings: { timelineViewMode: string; topTier: object; bottomTier: object } = {
        timelineViewMode: mode,
        topTier: { format: 'yyyy/MM' },
        bottomTier: { format: 'dd' },
      }

      switch (mode) {
        case 'Day':
          timelineSettings.topTier = { unit: 'Week', format: 'yyyy/MM/dd週' }
          timelineSettings.bottomTier = { unit: 'Day', format: 'dd(ddd)' }
          break
        case 'Week':
          timelineSettings.topTier = { unit: 'Month', format: 'yyyy/MM' }
          timelineSettings.bottomTier = { unit: 'Week', format: 'W週' }
          break
        case 'Month':
          timelineSettings.topTier = { unit: 'Year', format: 'yyyy' }
          timelineSettings.bottomTier = { unit: 'Month', format: 'MM' }
          break
        case 'Year':
          timelineSettings.topTier = { unit: 'Year', format: 'yyyy' }
          timelineSettings.bottomTier = { unit: 'Month', format: 'Q四半期' }
          break
      }
      ganttRef.current.timelineSettings = timelineSettings as unknown as typeof ganttRef.current.timelineSettings
    }
  }, [])

  // Task fields mapping
  const taskFields = {
    id: 'TaskId',
    name: 'TaskName',
    startDate: 'StartDate',
    endDate: 'EndDate',
    duration: 'Duration',
    progress: 'Progress',
    parentID: 'ParentId',
    dependency: 'Predecessor',
    milestone: 'isMilestone',
  }

  // Timeline settings
  const timelineSettings = {
    topTier: { unit: 'Month' as const, format: 'yyyy/MM' },
    bottomTier: { unit: 'Week' as const, format: 'W週' },
    timelineViewMode: 'Week' as const,
  }

  // Edit settings
  const editSettings = {
    allowEditing: true,
    allowTaskbarEditing: true,
    allowDeleting: false,
    allowAdding: false,
    mode: 'Auto' as const,
  }

  // Toolbar items
  const toolbarItems = ['ZoomIn', 'ZoomOut', 'ZoomToFit', 'ExpandAll', 'CollapseAll']

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          再読み込み
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-semibold">{ganttData?.planName || 'ガントチャート'}</h1>
          <p className="text-sm text-gray-500">
            WBS {dataSource.length}件
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['Day', 'Week', 'Month', 'Year'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => changeViewMode(mode)}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === mode
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'Day' && '日'}
                {mode === 'Week' && '週'}
                {mode === 'Month' && '月'}
                {mode === 'Year' && '年'}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button onClick={handleAddWbs}>
            <Plus className="mr-2 h-4 w-4" />
            WBS追加
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-hidden">
        <GanttComponent
          ref={ganttRef}
          dataSource={dataSource}
          taskFields={taskFields}
          height="100%"
          width="100%"
          highlightWeekends={true}
          allowSelection={true}
          allowSorting={true}
          allowFiltering={true}
          allowResizing={true}
          enableContextMenu={true}
          toolbar={toolbarItems}
          timelineSettings={timelineSettings}
          editSettings={editSettings}
          recordDoubleClick={handleRecordDoubleClick}
          actionBegin={handleActionBegin}
          labelSettings={{
            taskLabel: '${Progress}%',
          }}
          projectStartDate={new Date('2026-01-01')}
          projectEndDate={new Date('2026-12-31')}
          treeColumnIndex={1}
          collapseAllParentTasks={false}
        >
          <ColumnsDirective>
            <ColumnDirective field="WbsCode" headerText="WBS" width="100" />
            <ColumnDirective field="TaskName" headerText="タスク名" width="250" />
            <ColumnDirective
              field="StartDate"
              headerText="開始日"
              width="120"
              format="yMd"
            />
            <ColumnDirective field="EndDate" headerText="終了日" width="120" format="yMd" />
            <ColumnDirective field="Duration" headerText="期間" width="80" />
            <ColumnDirective field="Progress" headerText="進捗" width="80" />
            <ColumnDirective field="AssigneeName" headerText="担当者" width="120" />
          </ColumnsDirective>
          <Inject
            services={[Selection, Edit, Toolbar, Filter, Sort, Resize, DayMarkers]}
          />
        </GanttComponent>
      </div>

      {/* Edit Dialog */}
      {selectedWbsId && ganttData && (
        <WbsEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          wbsId={selectedWbsId}
          wbsData={ganttData.wbsItems.find((w) => w.id === selectedWbsId)!}
          planId={planId}
          onClose={handleEditDialogClose}
        />
      )}

      {/* Create Dialog */}
      <WbsCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        planId={planId}
        parentWbsId={parentWbsIdForCreate}
        onClose={handleCreateDialogClose}
      />
    </div>
  )
}

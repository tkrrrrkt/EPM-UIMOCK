"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card } from "@/shared/ui/components/card"
import { cn } from "@/lib/utils"
import { TaskCard } from "./TaskCard"
import { TaskCreateInput } from "./TaskCreateInput"
import { StatusEditPopover } from "./StatusEditPopover"
import type { BffKanbanColumn, BffTaskStatus } from "../types"

interface KanbanColumnProps {
  column: BffKanbanColumn
  status: BffTaskStatus
  onTaskClick: (taskId: string) => void
  onCreateTask: (taskName: string, statusId: string) => Promise<void>
  onUpdateStatus: (
    statusId: string,
    updates: { statusName?: string; colorCode?: string; updatedAt: string },
  ) => Promise<void>
  onDeleteStatus: (statusId: string) => Promise<void>
}

export function KanbanColumn({
  column,
  status,
  onTaskClick,
  onCreateTask,
  onUpdateStatus,
  onDeleteStatus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.statusId,
  })

  const taskIds = column.tasks.map((task) => task.id)

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.colorCode || "#6B7280" }} />
          <h3 className="font-semibold text-sm">{column.statusName}</h3>
          <span className="text-xs text-muted-foreground">({column.tasks.length})</span>
        </div>
        <StatusEditPopover
          status={status}
          onUpdate={onUpdateStatus}
          onDelete={onDeleteStatus}
          hasRelatedTasks={column.tasks.length > 0}
        />
      </div>

      <Card
        ref={setNodeRef}
        className={cn("flex-1 p-3 space-y-2 min-h-[200px] border-dashed", isOver && "bg-primary/5 border-primary")}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>

        <TaskCreateInput statusId={column.statusId} onSubmit={onCreateTask} />
      </Card>
    </div>
  )
}

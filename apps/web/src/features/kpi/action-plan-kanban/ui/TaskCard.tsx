"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback } from "@/shared/ui/components/avatar"
import { Badge } from "@/shared/ui/components/badge"
import { Card } from "@/shared/ui/components/card"
import { CheckSquare, Calendar, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BffTaskCard } from "../types"

interface TaskCardProps {
  task: BffTaskCard
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
  const hasChecklist = task.checklistProgress.total > 0

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("p-3 cursor-pointer hover:shadow-md transition-shadow", isDragging && "opacity-50")}
      onClick={onClick}
    >
      <div className="space-y-2">
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: label.colorCode,
                  color: "#fff",
                }}
              >
                {label.labelName}
              </Badge>
            ))}
          </div>
        )}

        <h4 className="font-medium text-sm leading-snug">{task.taskName}</h4>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {hasChecklist && (
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>
                  {task.checklistProgress.completed}/{task.checklistProgress.total}
                </span>
              </div>
            )}
            {task.dueDate && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString("ja-JP")}</span>
              </div>
            )}
          </div>

          {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.employeeId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">{assignee.employeeName.slice(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">+{task.assignees.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

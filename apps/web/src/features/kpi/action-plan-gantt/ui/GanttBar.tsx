"use client"

import { cn } from "@/lib/utils"
import type { WbsTreeNode } from "../types"

interface GanttBarProps {
  wbs: WbsTreeNode
  startDate: Date
  endDate: Date
  pixelsPerDay: number
  top: number
  onClick: () => void
  selected: boolean
}

export function GanttBar({ wbs, startDate, pixelsPerDay, top, onClick, selected }: GanttBarProps) {
  if (!wbs.startDate || !wbs.dueDate) {
    return null
  }

  const barStart = new Date(wbs.startDate)
  const barEnd = new Date(wbs.dueDate)

  const left = ((barStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay
  const width = ((barEnd.getTime() - barStart.getTime()) / (1000 * 60 * 60 * 24) + 1) * pixelsPerDay

  const progressWidth = wbs.progressRate ? (width * wbs.progressRate) / 100 : 0

  // Determine bar color based on status
  const isOverdue = wbs.dueDate && new Date(wbs.dueDate) < new Date() && (wbs.progressRate ?? 0) < 100
  const isCompleted = wbs.progressRate === 100

  return (
    <div
      className={cn(
        "absolute h-6 rounded cursor-pointer transition-all",
        "hover:ring-2 hover:ring-primary/50",
        selected && "ring-2 ring-primary",
        isOverdue ? "bg-destructive/20" : isCompleted ? "bg-green-100" : "bg-primary/20"
      )}
      style={{ left: `${left}px`, width: `${width}px`, top: `${top}px` }}
      onClick={onClick}
    >
      {/* Progress bar */}
      <div
        className={cn(
          "h-full rounded transition-all",
          isOverdue ? "bg-destructive" : isCompleted ? "bg-green-600" : "bg-primary"
        )}
        style={{ width: `${progressWidth}px` }}
      />

      {/* Label */}
      <div
        className="absolute inset-0 flex items-center px-2 overflow-hidden"
        title={wbs.wbsName}
      >
        <span className="text-xs font-medium text-foreground truncate">
          {wbs.wbsCode}
        </span>
      </div>
    </div>
  )
}

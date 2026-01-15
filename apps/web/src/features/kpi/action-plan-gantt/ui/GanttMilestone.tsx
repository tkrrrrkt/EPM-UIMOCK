"use client"

import { cn } from "@/lib/utils"
import type { WbsTreeNode } from "../types"

interface GanttMilestoneProps {
  wbs: WbsTreeNode
  startDate: Date
  pixelsPerDay: number
  top: number
  onClick: () => void
  selected: boolean
}

export function GanttMilestone({ wbs, startDate, pixelsPerDay, top, onClick, selected }: GanttMilestoneProps) {
  if (!wbs.startDate) {
    return null
  }

  const milestoneDate = new Date(wbs.startDate)
  const left = ((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay

  const isOverdue = new Date(wbs.startDate) < new Date()

  return (
    <div
      className="absolute flex items-center cursor-pointer"
      style={{ left: `${left - 12}px`, top: `${top}px` }}
      onClick={onClick}
    >
      {/* Diamond shape */}
      <div
        className={cn(
          "w-6 h-6 rotate-45 transition-all",
          "hover:ring-2 hover:ring-primary/50",
          selected && "ring-2 ring-primary",
          isOverdue ? "bg-destructive" : "bg-amber-500"
        )}
      />

      {/* Label */}
      <span
        className="ml-2 text-xs font-medium text-foreground whitespace-nowrap"
        title={wbs.wbsName}
      >
        {wbs.wbsCode}
      </span>
    </div>
  )
}

"use client"

import { Button } from "@/shared/ui/components/button"
import { Plus, Filter, KanbanSquare, Home } from "lucide-react"
import { PeriodSelector } from "./PeriodSelector"
import type { ViewPeriod } from "../types"
import Link from "next/link"

interface GanttHeaderProps {
  planName: string
  period: ViewPeriod
  onPeriodChange: (period: ViewPeriod) => void
  onFilterClick: () => void
  onAddWbs: () => void
  filterActive: boolean
}

export function GanttHeader({
  planName,
  period,
  onPeriodChange,
  onFilterClick,
  onAddWbs,
  filterActive,
}: GanttHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{planName}</h1>
            <p className="text-sm text-muted-foreground">ガントチャート</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={onPeriodChange} />

          <Button variant="outline" size="sm" onClick={onFilterClick} className={filterActive ? "border-primary" : ""}>
            <Filter className="h-4 w-4 mr-2" />
            フィルタ
          </Button>

          <Link href="/kpi/action-plan-kanban">
            <Button variant="outline" size="sm">
              <KanbanSquare className="h-4 w-4 mr-2" />
              カンバン
            </Button>
          </Link>

          <Button onClick={onAddWbs} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            WBS追加
          </Button>
        </div>
      </div>
    </div>
  )
}

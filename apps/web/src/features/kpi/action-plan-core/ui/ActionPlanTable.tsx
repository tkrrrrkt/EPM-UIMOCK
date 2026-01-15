"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/components/table"
import { Button } from "@/shared/ui/components/button"
import { Progress } from "@/shared/ui/components/progress"
import { ArrowUpDown, KanbanSquare, GanttChart } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { PriorityBadge } from "./PriorityBadge"
import type { BffActionPlanSummary, BffListPlansRequest } from "../types"
import Link from "next/link"

interface ActionPlanTableProps {
  plans: BffActionPlanSummary[]
  sortBy: BffListPlansRequest["sortBy"]
  sortOrder: BffListPlansRequest["sortOrder"]
  onSort: (field: NonNullable<BffListPlansRequest["sortBy"]>) => void
  onRowClick: (plan: BffActionPlanSummary) => void
  selectedId?: string | null
}

export function ActionPlanTable({ plans, sortBy, sortOrder, onSort, onRowClick, selectedId }: ActionPlanTableProps) {
  const SortButton = ({
    field,
    children,
  }: { field: NonNullable<BffListPlansRequest["sortBy"]>; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => onSort(field)} className="h-8 text-foreground hover:bg-accent">
      {children}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === field ? "text-primary" : "text-muted-foreground"}`} />
    </Button>
  )

  if (plans.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-muted-foreground">該当するアクションプランがありません</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">
              <SortButton field="planCode">コード</SortButton>
            </TableHead>
            <TableHead className="min-w-[180px]">
              <SortButton field="planName">プラン名</SortButton>
            </TableHead>
            <TableHead className="w-[90px]">
              <SortButton field="dueDate">期限</SortButton>
            </TableHead>
            <TableHead className="w-[80px]">
              <SortButton field="status">状態</SortButton>
            </TableHead>
            <TableHead className="w-[60px]">優先</TableHead>
            <TableHead className="w-[100px]">進捗</TableHead>
            <TableHead className="w-[70px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow
              key={plan.id}
              onClick={() => onRowClick(plan)}
              className={`group cursor-pointer transition-colors ${
                selectedId === plan.id
                  ? "bg-primary/10 hover:bg-primary/15 border-l-2 border-l-primary"
                  : "hover:bg-accent/50"
              }`}
            >
              <TableCell className="font-mono text-xs">
                {plan.planCode}
              </TableCell>
              <TableCell className="font-medium text-foreground text-sm truncate max-w-[200px]">
                {plan.planName}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) : "-"}
              </TableCell>
              <TableCell>
                <StatusBadge status={plan.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={plan.priority} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Progress value={plan.progressRate || 0} className="h-1.5 w-12" />
                  <span className="text-xs text-muted-foreground w-8">{plan.progressRate || 0}%</span>
                </div>
              </TableCell>
              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/kpi/action-plan-kanban?planId=${plan.id}`} title="カンバン">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <KanbanSquare className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/kpi/action-plan-gantt?planId=${plan.id}`} title="ガント">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <GanttChart className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

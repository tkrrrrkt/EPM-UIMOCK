import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Progress } from "@/shared/ui/components/progress"
import { StatusBadge } from "./StatusBadge"
import { AlertIcon } from "./AlertIcon"
import { DrilldownMenu } from "./DrilldownMenu"
import type { BffPlanSummary } from "../types"

interface PlanSummaryCardProps {
  plan: BffPlanSummary
}

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("ja-JP")
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{plan.planName}</CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {plan.isOverdue && <AlertIcon type="overdue" />}
            {plan.status === "delayed" && <AlertIcon type="delayed" />}
            <DrilldownMenu planId={plan.id} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">{plan.planCode}</span>
          <StatusBadge status={plan.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">担当部門:</span>
            <span className="font-medium">{plan.departmentName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">担当者:</span>
            <span className="font-medium">{plan.responsibleEmployeeName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">期間:</span>
            <span className="text-xs">
              {formatDate(plan.startDate)} 〜 {formatDate(plan.dueDate)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">WBS進捗</span>
              <span className="font-medium">{plan.wbsProgressRate !== null ? `${plan.wbsProgressRate}%` : "-"}</span>
            </div>
            <Progress value={plan.wbsProgressRate || 0} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">タスク完了率</span>
              <span className="font-medium">
                {plan.taskCompletionRate !== null ? `${plan.taskCompletionRate}%` : "-"}
              </span>
            </div>
            <Progress value={plan.taskCompletionRate || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

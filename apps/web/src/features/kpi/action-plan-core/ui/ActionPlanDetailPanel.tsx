"use client"

import { Button } from "@/shared/ui/components/button"
import { Badge } from "@/shared/ui/components/badge"
import { Progress } from "@/shared/ui/components/progress"
import { Separator } from "@/shared/ui/components/separator"
import { ScrollArea } from "@/shared/ui/components/scroll-area"
import {
  Edit,
  Trash2,
  Calendar,
  Users,
  Building,
  Target,
  ExternalLink,
  BarChart3,
  KanbanSquare,
  X,
  Loader2,
} from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { PriorityBadge } from "./PriorityBadge"
import type { BffActionPlanDetail } from "../types"
import Link from "next/link"

interface ActionPlanDetailPanelProps {
  plan: BffActionPlanDetail | null
  loading?: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  canDelete: boolean
}

export function ActionPlanDetailPanel({
  plan,
  loading,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ActionPlanDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <Target className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm">一覧からプランを選択してください</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col min-w-[320px]">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-5 py-3 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="font-mono text-xs">
            {plan.planCode}
          </Badge>
          <div className="flex items-center gap-1">
            {canEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={plan.status} />
          <PriorityBadge priority={plan.priority} />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold text-foreground leading-tight">{plan.planName}</h2>
            {plan.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
            )}
          </div>

          <Separator />

          {/* KPI科目 */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Target className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">紐付きKPI科目</p>
              <p className="text-sm font-medium text-foreground truncate">{plan.subjectName}</p>
            </div>
          </div>

          {/* 進捗 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">進捗率</span>
              <span className="text-lg font-bold text-primary">{plan.progressRate || 0}%</span>
            </div>
            <Progress value={plan.progressRate || 0} className="h-2" />
          </div>

          {/* 責任者・スケジュール */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building className="h-4 w-4" />
                <span className="text-xs">責任部門</span>
              </div>
              <p className="text-sm font-medium truncate">{plan.ownerDepartmentName || "未設定"}</p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">責任者</span>
              </div>
              <p className="text-sm font-medium truncate">{plan.ownerEmployeeName || "未設定"}</p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">開始日</span>
              </div>
              <p className="text-sm font-medium">
                {plan.startDate ? new Date(plan.startDate).toLocaleDateString("ja-JP") : "未設定"}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-destructive/70 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">期限</span>
              </div>
              <p className="text-sm font-medium">
                {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString("ja-JP") : "未設定"}
              </p>
            </div>
          </div>

          {/* WBS・タスク */}
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-lg border bg-card text-center">
              <div className="text-2xl font-bold text-primary">{plan.wbsCount}</div>
              <div className="text-xs text-muted-foreground">WBS</div>
            </div>
            <div className="flex-1 p-3 rounded-lg border bg-card text-center">
              <div className="text-2xl font-bold text-secondary">{plan.taskCount}</div>
              <div className="text-xs text-muted-foreground">タスク</div>
            </div>
          </div>

          <Separator />

          {/* アクションボタン */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">関連機能</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/kpi/action-plan-gantt/${plan.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  ガントチャート
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </Button>
              </Link>
              <Link href={`/kpi/action-plan-kanban/${plan.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <KanbanSquare className="h-4 w-4 mr-2" />
                  カンバン
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </Button>
              </Link>
            </div>
          </div>

          {/* メタ情報 */}
          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p>作成: {new Date(plan.createdAt).toLocaleString("ja-JP")}</p>
            <p>更新: {new Date(plan.updatedAt).toLocaleString("ja-JP")}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

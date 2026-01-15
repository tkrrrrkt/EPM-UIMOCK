"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/components/sheet"
import { Button } from "@/shared/ui/components/button"
import { Badge } from "@/shared/ui/components/badge"
import { Progress } from "@/shared/ui/components/progress"
import { Separator } from "@/shared/ui/components/separator"
import { Edit, Trash2, Calendar, Users, Building, Target, ExternalLink, BarChart3, KanbanSquare } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { PriorityBadge } from "./PriorityBadge"
import type { BffActionPlanDetail } from "../types"
import Link from "next/link"

interface ActionPlanDetailSheetProps {
  open: boolean
  plan: BffActionPlanDetail | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  canDelete: boolean
}

export function ActionPlanDetailSheet({
  open,
  plan,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ActionPlanDetailSheetProps) {
  if (!plan) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-foreground">アクションプラン詳細</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 基本情報 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">基本情報</h3>
              <div className="flex gap-2">
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-2">
                <span className="text-sm text-muted-foreground">プランコード</span>
                <span className="font-mono text-base font-medium text-foreground">{plan.planCode}</span>
              </div>

              <Separator />

              <div className="grid gap-2">
                <span className="text-sm text-muted-foreground">プラン名</span>
                <span className="text-base font-semibold text-foreground">{plan.planName}</span>
              </div>

              {plan.description && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <span className="text-sm text-muted-foreground">説明</span>
                    <p className="text-sm leading-relaxed text-foreground">{plan.description}</p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* KPI科目 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">紐付きKPI科目</h3>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <Target className="h-5 w-5 text-primary" />
              <span className="flex-1 font-medium text-foreground">{plan.subjectName}</span>
              <Badge variant="outline" className="text-xs">
                {plan.subjectId}
              </Badge>
            </div>
          </section>

          {/* 責任者情報 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">責任者情報</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Building className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">責任部門</span>
                  <p className="text-sm font-medium text-foreground">{plan.ownerDepartmentName || "未設定"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">責任者</span>
                  <p className="text-sm font-medium text-foreground">{plan.ownerEmployeeName || "未設定"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* スケジュール */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">スケジュール</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">開始日</span>
                  <p className="text-sm font-medium text-foreground">
                    {plan.startDate ? new Date(plan.startDate).toLocaleDateString("ja-JP") : "未設定"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Calendar className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">期限</span>
                  <p className="text-sm font-medium text-foreground">
                    {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString("ja-JP") : "未設定"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 進捗状況 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">進捗状況</h3>
            <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ステータス</span>
                <StatusBadge status={plan.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">優先度</span>
                <PriorityBadge priority={plan.priority} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">進捗率</span>
                  <span className="text-lg font-bold text-foreground">{plan.progressRate || 0}%</span>
                </div>
                <Progress value={plan.progressRate || 0} className="h-3" />
              </div>
            </div>
          </section>

          {/* WBS・タスクサマリ */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">配下のWBS・タスク</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-primary">{plan.wbsCount}</div>
                <div className="text-sm text-muted-foreground">WBS件数</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-secondary">{plan.taskCount}</div>
                <div className="text-sm text-muted-foreground">タスク件数</div>
              </div>
            </div>
          </section>

          {/* 遷移リンク */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">関連機能</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Link href={`/kpi/action-plan-gantt/${plan.id}`}>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  ガントチャートを開く
                  <ExternalLink className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/kpi/action-plan-kanban/${plan.id}`}>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <KanbanSquare className="mr-2 h-4 w-4" />
                  カンバンボードを開く
                  <ExternalLink className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* メタ情報 */}
          <section className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="grid gap-1 text-xs text-muted-foreground">
              <div>作成日時: {new Date(plan.createdAt).toLocaleString("ja-JP")}</div>
              <div>更新日時: {new Date(plan.updatedAt).toLocaleString("ja-JP")}</div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

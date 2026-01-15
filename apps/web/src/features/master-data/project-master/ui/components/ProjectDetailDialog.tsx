"use client"

import type { BffProjectDetailResponse, ProjectStatus } from "@epm/contracts/bff/project-master"
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Separator } from "@/shared/ui"

interface ProjectDetailDialogProps {
  project: BffProjectDetailResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (project: BffProjectDetailResponse) => void
  onDeactivate?: (id: string) => void
  onActivate?: (id: string) => void
}

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "計画中",
  ACTIVE: "実行中",
  ON_HOLD: "保留中",
  CLOSED: "完了",
}

const PROJECT_STATUS_VARIANTS: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  ON_HOLD: "outline",
  CLOSED: "secondary",
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onEdit,
  onDeactivate,
  onActivate,
}: ProjectDetailDialogProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>プロジェクト詳細</DialogTitle>
          <DialogDescription>プロジェクトの詳細情報を表示しています</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{project.projectName}</h3>
              <p className="text-sm text-muted-foreground">{project.projectCode}</p>
              {project.projectNameShort && (
                <p className="text-sm text-muted-foreground">略称: {project.projectNameShort}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={PROJECT_STATUS_VARIANTS[project.projectStatus]}>
                {PROJECT_STATUS_LABELS[project.projectStatus]}
              </Badge>
              <Badge variant={project.isActive ? "default" : "secondary"}>{project.isActive ? "有効" : "無効"}</Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">プロジェクトタイプ</p>
                <p className="text-base">{project.projectType || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">開始日</p>
                <p className="text-base">{formatDate(project.startDate)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">終了日</p>
                <p className="text-base">{formatDate(project.endDate)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">外部参照キー</p>
                <p className="text-base">{project.externalRef || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">親プロジェクトID</p>
                <p className="text-base font-mono text-xs">{project.parentProjectId || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">責任部門ID</p>
                <p className="text-base font-mono text-xs">{project.ownerDepartmentStableId || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">責任者ID</p>
                <p className="text-base font-mono text-xs">{project.ownerEmployeeId || "-"}</p>
              </div>
            </div>
          </div>

          {project.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">備考</p>
                <p className="text-base whitespace-pre-wrap">{project.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">作成日時</p>
              <p>{formatDateTime(project.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">更新日時</p>
              <p>{formatDateTime(project.updatedAt)}</p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2 justify-end">
            {project.isActive ? (
              <>
                {onEdit && (
                  <Button variant="default" onClick={() => onEdit(project)}>
                    編集
                  </Button>
                )}
                {onDeactivate && (
                  <Button variant="destructive" onClick={() => onDeactivate(project.id)}>
                    無効化
                  </Button>
                )}
              </>
            ) : (
              <>
                {onActivate && (
                  <Button variant="default" onClick={() => onActivate(project.id)}>
                    再有効化
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

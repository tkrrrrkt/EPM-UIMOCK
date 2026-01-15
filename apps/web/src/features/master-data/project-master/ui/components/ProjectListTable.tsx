"use client"

import type { BffProjectSummary, ProjectStatus } from "@epm/contracts/bff/project-master"
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui"

interface ProjectListTableProps {
  projects: BffProjectSummary[]
  onViewDetail: (id: string) => void
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

export function ProjectListTable({ projects, onViewDetail }: ProjectListTableProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("ja-JP")
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">プロジェクトが見つかりません</div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>プロジェクトコード</TableHead>
            <TableHead>プロジェクト名</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>開始日</TableHead>
            <TableHead>終了日</TableHead>
            <TableHead>有効状態</TableHead>
            <TableHead className="w-24">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.projectCode}</TableCell>
              <TableCell>{project.projectName}</TableCell>
              <TableCell>
                <Badge variant={PROJECT_STATUS_VARIANTS[project.projectStatus]}>
                  {PROJECT_STATUS_LABELS[project.projectStatus]}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>{formatDate(project.endDate)}</TableCell>
              <TableCell>
                <Badge variant={project.isActive ? "default" : "secondary"}>{project.isActive ? "有効" : "無効"}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onViewDetail(project.id)}>
                  詳細
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, ChevronsUpDown, AlertTriangle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui'
import type { BffProjectSummary, ProjectStatus } from '@epm/contracts/bff/project-profitability'

interface ProjectListProps {
  projects: BffProjectSummary[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

const statusLabels: Record<ProjectStatus, string> = {
  PLANNED: '計画中',
  ACTIVE: '進行中',
  ON_HOLD: '保留中',
  CLOSED: '完了',
}

const statusStyles: Record<ProjectStatus, string> = {
  PLANNED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  ACTIVE: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  ON_HOLD: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  CLOSED: 'bg-muted text-muted-foreground',
}

const formatCurrency = (value: number) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}億`
  }
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(0)},000万`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`
  }
  return new Intl.NumberFormat('ja-JP').format(value)
}

const formatPercent = (value: number) => {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}%`
}

export function ProjectList({
  projects,
  sortBy,
  sortOrder,
  onSort,
  totalCount,
  page,
  pageSize,
  onPageChange,
}: ProjectListProps) {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleRowClick = (projectId: string) => {
    router.push(`/report/project-profitability/${projectId}`)
  }

  const SortHeader = ({ column, label, className }: { column: string; label: string; className?: string }) => {
    const isActive = sortBy === column
    return (
      <th
        className={cn('p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/30 whitespace-nowrap', className)}
        onClick={() => onSort(column)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive ? (
            sortOrder === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
      </th>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-center text-sm font-medium w-10"></th>
              <th className="p-3 text-left text-sm font-medium whitespace-nowrap">PJコード</th>
              <SortHeader column="projectName" label="PJ名" />
              <SortHeader column="departmentName" label="責任部門" />
              <th className="p-3 text-center text-sm font-medium whitespace-nowrap">ステータス</th>
              <th className="p-3 text-center text-sm font-medium whitespace-nowrap">期間</th>
              <SortHeader column="revenueBudget" label="売上予算" className="text-right" />
              <SortHeader column="revenueProjection" label="着地予測" className="text-right" />
              <SortHeader column="grossProfitRate" label="粗利率" className="text-right" />
              <th className="p-3 text-center text-sm font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-sm text-muted-foreground">
                  該当するプロジェクトがありません
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors group"
                  onClick={() => handleRowClick(project.id)}
                >
                  <td className="p-3 text-center">
                    {project.isWarning && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-sm font-mono text-muted-foreground">
                    {project.projectCode}
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium">{project.projectName}</span>
                  </td>
                  <td className="p-3 text-sm">{project.departmentName}</td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        statusStyles[project.status]
                      )}
                    >
                      {statusLabels[project.status]}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-center text-muted-foreground whitespace-nowrap">
                    {/* 期間はMockから取得できないため仮表示 */}
                    -
                  </td>
                  <td className="p-3 text-sm text-right font-mono whitespace-nowrap">
                    {formatCurrency(project.revenueBudget)}
                  </td>
                  <td className="p-3 text-sm text-right font-mono whitespace-nowrap">
                    {formatCurrency(project.revenueProjection)}
                  </td>
                  <td className={cn(
                    'p-3 text-sm text-right font-mono font-medium whitespace-nowrap',
                    project.grossProfitRate < 0 && 'text-red-600 dark:text-red-400'
                  )}>
                    {formatPercent(project.grossProfitRate)}
                  </td>
                  <td className="p-3 text-center">
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          全 {totalCount} 件中 {totalCount > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalCount)} 件
        </p>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              前へ
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

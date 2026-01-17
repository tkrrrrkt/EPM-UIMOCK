'use client'

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui'
import type { BffApprovalSummary, ApprovalStatus, ScenarioType } from '@epm/contracts/bff/approval'

interface ApprovalListProps {
  approvals: BffApprovalSummary[]
  selectedId: string | null
  onSelect: (approval: BffApprovalSummary) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

const statusLabels: Record<ApprovalStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  APPROVED: '承認済み',
  REJECTED: '差し戻し',
  WITHDRAWN: '取り下げ',
}

const statusStyles: Record<ApprovalStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  APPROVED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  WITHDRAWN: 'bg-muted text-muted-foreground',
}

const scenarioLabels: Record<ScenarioType, string> = {
  BUDGET: '予算',
  FORECAST: '見込',
}

export function ApprovalList({
  approvals,
  selectedId,
  onSelect,
  sortBy,
  sortOrder,
  onSort,
  totalCount,
  page,
  pageSize,
  onPageChange,
}: ApprovalListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  const SortHeader = ({ column, label }: { column: string; label: string }) => {
    const isActive = sortBy === column
    return (
      <th
        className="p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/30"
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
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <SortHeader column="departmentName" label="部門" />
              <SortHeader column="eventName" label="イベント" />
              <th className="p-3 text-left text-sm font-medium">種別</th>
              <th className="p-3 text-center text-sm font-medium">ステップ</th>
              <th className="p-3 text-center text-sm font-medium">状態</th>
              <SortHeader column="submittedAt" label="提出日時" />
              <th className="p-3 text-left text-sm font-medium">提出者</th>
            </tr>
          </thead>
          <tbody>
            {approvals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  承認待ちの案件はありません
                </td>
              </tr>
            ) : (
              approvals.map((approval) => (
                <tr
                  key={approval.id}
                  className={cn(
                    'border-b hover:bg-muted/30 cursor-pointer transition-colors',
                    selectedId === approval.id && 'bg-muted/50'
                  )}
                  onClick={() => onSelect(approval)}
                >
                  <td className="p-3 text-sm font-medium">{approval.departmentName}</td>
                  <td className="p-3 text-sm">{approval.eventName}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        approval.scenarioType === 'BUDGET'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      )}
                    >
                      {scenarioLabels[approval.scenarioType]}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    <span className="font-mono">{approval.currentStep}/5</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        statusStyles[approval.status]
                      )}
                    >
                      {statusLabels[approval.status]}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {approval.submittedAt
                      ? new Date(approval.submittedAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="p-3 text-sm">{approval.submittedByEmployeeName || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            全 {totalCount} 件中 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} 件
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              前へ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

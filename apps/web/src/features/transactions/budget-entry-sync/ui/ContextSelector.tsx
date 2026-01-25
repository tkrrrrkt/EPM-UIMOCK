"use client"

import * as React from "react"
import { Label } from "@/shared/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import type { BffBudgetContextResponse } from "@epm/contracts/bff/budget-entry"

// ============================================
// Types
// ============================================

interface ContextSelectorProps {
  context: BffBudgetContextResponse | null
  selectedFiscalYear: number | null
  selectedDepartmentId: string | null
  selectedPlanEventId: string | null
  selectedPlanVersionId: string | null
  compareVersionId: string | null
  onFiscalYearChange: (value: number) => void
  onDepartmentChange: (value: string) => void
  onPlanEventChange: (value: string) => void
  onPlanVersionChange: (value: string) => void
  onCompareVersionChange: (value: string | null) => void
  isLoading?: boolean
}

// ============================================
// Component
// ============================================

export function ContextSelector({
  context,
  selectedFiscalYear,
  selectedDepartmentId,
  selectedPlanEventId,
  selectedPlanVersionId,
  compareVersionId,
  onFiscalYearChange,
  onDepartmentChange,
  onPlanEventChange,
  onPlanVersionChange,
  onCompareVersionChange,
  isLoading = false,
}: ContextSelectorProps) {
  const availableCompareVersions = React.useMemo(() => {
    if (!context?.planVersions || !selectedPlanVersionId) return []
    return context.planVersions.filter((v) => v.id !== selectedPlanVersionId)
  }, [context?.planVersions, selectedPlanVersionId])

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-card border rounded-lg">
      {/* 年度 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fiscal-year" className="text-xs text-muted-foreground">
          年度
        </Label>
        <Select
          value={selectedFiscalYear?.toString() ?? ""}
          onValueChange={(value) => onFiscalYearChange(parseInt(value, 10))}
          disabled={isLoading || !context}
        >
          <SelectTrigger id="fiscal-year" className="w-[140px]">
            <SelectValue placeholder="年度を選択" />
          </SelectTrigger>
          <SelectContent>
            {context?.fiscalYears.map((fy) => (
              <SelectItem key={fy.value} value={fy.value.toString()}>
                {fy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 部門 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="department" className="text-xs text-muted-foreground">
          部門
        </Label>
        <Select
          value={selectedDepartmentId ?? ""}
          onValueChange={onDepartmentChange}
          disabled={isLoading || !context}
        >
          <SelectTrigger id="department" className="w-[180px]">
            <SelectValue placeholder="部門を選択" />
          </SelectTrigger>
          <SelectContent>
            {context?.departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 計画イベント */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="plan-event" className="text-xs text-muted-foreground">
          シナリオ
        </Label>
        <Select
          value={selectedPlanEventId ?? ""}
          onValueChange={onPlanEventChange}
          disabled={isLoading || !context}
        >
          <SelectTrigger id="plan-event" className="w-[180px]">
            <SelectValue placeholder="シナリオを選択" />
          </SelectTrigger>
          <SelectContent>
            {context?.planEvents.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* バージョン */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="plan-version" className="text-xs text-muted-foreground">
          バージョン
        </Label>
        <Select
          value={selectedPlanVersionId ?? ""}
          onValueChange={onPlanVersionChange}
          disabled={isLoading || !context}
        >
          <SelectTrigger id="plan-version" className="w-[140px]">
            <SelectValue placeholder="バージョンを選択" />
          </SelectTrigger>
          <SelectContent>
            {context?.planVersions.map((version) => (
              <SelectItem key={version.id} value={version.id}>
                {version.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 比較バージョン */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="compare-version" className="text-xs text-muted-foreground">
          比較対象
        </Label>
        <Select
          value={compareVersionId ?? "none"}
          onValueChange={(value) =>
            onCompareVersionChange(value === "none" ? null : value)
          }
          disabled={isLoading || !context || availableCompareVersions.length === 0}
        >
          <SelectTrigger id="compare-version" className="w-[140px]">
            <SelectValue placeholder="比較しない" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">比較しない</SelectItem>
            {availableCompareVersions.map((version) => (
              <SelectItem key={version.id} value={version.id}>
                {version.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import type {
  BffVarianceReportFilters,
  VarianceComparisonMode,
  VariancePeriodType,
} from "@epm/contracts/bff/variance-report"

interface VarianceFiltersProps {
  filters: BffVarianceReportFilters
  onComparisonModeChange: (value: VarianceComparisonMode) => void
  onPeriodTypeChange: (value: VariancePeriodType) => void
  onMonthChange: (value: string) => void
}

export function VarianceFilters({
  filters,
  onComparisonModeChange,
  onPeriodTypeChange,
  onMonthChange,
}: VarianceFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">比較軸</label>
        <Select
          value={filters.comparisonMode}
          onValueChange={(v) => onComparisonModeChange(v as VarianceComparisonMode)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget_actual">予算 vs 実績+見込</SelectItem>
            <SelectItem value="forecast_previous">今回見込 vs 前回見込</SelectItem>
            <SelectItem value="year_over_year">当年 vs 前年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">期間タイプ</label>
        <Select
          value={filters.periodType}
          onValueChange={(v) => onPeriodTypeChange(v as VariancePeriodType)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">月次</SelectItem>
            <SelectItem value="cumulative">累計</SelectItem>
            <SelectItem value="quarterly">四半期</SelectItem>
            <SelectItem value="annual">通期</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filters.periodType === "monthly" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">対象月</label>
          <Select value={filters.selectedMonth ?? ""} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">2025年1月</SelectItem>
              <SelectItem value="2025-02">2025年2月</SelectItem>
              <SelectItem value="2025-03">2025年3月</SelectItem>
              <SelectItem value="2025-04">2025年4月</SelectItem>
              <SelectItem value="2025-05">2025年5月</SelectItem>
              <SelectItem value="2025-06">2025年6月</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

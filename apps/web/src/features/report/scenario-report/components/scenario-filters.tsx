"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import type { BffScenarioReportFilters } from "@epm/contracts/bff/scenario-report"

interface ScenarioFiltersProps {
  filters: BffScenarioReportFilters
  onFiscalYearChange: (value: string) => void
  onAccountTypeChange: (value: BffScenarioReportFilters["accountType"]) => void
}

export function ScenarioFilters({
  filters,
  onFiscalYearChange,
  onAccountTypeChange,
}: ScenarioFiltersProps) {
  return (
    <div className="px-6 pb-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">期間:</span>
        <Select value={filters.fiscalYear} onValueChange={onFiscalYearChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024年度</SelectItem>
            <SelectItem value="2023">2023年度</SelectItem>
            <SelectItem value="2022">2022年度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">表示単位:</span>
        <Select
          value={filters.accountType}
          onValueChange={(v) => onAccountTypeChange(v as BffScenarioReportFilters["accountType"])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">売上</SelectItem>
            <SelectItem value="gross_profit">粗利</SelectItem>
            <SelectItem value="operating_profit">営業利益</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

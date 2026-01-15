"use client"

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/shared/ui"
import { Download } from "lucide-react"

export interface FilterState {
  fiscalYear: string
  accountType: string
  comparisonYear: string
}

interface BudgetTrendFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function BudgetTrendFilters({ filters, onFiltersChange }: BudgetTrendFiltersProps) {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">会計年度</Label>
        <Select
          value={filters.fiscalYear}
          onValueChange={(value) => onFiltersChange({ ...filters, fiscalYear: value })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024年度</SelectItem>
            <SelectItem value="2023">2023年度</SelectItem>
            <SelectItem value="2022">2022年度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">科目種別</Label>
        <Select
          value={filters.accountType}
          onValueChange={(value) => onFiltersChange({ ...filters, accountType: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">売上高</SelectItem>
            <SelectItem value="gross_profit">粗利益</SelectItem>
            <SelectItem value="operating_profit">営業利益</SelectItem>
            <SelectItem value="all">全体</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">比較年度</Label>
        <Select
          value={filters.comparisonYear}
          onValueChange={(value) => onFiltersChange({ ...filters, comparisonYear: value })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023年度</SelectItem>
            <SelectItem value="2022">2022年度</SelectItem>
            <SelectItem value="2021">2021年度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        エクスポート
      </Button>
    </div>
  )
}

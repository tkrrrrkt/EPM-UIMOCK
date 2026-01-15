"use client"

import { Input } from "@/shared/ui"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui"
import type { LayoutType, BffGroupLayoutListRequest } from "@epm/contracts/bff/group-report-layout"

interface LayoutFiltersProps {
  filters: Omit<BffGroupLayoutListRequest, "page" | "pageSize">
  onFilterChange: (filters: Partial<BffGroupLayoutListRequest>) => void
}

export function LayoutFilters({ filters, onFilterChange }: LayoutFiltersProps) {
  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ keyword })
  }

  const handleLayoutTypeChange = (value: string) => {
    onFilterChange({ layoutType: value === "all" ? undefined : (value as LayoutType) })
  }

  const handleIsActiveChange = (value: string) => {
    onFilterChange({
      isActive: value === "all" ? undefined : value === "active" ? true : false,
    })
  }

  const layoutTypeValue = filters.layoutType || "all"
  const isActiveValue = filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive"

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">検索</label>
        <Input
          placeholder="レイアウトコード・レイアウト名で検索"
          value={filters.keyword || ""}
          onChange={(e) => handleKeywordChange(e.target.value)}
        />
      </div>
      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">レイアウト種別</label>
        <Select value={layoutTypeValue} onValueChange={handleLayoutTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="PL">連結損益計算書</SelectItem>
            <SelectItem value="BS">連結貸借対照表</SelectItem>
            <SelectItem value="KPI">連結KPI指標</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">状態</label>
        <Select value={isActiveValue} onValueChange={handleIsActiveChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="active">有効のみ</SelectItem>
            <SelectItem value="inactive">無効のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

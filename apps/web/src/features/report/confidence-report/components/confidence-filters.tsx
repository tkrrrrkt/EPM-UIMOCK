"use client"

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { Calendar, Building2, User, BarChart3, Download } from "lucide-react"

export interface FilterState {
  period: string
  organization: string
  accountType: string
  owner: string
}

interface ConfidenceFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function ConfidenceFilters({ filters, onFiltersChange }: ConfidenceFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={filters.period}
        onValueChange={(value) => onFiltersChange({ ...filters, period: value })}
      >
        <SelectTrigger className="w-[160px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FY2025">FY2025（当期通期）</SelectItem>
          <SelectItem value="2025-10">2025年10月</SelectItem>
          <SelectItem value="2025-11">2025年11月</SelectItem>
          <SelectItem value="2025-12">2025年12月</SelectItem>
          <SelectItem value="2025-Q4">2025年Q4</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.organization}
        onValueChange={(value) => onFiltersChange({ ...filters, organization: value })}
      >
        <SelectTrigger className="w-[160px]">
          <Building2 className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全組織</SelectItem>
          <SelectItem value="sales">営業本部</SelectItem>
          <SelectItem value="sales-1">第一営業部</SelectItem>
          <SelectItem value="sales-2">第二営業部</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.accountType}
        onValueChange={(value) => onFiltersChange({ ...filters, accountType: value })}
      >
        <SelectTrigger className="w-[140px]">
          <BarChart3 className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="revenue">売上ベース</SelectItem>
          <SelectItem value="gross_profit">粗利ベース</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.owner}
        onValueChange={(value) => onFiltersChange({ ...filters, owner: value })}
      >
        <SelectTrigger className="w-[160px]">
          <User className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全担当者</SelectItem>
          <SelectItem value="tanaka">田中太郎</SelectItem>
          <SelectItem value="suzuki">鈴木花子</SelectItem>
          <SelectItem value="sato">佐藤一郎</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        エクスポート
      </Button>
    </div>
  )
}

'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { BffDepartmentOption, BffStatusOption } from '@epm/contracts/bff/project-profitability'

interface ProjectSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  departmentStableId: string
  onDepartmentChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  departments: BffDepartmentOption[]
  statuses: BffStatusOption[]
}

export function ProjectSearchPanel({
  keyword,
  onKeywordChange,
  departmentStableId,
  onDepartmentChange,
  status,
  onStatusChange,
  departments,
  statuses,
}: ProjectSearchPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* キーワード検索 */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="PJコード・PJ名で検索..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 部門フィルター */}
      <Select value={departmentStableId} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="部門" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべての部門</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.stableId} value={dept.stableId}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ステータスフィルター */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

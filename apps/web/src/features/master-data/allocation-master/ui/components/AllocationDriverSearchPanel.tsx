'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { DRIVER_TYPE_LABELS } from '../constants'

interface AllocationDriverSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  driverTypeFilter: string
  onDriverTypeFilterChange: (value: string) => void
}

export function AllocationDriverSearchPanel({
  keyword,
  onKeywordChange,
  driverTypeFilter,
  onDriverTypeFilterChange,
}: AllocationDriverSearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ドライバコード・名称で検索..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[150px]">
        <Select value={driverTypeFilter} onValueChange={onDriverTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="ドライバタイプ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのタイプ</SelectItem>
            {Object.entries(DRIVER_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

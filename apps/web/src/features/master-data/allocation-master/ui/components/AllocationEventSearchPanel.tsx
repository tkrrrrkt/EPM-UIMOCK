'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { SCENARIO_TYPE_LABELS } from '../constants'

interface AllocationEventSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  scenarioTypeFilter: string
  onScenarioTypeFilterChange: (value: string) => void
  isActiveFilter: string
  onIsActiveFilterChange: (value: string) => void
}

export function AllocationEventSearchPanel({
  keyword,
  onKeywordChange,
  scenarioTypeFilter,
  onScenarioTypeFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: AllocationEventSearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="イベントコード・名称で検索..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[150px]">
        <Select value={scenarioTypeFilter} onValueChange={onScenarioTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="シナリオ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのシナリオ</SelectItem>
            {Object.entries(SCENARIO_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[120px]">
        <Select value={isActiveFilter} onValueChange={onIsActiveFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての状態</SelectItem>
            <SelectItem value="true">有効</SelectItem>
            <SelectItem value="false">無効</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

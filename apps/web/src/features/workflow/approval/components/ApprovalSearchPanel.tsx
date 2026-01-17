'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { ScenarioType } from '@epm/contracts/bff/approval'

interface ApprovalSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  scenarioType: string
  onScenarioTypeChange: (value: string) => void
}

export function ApprovalSearchPanel({
  keyword,
  onKeywordChange,
  scenarioType,
  onScenarioTypeChange,
}: ApprovalSearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="部門名・イベント名で検索..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={scenarioType} onValueChange={onScenarioTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="種別" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="BUDGET">予算</SelectItem>
          <SelectItem value="FORECAST">見込</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

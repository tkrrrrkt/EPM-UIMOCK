'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

interface RoleSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  isActiveFilter: string
  onIsActiveFilterChange: (value: string) => void
}

export function RoleSearchPanel({
  keyword,
  onKeywordChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: RoleSearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ロールコード・ロール名で検索..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[160px]">
        <Select value={isActiveFilter} onValueChange={onIsActiveFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="true">有効のみ</SelectItem>
            <SelectItem value="false">無効のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

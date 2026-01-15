'use client'

import { Search } from 'lucide-react'
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { CONSOLIDATION_TYPE_LABELS } from '../constants'

interface CompanySearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  isActiveFilter: string
  onIsActiveFilterChange: (value: string) => void
  consolidationTypeFilter: string
  onConsolidationTypeFilterChange: (value: string) => void
}

export function CompanySearchPanel({
  keyword,
  onKeywordChange,
  isActiveFilter,
  onIsActiveFilterChange,
  consolidationTypeFilter,
  onConsolidationTypeFilterChange,
}: CompanySearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-64">
        <Label htmlFor="keyword" className="sr-only">
          検索キーワード
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="keyword"
            placeholder="法人コード・法人名で検索"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-40">
        <Label htmlFor="isActive" className="sr-only">
          状態
        </Label>
        <Select value={isActiveFilter} onValueChange={onIsActiveFilterChange}>
          <SelectTrigger id="isActive">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="true">有効のみ</SelectItem>
            <SelectItem value="false">無効のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="consolidationType" className="sr-only">
          連結種別
        </Label>
        <Select value={consolidationTypeFilter} onValueChange={onConsolidationTypeFilterChange}>
          <SelectTrigger id="consolidationType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(CONSOLIDATION_TYPE_LABELS).map(([value, label]) => (
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

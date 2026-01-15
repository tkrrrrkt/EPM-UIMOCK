'use client'

import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  Button,
} from '@/shared/ui'
import { Search, X } from 'lucide-react'

interface MappingFilterPanelProps {
  keyword: string
  subjectType: string
  subjectClass: string
  mappingStatus: string
  isActive: string
  onKeywordChange: (value: string) => void
  onSubjectTypeChange: (value: string) => void
  onSubjectClassChange: (value: string) => void
  onMappingStatusChange: (value: string) => void
  onIsActiveChange: (value: string) => void
  onReset: () => void
}

export function MappingFilterPanel({
  keyword,
  subjectType,
  subjectClass,
  mappingStatus,
  isActive,
  onKeywordChange,
  onSubjectTypeChange,
  onSubjectClassChange,
  onMappingStatusChange,
  onIsActiveChange,
  onReset,
}: MappingFilterPanelProps) {
  const hasActiveFilters =
    keyword ||
    subjectType !== 'all' ||
    subjectClass !== 'all' ||
    mappingStatus !== 'all' ||
    isActive !== 'all'

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="keyword" className="text-sm font-medium mb-2 block">
            キーワード
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="コード・名称で検索"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subjectType" className="text-sm font-medium mb-2 block">
            科目タイプ
          </Label>
          <Select value={subjectType} onValueChange={onSubjectTypeChange}>
            <SelectTrigger id="subjectType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="FIN">FIN</SelectItem>
              <SelectItem value="KPI">KPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subjectClass" className="text-sm font-medium mb-2 block">
            科目クラス
          </Label>
          <Select value={subjectClass} onValueChange={onSubjectClassChange}>
            <SelectTrigger id="subjectClass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="BASE">BASE</SelectItem>
              <SelectItem value="AGGREGATE">AGGREGATE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="mappingStatus" className="text-sm font-medium mb-2 block">
            マッピング状態
          </Label>
          <Select value={mappingStatus} onValueChange={onMappingStatusChange}>
            <SelectTrigger id="mappingStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="mapped">マッピング済み</SelectItem>
              <SelectItem value="unmapped">未設定</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="w-full bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            リセット
          </Button>
        </div>
      </div>
    </Card>
  )
}

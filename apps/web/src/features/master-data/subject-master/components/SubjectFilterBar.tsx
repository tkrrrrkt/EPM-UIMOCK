"use client"

import {
  Input,
  Button,
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui"
import { Search, X } from "lucide-react"
import type { BffSubjectTreeRequest } from "@contracts/bff/subject-master"

interface SubjectFilterBarProps {
  filters: BffSubjectTreeRequest
  onFiltersChange: (filters: BffSubjectTreeRequest) => void
}

export function SubjectFilterBar({ filters, onFiltersChange }: SubjectFilterBarProps) {
  const handleClearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters =
    filters.keyword || filters.subjectType || filters.subjectClass || filters.isActive !== undefined

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">フィルター</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-1" />
            クリア
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="keyword" className="text-xs">
            キーワード
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="科目コード・名前で検索"
              value={filters.keyword || ""}
              onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subjectType" className="text-xs">
            科目タイプ
          </Label>
          <Select
            value={filters.subjectType || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, subjectType: value === "all" ? undefined : (value as "FIN" | "KPI") })
            }
          >
            <SelectTrigger id="subjectType">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="FIN">FIN（財務）</SelectItem>
              <SelectItem value="KPI">KPI（業績指標）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subjectClass" className="text-xs">
            科目クラス
          </Label>
          <Select
            value={filters.subjectClass || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                subjectClass: value === "all" ? undefined : (value as "BASE" | "AGGREGATE"),
              })
            }
          >
            <SelectTrigger id="subjectClass">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="BASE">通常科目</SelectItem>
              <SelectItem value="AGGREGATE">集計科目</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="isActive" className="text-xs">
            有効状態
          </Label>
          <Select
            value={filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, isActive: value === "all" ? undefined : value === "active" })
            }
          >
            <SelectTrigger id="isActive">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="inactive">無効</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

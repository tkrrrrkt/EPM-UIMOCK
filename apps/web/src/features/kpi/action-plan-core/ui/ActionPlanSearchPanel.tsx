"use client"

import { Input } from "@/shared/ui/components/input"
import { Button } from "@/shared/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Search, X } from "lucide-react"
import type { ActionPlanStatus, ActionPlanPriority } from "../types"

interface ActionPlanSearchPanelProps {
  keyword: string
  status: ActionPlanStatus | undefined
  priority: ActionPlanPriority | undefined
  onKeywordChange: (value: string) => void
  onStatusChange: (value: ActionPlanStatus | undefined) => void
  onPriorityChange: (value: ActionPlanPriority | undefined) => void
  onSearch: () => void
  onClear: () => void
}

export function ActionPlanSearchPanel({
  keyword,
  status,
  priority,
  onKeywordChange,
  onStatusChange,
  onPriorityChange,
  onSearch,
  onClear,
}: ActionPlanSearchPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">キーワード検索</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="プランコード、プラン名、KPI科目"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">ステータス</label>
          <Select
            value={status || "all"}
            onValueChange={(v) => onStatusChange(v === "all" ? undefined : (v as ActionPlanStatus))}
          >
            <SelectTrigger>
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="NOT_STARTED">未着手</SelectItem>
              <SelectItem value="IN_PROGRESS">進行中</SelectItem>
              <SelectItem value="COMPLETED">完了</SelectItem>
              <SelectItem value="CANCELLED">中止</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">優先度</label>
          <Select
            value={priority || "all"}
            onValueChange={(v) => onPriorityChange(v === "all" ? undefined : (v as ActionPlanPriority))}
          >
            <SelectTrigger>
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="HIGH">高</SelectItem>
              <SelectItem value="MEDIUM">中</SelectItem>
              <SelectItem value="LOW">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSearch} className="flex-1 md:flex-none">
          <Search className="mr-2 h-4 w-4" />
          検索
        </Button>
        <Button variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          クリア
        </Button>
      </div>
    </div>
  )
}

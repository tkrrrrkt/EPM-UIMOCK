"use client"

import { useState } from "react"
import type { ProjectStatus } from "@epm/contracts/bff/project-master"
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { Search, X } from "lucide-react"

interface ProjectSearchBarProps {
  onSearch: (keyword: string, projectStatus?: ProjectStatus, isActive?: boolean) => void
}

export function ProjectSearchBar({ onSearch }: ProjectSearchBarProps) {
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const handleSearch = () => {
    const projectStatus = statusFilter === "all" ? undefined : (statusFilter as ProjectStatus)
    const isActive = activeFilter === "all" ? undefined : activeFilter === "active"
    onSearch(keyword, projectStatus, isActive)
  }

  const handleClear = () => {
    setKeyword("")
    setStatusFilter("all")
    setActiveFilter("all")
    onSearch("", undefined, undefined)
  }

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1 max-w-md">
        <label className="text-sm font-medium mb-2 block">キーワード検索</label>
        <div className="relative">
          <Input
            placeholder="プロジェクトコード・プロジェクト名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">プロジェクトステータス</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            <SelectItem value="PLANNED">計画中</SelectItem>
            <SelectItem value="ACTIVE">実行中</SelectItem>
            <SelectItem value="ON_HOLD">保留中</SelectItem>
            <SelectItem value="CLOSED">完了</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">有効状態</label>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            <SelectItem value="active">有効のみ</SelectItem>
            <SelectItem value="inactive">無効のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" />
        検索
      </Button>

      <Button variant="outline" onClick={handleClear}>
        <X className="h-4 w-4 mr-2" />
        クリア
      </Button>
    </div>
  )
}

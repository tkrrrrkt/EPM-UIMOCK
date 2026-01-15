"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Label } from "@/shared/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Card } from "@/shared/ui/components/card"
import { X, Filter } from "lucide-react"

interface FilterPanelProps {
  isOpen: boolean
  onToggle: () => void
  onFilterChange: (filters: FilterValues) => void
}

export interface FilterValues {
  dueDateFilter: string
  selectedAssignees: string[]
  selectedLabels: string[]
}

const mockAssignees = [
  { id: "emp-001", name: "山田太郎" },
  { id: "emp-002", name: "佐藤花子" },
  { id: "emp-003", name: "鈴木一郎" },
  { id: "emp-004", name: "田中美咲" },
  { id: "emp-005", name: "高橋健太" },
]

const mockLabels = [
  { id: "label-001", name: "重要", color: "#EF4444" },
  { id: "label-002", name: "急ぎ", color: "#F59E0B" },
  { id: "label-003", name: "確認待ち", color: "#3B82F6" },
  { id: "label-004", name: "完了間近", color: "#10B981" },
]

export function FilterPanel({ isOpen, onToggle, onFilterChange }: FilterPanelProps) {
  const [dueDateFilter, setDueDateFilter] = useState("all")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const handleApply = () => {
    onFilterChange({
      dueDateFilter,
      selectedAssignees,
      selectedLabels,
    })
  }

  const handleClear = () => {
    setDueDateFilter("all")
    setSelectedAssignees([])
    setSelectedLabels([])
    onFilterChange({
      dueDateFilter: "all",
      selectedAssignees: [],
      selectedLabels: [],
    })
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const toggleLabel = (id: string) => {
    setSelectedLabels((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={onToggle}>
        <Filter className="h-4 w-4 mr-2" />
        フィルタ
      </Button>
    )
  }

  return (
    <Card className="p-4 space-y-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">フィルタ</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>期限</Label>
          <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="overdue">期限切れ</SelectItem>
              <SelectItem value="this-week">今週</SelectItem>
              <SelectItem value="this-month">今月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>担当者</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {mockAssignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedAssignees.includes(assignee.id)}
                  onCheckedChange={() => toggleAssignee(assignee.id)}
                />
                <span className="text-sm">{assignee.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>ラベル</Label>
          <div className="space-y-2">
            {mockLabels.map((label) => (
              <div key={label.id} className="flex items-center gap-2">
                <Checkbox checked={selectedLabels.includes(label.id)} onCheckedChange={() => toggleLabel(label.id)} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: label.color }} />
                <span className="text-sm">{label.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleApply} size="sm">
            適用
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm">
            クリア
          </Button>
        </div>
      </div>
    </Card>
  )
}

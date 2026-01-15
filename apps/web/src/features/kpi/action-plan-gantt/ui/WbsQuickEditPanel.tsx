"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Slider } from "@/shared/ui/components/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import { X, ChevronRight, Trash2, Loader2 } from "lucide-react"
import type { BffGanttWbs } from "../types"

interface WbsQuickEditPanelProps {
  wbs: BffGanttWbs
  position: { x: number; y: number }
  onClose: () => void
  onSave: (updates: Partial<BffGanttWbs>) => Promise<void>
  onDelete: () => void
  onOpenFullEdit: () => void
}

export function WbsQuickEditPanel({
  wbs,
  position,
  onClose,
  onSave,
  onDelete,
  onOpenFullEdit,
}: WbsQuickEditPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    wbsName: wbs.wbsName,
    startDate: wbs.startDate || "",
    dueDate: wbs.dueDate || "",
    progressRate: wbs.progressRate ?? 0,
    assigneeEmployeeId: wbs.assigneeEmployeeId || "",
  })

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        wbsName: formData.wbsName,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        progressRate: formData.progressRate,
        assigneeEmployeeId: formData.assigneeEmployeeId || undefined,
      })
      onClose()
    } catch (error) {
      console.error("[gantt] Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  // Calculate panel position (keep within viewport)
  const adjustedPosition = {
    left: Math.min(position.x, window.innerWidth - 360),
    top: Math.min(position.y, window.innerHeight - 400),
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-[340px] bg-background border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {wbs.wbsCode}
          </span>
          <span className="text-sm font-medium truncate max-w-[180px]">{wbs.wbsName}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Task Name */}
        <div className="space-y-1.5">
          <Label htmlFor="quickName" className="text-xs text-muted-foreground">
            タスク名
          </Label>
          <Input
            id="quickName"
            value={formData.wbsName}
            onChange={(e) => setFormData({ ...formData, wbsName: e.target.value })}
            className="h-9"
          />
        </div>

        {/* Dates - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quickStart" className="text-xs text-muted-foreground">
              開始日
            </Label>
            <Input
              id="quickStart"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quickEnd" className="text-xs text-muted-foreground">
              終了日
            </Label>
            <Input
              id="quickEnd"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">進捗率</Label>
            <span className="text-sm font-medium text-primary">{formData.progressRate}%</span>
          </div>
          <Slider
            value={[formData.progressRate]}
            onValueChange={([value]) => setFormData({ ...formData, progressRate: value })}
            max={100}
            step={5}
            className="py-1"
          />
        </div>

        {/* Assignee */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">担当者</Label>
          <Select
            value={formData.assigneeEmployeeId || "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, assigneeEmployeeId: value === "none" ? "" : value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              <SelectItem value="emp-001">山田太郎</SelectItem>
              <SelectItem value="emp-002">佐藤花子</SelectItem>
              <SelectItem value="emp-003">鈴木一郎</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            削除
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={onOpenFullEdit}>
            詳細編集
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={onClose}>
            キャンセル
          </Button>
          <Button size="sm" className="h-8" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}

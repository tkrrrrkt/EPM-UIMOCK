"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Input } from "@/shared/ui/components/input"
import { Progress } from "@/shared/ui/components/progress"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BffChecklistItem } from "../types"

interface ChecklistSectionProps {
  items: BffChecklistItem[]
  onAdd: (itemName: string) => Promise<void>
  onUpdate: (itemId: string, updates: { itemName?: string; isCompleted?: boolean }) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}

export function ChecklistSection({ items, onAdd, onUpdate, onDelete }: ChecklistSectionProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const completedCount = items.filter((item) => item.isCompleted).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  const handleAdd = async () => {
    if (!newItemName.trim()) return
    await onAdd(newItemName.trim())
    setNewItemName("")
    setIsAdding(false)
  }

  const handleStartEdit = (item: BffChecklistItem) => {
    setEditingId(item.id)
    setEditingName(item.itemName)
  }

  const handleSaveEdit = async (itemId: string) => {
    if (editingName.trim()) {
      await onUpdate(itemId, { itemName: editingName.trim() })
    }
    setEditingId(null)
    setEditingName("")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">チェックリスト</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{items.length}
        </span>
      </div>

      {items.length > 0 && <Progress value={progress} className="h-2" />}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
            <Checkbox
              checked={item.isCompleted}
              onCheckedChange={(checked) => onUpdate(item.id, { isCompleted: checked as boolean })}
              className="mt-1"
            />
            {editingId === item.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(item.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleSaveEdit(item.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className={cn("flex-1 text-sm", item.isCompleted && "line-through text-muted-foreground")}>
                  {item.itemName}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleStartEdit(item)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
              if (e.key === "Escape") {
                setIsAdding(false)
                setNewItemName("")
              }
            }}
            placeholder="項目名を入力..."
            autoFocus
          />
          <Button onClick={handleAdd} disabled={!newItemName.trim()}>
            追加
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setIsAdding(false)
              setNewItemName("")
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          項目を追加
        </Button>
      )}
    </div>
  )
}

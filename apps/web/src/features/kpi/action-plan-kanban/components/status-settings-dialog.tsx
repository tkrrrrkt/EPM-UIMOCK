'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Checkbox,
} from '@/shared/ui'
import { Plus, GripVertical, Trash2, Loader2 } from 'lucide-react'
import { getBffClient } from '../api/client'
import type { BffTaskStatus } from '../lib/types'
import { COLOR_PRESETS } from '../lib/types'

// ============================================
// Types
// ============================================

interface StatusSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  statuses: BffTaskStatus[]
  onClose: (updated: boolean) => void
}

interface StatusEditItem extends BffTaskStatus {
  isNew?: boolean
  isDeleted?: boolean
}

// ============================================
// Main Component
// ============================================

export function StatusSettingsDialog({
  open,
  onOpenChange,
  planId,
  statuses: initialStatuses,
  onClose,
}: StatusSettingsDialogProps) {
  const [items, setItems] = React.useState<StatusEditItem[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [newStatusCode, setNewStatusCode] = React.useState('')
  const [newStatusName, setNewStatusName] = React.useState('')
  const [newStatusColor, setNewStatusColor] = React.useState<string>(COLOR_PRESETS[0])

  // Initialize items when dialog opens
  React.useEffect(() => {
    if (open) {
      setItems([...initialStatuses])
      setHasChanges(false)
    }
  }, [open, initialStatuses])

  // Update status field
  const updateItem = (id: string, field: keyof StatusEditItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
    setHasChanges(true)
  }

  // Add new status
  const handleAddStatus = () => {
    if (!newStatusCode.trim() || !newStatusName.trim()) return

    const newItem: StatusEditItem = {
      id: `new-${Date.now()}`,
      statusCode: newStatusCode.trim(),
      statusName: newStatusName.trim(),
      colorCode: newStatusColor,
      sortOrder: items.length,
      isDefault: false,
      isCompleted: false,
      updatedAt: new Date().toISOString(),
      isNew: true,
    }

    setItems((prev) => [...prev, newItem])
    setNewStatusCode('')
    setNewStatusName('')
    setNewStatusColor(COLOR_PRESETS[0])
    setHasChanges(true)
  }

  // Delete status
  const handleDeleteStatus = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    // Cannot delete if it's the default status
    if (item.isDefault) {
      alert('デフォルトステータスは削除できません')
      return
    }

    if (item.isNew) {
      // Remove new items immediately
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      // Mark existing items as deleted
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isDeleted: true } : i))
      )
    }
    setHasChanges(true)
  }

  // Set as default
  const handleSetDefault = (id: string) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    )
    setHasChanges(true)
  }

  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true)
      const client = getBffClient()

      // Process deletions first
      for (const item of items.filter((i) => i.isDeleted && !i.isNew)) {
        try {
          await client.deleteStatus(item.id)
        } catch {
          // Status might be in use
          alert(`ステータス "${item.statusName}" は使用中のため削除できません`)
          return
        }
      }

      // Create new statuses
      for (const item of items.filter((i) => i.isNew && !i.isDeleted)) {
        await client.createStatus(planId, {
          statusCode: item.statusCode,
          statusName: item.statusName,
          colorCode: item.colorCode || undefined,
          isDefault: item.isDefault,
          isCompleted: item.isCompleted,
        })
      }

      // Update existing statuses
      for (const item of items.filter((i) => !i.isNew && !i.isDeleted)) {
        const original = initialStatuses.find((s) => s.id === item.id)
        if (
          original &&
          (item.statusName !== original.statusName ||
            item.colorCode !== original.colorCode ||
            item.isDefault !== original.isDefault ||
            item.isCompleted !== original.isCompleted)
        ) {
          await client.updateStatus(item.id, {
            statusName: item.statusName,
            colorCode: item.colorCode || undefined,
            isDefault: item.isDefault,
            isCompleted: item.isCompleted,
            updatedAt: item.updatedAt,
          })
        }
      }

      onClose(true)
    } catch (err) {
      console.error('Failed to save statuses:', err)
      alert('ステータスの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const visibleItems = items.filter((i) => !i.isDeleted)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ステータス設定</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing statuses */}
          <div className="space-y-2">
            {visibleItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />

                {/* Color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={item.colorCode || '#6B7280'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'colorCode', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                    style={{ backgroundColor: item.colorCode || '#6B7280' }}
                  />
                </div>

                {/* Status name */}
                <Input
                  value={item.statusName}
                  onChange={(e) => updateItem(item.id, 'statusName', e.target.value)}
                  className="flex-1"
                  placeholder="ステータス名"
                />

                {/* Default checkbox */}
                <div className="flex items-center gap-1">
                  <Checkbox
                    id={`default-${item.id}`}
                    checked={item.isDefault}
                    onCheckedChange={() => handleSetDefault(item.id)}
                  />
                  <Label htmlFor={`default-${item.id}`} className="text-xs text-gray-500">
                    初期
                  </Label>
                </div>

                {/* Completed checkbox */}
                <div className="flex items-center gap-1">
                  <Checkbox
                    id={`completed-${item.id}`}
                    checked={item.isCompleted}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      updateItem(item.id, 'isCompleted', !!checked)
                    }
                  />
                  <Label htmlFor={`completed-${item.id}`} className="text-xs text-gray-500">
                    完了
                  </Label>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStatus(item.id)}
                  disabled={item.isDefault}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new status */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">新規ステータス追加</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newStatusCode}
                onChange={(e) => setNewStatusCode(e.target.value)}
                placeholder="コード"
                className="w-24"
              />
              <Input
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="ステータス名"
                className="flex-1"
              />
              <input
                type="color"
                value={newStatusColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStatusColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <Button
                size="sm"
                onClick={handleAddStatus}
                disabled={!newStatusCode.trim() || !newStatusName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

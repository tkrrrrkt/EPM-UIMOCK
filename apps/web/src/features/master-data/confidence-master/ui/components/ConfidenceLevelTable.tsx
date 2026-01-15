'use client'

import { useState } from 'react'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { Button, Input, Checkbox } from '@/shared/ui'
import type { BffConfidenceLevel, BffConfidenceLevelInput } from '@epm/contracts/bff/confidence-master'

interface ConfidenceLevelTableProps {
  levels: BffConfidenceLevel[]
  onChange: (levels: BffConfidenceLevelInput[]) => void
  onDelete: (levelId: string) => void
  disabled?: boolean
}

// 色選択用のプリセット
const COLOR_PRESETS = [
  { value: '#22C55E', label: '緑' },
  { value: '#84CC16', label: '黄緑' },
  { value: '#EAB308', label: '黄' },
  { value: '#F97316', label: '橙' },
  { value: '#EF4444', label: '赤' },
  { value: '#6B7280', label: '灰' },
  { value: '#3B82F6', label: '青' },
  { value: '#8B5CF6', label: '紫' },
]

export function ConfidenceLevelTable({
  levels,
  onChange,
  onDelete,
  disabled = false,
}: ConfidenceLevelTableProps) {
  const [editingLevels, setEditingLevels] = useState<BffConfidenceLevelInput[]>(
    levels.map((level) => ({
      id: level.id,
      levelCode: level.levelCode,
      levelName: level.levelName,
      levelNameShort: level.levelNameShort,
      probabilityRate: Math.round(level.probabilityRate * 100), // 0-1 -> 0-100
      colorCode: level.colorCode,
      sortOrder: level.sortOrder,
      isActive: level.isActive,
    }))
  )

  const handleFieldChange = (index: number, field: keyof BffConfidenceLevelInput, value: string | number | boolean) => {
    const updated = [...editingLevels]
    updated[index] = { ...updated[index], [field]: value }
    setEditingLevels(updated)
    onChange(updated)
  }

  const handleAddRow = () => {
    const maxSortOrder = Math.max(...editingLevels.map((l) => l.sortOrder), 0)
    const newLevel: BffConfidenceLevelInput = {
      levelCode: '',
      levelName: '',
      levelNameShort: '',
      probabilityRate: 0,
      colorCode: '#6B7280',
      sortOrder: maxSortOrder + 1,
      isActive: true,
    }
    const updated = [...editingLevels, newLevel]
    setEditingLevels(updated)
    onChange(updated)
  }

  const handleRemoveRow = (index: number) => {
    const level = editingLevels[index]
    if (level.id) {
      // 既存データの場合は削除API呼び出し
      onDelete(level.id)
    }
    const updated = editingLevels.filter((_, i) => i !== index)
    // sortOrderを振り直し
    updated.forEach((l, i) => {
      l.sortOrder = i + 1
    })
    setEditingLevels(updated)
    onChange(updated)
  }

  const moveRow = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= editingLevels.length) return

    const updated = [...editingLevels]
    const [removed] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, removed)
    // sortOrderを振り直し
    updated.forEach((l, i) => {
      l.sortOrder = i + 1
    })
    setEditingLevels(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-20">コード</TableHead>
            <TableHead className="w-40">名称</TableHead>
            <TableHead className="w-24">掛け率(%)</TableHead>
            <TableHead className="w-24">色</TableHead>
            <TableHead className="w-16">有効</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editingLevels.map((level, index) => (
            <TableRow key={level.id || `new-${index}`}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveRow(index, 'up')}
                    disabled={disabled || index === 0}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(index, 'down')}
                    disabled={disabled || index === editingLevels.length - 1}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <Input
                  value={level.levelCode}
                  onChange={(e) => handleFieldChange(index, 'levelCode', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-8 text-sm"
                  maxLength={10}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={level.levelName}
                  onChange={(e) => handleFieldChange(index, 'levelName', e.target.value)}
                  disabled={disabled}
                  className="w-36 h-8 text-sm"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={level.probabilityRate}
                  onChange={(e) => handleFieldChange(index, 'probabilityRate', Number(e.target.value))}
                  disabled={disabled}
                  className="w-20 h-8 text-sm text-right"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: level.colorCode }}
                  />
                  <select
                    value={level.colorCode}
                    onChange={(e) => handleFieldChange(index, 'colorCode', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm border rounded px-1"
                  >
                    {COLOR_PRESETS.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={level.isActive}
                  onCheckedChange={(checked) => handleFieldChange(index, 'isActive', !!checked)}
                  disabled={disabled}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRow(index)}
                  disabled={disabled}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddRow}
        disabled={disabled}
        className="gap-1"
      >
        <Plus className="h-4 w-4" />
        新規追加
      </Button>
    </div>
  )
}

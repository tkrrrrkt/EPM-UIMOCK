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
  Textarea,
  Label,
  Checkbox,
} from '@/shared/ui'
import { Loader2, Trash2, ExternalLink } from 'lucide-react'
import { getBffClient } from '../api/client'
import type {
  BffGanttWbs,
  BffSelectableDepartment,
  BffSelectableEmployee,
} from '../lib/types'

// ============================================
// Types
// ============================================

interface WbsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wbsId: string
  wbsData: BffGanttWbs
  planId: string
  onClose: (updated: boolean) => void
}

// ============================================
// Main Component
// ============================================

export function WbsEditDialog({
  open,
  onOpenChange,
  wbsId,
  wbsData,
  planId,
  onClose,
}: WbsEditDialogProps) {
  // Form state
  const [wbsCode, setWbsCode] = React.useState('')
  const [wbsName, setWbsName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [departmentId, setDepartmentId] = React.useState('')
  const [employeeId, setEmployeeId] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [progressRate, setProgressRate] = React.useState(0)
  const [isMilestone, setIsMilestone] = React.useState(false)

  // Options
  const [departments, setDepartments] = React.useState<BffSelectableDepartment[]>([])
  const [employees, setEmployees] = React.useState<BffSelectableEmployee[]>([])

  // UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  // Initialize form when dialog opens
  React.useEffect(() => {
    if (open && wbsData) {
      setWbsCode(wbsData.wbsCode)
      setWbsName(wbsData.wbsName)
      setDescription(wbsData.description || '')
      setDepartmentId(wbsData.assigneeDepartmentStableId || '')
      setEmployeeId(wbsData.assigneeEmployeeId || '')
      setStartDate(wbsData.startDate || '')
      setDueDate(wbsData.dueDate || '')
      setProgressRate(wbsData.progressRate || 0)
      setIsMilestone(wbsData.isMilestone)
      setError(null)
      setShowDeleteConfirm(false)
      loadOptions()
    }
  }, [open, wbsData])

  const loadOptions = async () => {
    try {
      setIsLoading(true)
      const client = getBffClient()

      const [depts, emps] = await Promise.all([
        client.getSelectableDepartments(),
        client.getSelectableEmployees(),
      ])

      setDepartments(depts)
      setEmployees(emps)
    } catch (err) {
      console.error('Failed to load options:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wbsName.trim()) {
      setError('WBS名を入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const client = getBffClient()
      await client.updateWbs(wbsId, {
        wbsCode: wbsCode.trim(),
        wbsName: wbsName.trim(),
        description: description.trim() || undefined,
        assigneeDepartmentStableId: departmentId || undefined,
        assigneeEmployeeId: employeeId || undefined,
        startDate: startDate || null,
        dueDate: dueDate || null,
        isMilestone,
        updatedAt: wbsData.updatedAt,
      })

      // Update progress separately if changed
      if (progressRate !== (wbsData.progressRate || 0)) {
        await client.updateWbsProgress(wbsId, { progressRate })
      }

      onClose(true)
    } catch (err) {
      console.error('Failed to update WBS:', err)
      if (err instanceof Error) {
        if (err.message === 'WBS_CODE_DUPLICATE') {
          setError('WBSコードが重複しています')
        } else if (err.message === 'CONFLICT') {
          setError('他のユーザーが更新しました。再読み込みしてください')
        } else {
          setError('WBSの更新に失敗しました')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const client = getBffClient()
      await client.deleteWbs(wbsId)

      onClose(true)
    } catch (err) {
      console.error('Failed to delete WBS:', err)
      setError('WBSの削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Navigate to kanban
  const handleOpenKanban = () => {
    window.open(`/kpi/kanban/${planId}?wbsId=${wbsId}`, '_blank')
  }

  // Filter employees by selected department
  const filteredEmployees = departmentId
    ? employees.filter((e) => {
        const dept = departments.find((d) => d.stableId === departmentId)
        return dept && e.departmentName === dept.name
      })
    : employees

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>WBS編集</span>
            {wbsData.taskCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenKanban}
                className="text-blue-600"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                タスク一覧 ({wbsData.taskCount})
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* WBS Code */}
              <div className="space-y-2">
                <Label htmlFor="wbsCode">WBSコード *</Label>
                <Input
                  id="wbsCode"
                  value={wbsCode}
                  onChange={(e) => setWbsCode(e.target.value)}
                  placeholder="WBSコード"
                />
              </div>

              {/* WBS Name */}
              <div className="space-y-2">
                <Label htmlFor="wbsName">WBS名 *</Label>
                <Input
                  id="wbsName"
                  value={wbsName}
                  onChange={(e) => setWbsName(e.target.value)}
                  placeholder="WBS名を入力"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="説明（任意）"
                  rows={2}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">担当部門</Label>
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setDepartmentId(e.target.value)
                    setEmployeeId('')
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">選択してください</option>
                  {departments.map((dept) => (
                    <option key={dept.stableId} value={dept.stableId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div className="space-y-2">
                <Label htmlFor="employee">担当者</Label>
                <select
                  id="employee"
                  value={employeeId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEmployeeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">選択してください</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                      {emp.departmentName && !departmentId && ` (${emp.departmentName})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">終了日</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label htmlFor="progressRate">進捗率: {progressRate}%</Label>
                <input
                  id="progressRate"
                  type="range"
                  min="0"
                  max="100"
                  value={progressRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProgressRate(parseInt(e.target.value, 10))
                  }
                  className="w-full"
                />
              </div>

              {/* Milestone */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isMilestone"
                  checked={isMilestone}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setIsMilestone(!!checked)
                  }
                />
                <Label htmlFor="isMilestone">マイルストーン</Label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 mb-3">
                    このWBSを削除しますか？
                    {wbsData.taskCount > 0 && (
                      <span className="block mt-1 font-semibold">
                        ⚠️ 配下のタスク {wbsData.taskCount}件も削除されます
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      削除する
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={showDeleteConfirm}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onClose(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting || !wbsName.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

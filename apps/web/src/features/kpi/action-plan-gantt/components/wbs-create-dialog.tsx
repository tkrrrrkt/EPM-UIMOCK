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
import { Loader2 } from 'lucide-react'
import { getBffClient } from '../api/client'
import type { BffSelectableDepartment, BffSelectableEmployee } from '../lib/types'

// ============================================
// Types
// ============================================

interface WbsCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  parentWbsId: string | null
  onClose: (created: boolean) => void
}

// ============================================
// Main Component
// ============================================

export function WbsCreateDialog({
  open,
  onOpenChange,
  planId,
  parentWbsId,
  onClose,
}: WbsCreateDialogProps) {
  // Form state
  const [wbsCode, setWbsCode] = React.useState('')
  const [wbsName, setWbsName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [departmentId, setDepartmentId] = React.useState('')
  const [employeeId, setEmployeeId] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [isMilestone, setIsMilestone] = React.useState(false)

  // Options
  const [departments, setDepartments] = React.useState<BffSelectableDepartment[]>([])
  const [employees, setEmployees] = React.useState<BffSelectableEmployee[]>([])
  const [suggestedCode, setSuggestedCode] = React.useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load options and suggested code when dialog opens
  React.useEffect(() => {
    if (open) {
      resetForm()
      loadOptions()
    }
  }, [open, parentWbsId, planId])

  const resetForm = () => {
    setWbsCode('')
    setWbsName('')
    setDescription('')
    setDepartmentId('')
    setEmployeeId('')
    setStartDate('')
    setDueDate('')
    setIsMilestone(false)
    setError(null)
  }

  const loadOptions = async () => {
    try {
      setIsLoading(true)
      const client = getBffClient()

      const [depts, emps, nextCode] = await Promise.all([
        client.getSelectableDepartments(),
        client.getSelectableEmployees(),
        client.getNextWbsCode(parentWbsId, planId),
      ])

      setDepartments(depts)
      setEmployees(emps)
      setSuggestedCode(nextCode.nextCode)
      setWbsCode(nextCode.nextCode)
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
      await client.createWbs({
        actionPlanId: planId,
        parentWbsId: parentWbsId || undefined,
        wbsCode: wbsCode.trim() || undefined,
        wbsName: wbsName.trim(),
        description: description.trim() || undefined,
        assigneeDepartmentStableId: departmentId || undefined,
        assigneeEmployeeId: employeeId || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        isMilestone,
      })

      onClose(true)
    } catch (err) {
      console.error('Failed to create WBS:', err)
      if (err instanceof Error && err.message === 'WBS_CODE_DUPLICATE') {
        setError('WBSコードが重複しています')
      } else {
        setError('WBSの作成に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
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
          <DialogTitle>WBS追加</DialogTitle>
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
                <Label htmlFor="wbsCode">WBSコード</Label>
                <Input
                  id="wbsCode"
                  value={wbsCode}
                  onChange={(e) => setWbsCode(e.target.value)}
                  placeholder={`自動採番: ${suggestedCode}`}
                />
                <p className="text-xs text-gray-500">
                  空欄の場合は自動採番されます
                </p>
              </div>

              {/* WBS Name */}
              <div className="space-y-2">
                <Label htmlFor="wbsName">WBS名 *</Label>
                <Input
                  id="wbsName"
                  value={wbsName}
                  onChange={(e) => setWbsName(e.target.value)}
                  placeholder="WBS名を入力"
                  autoFocus
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
                    setEmployeeId('') // Reset employee when department changes
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || !wbsName.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                作成
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

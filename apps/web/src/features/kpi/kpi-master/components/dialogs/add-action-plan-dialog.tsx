'use client'

import React from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import type { BffDepartment, BffEmployee } from '../../lib/types'

interface AddActionPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    planName: string
    departmentStableId?: string
    ownerEmployeeId?: string
    dueDate?: string
  }) => void
  departments: BffDepartment[]
  employees: BffEmployee[]
}

export function AddActionPlanDialog({
  open,
  onOpenChange,
  onSubmit,
  departments,
  employees,
}: AddActionPlanDialogProps) {
  const [planName, setPlanName] = useState('')
  const [departmentStableId, setDepartmentStableId] = useState<string>('')
  const [ownerEmployeeId, setOwnerEmployeeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (planName.trim()) {
      onSubmit({
        planName,
        departmentStableId: departmentStableId || undefined,
        ownerEmployeeId: ownerEmployeeId || undefined,
        dueDate: dueDate || undefined,
      })
      // Reset form
      setPlanName('')
      setDepartmentStableId('')
      setOwnerEmployeeId('')
      setDueDate('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>アクションプラン追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planName">プラン名</Label>
            <Input
              id="planName"
              placeholder="アクションプラン名を入力"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">担当部門</Label>
              <Select value={departmentStableId} onValueChange={setDepartmentStableId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="部門を選択" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.stableId} value={dept.stableId}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">担当者</Label>
              <Select value={ownerEmployeeId} onValueChange={setOwnerEmployeeId}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">期限</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

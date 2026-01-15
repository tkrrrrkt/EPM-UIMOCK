'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Users, CheckCircle2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  ScrollArea,
} from '@/shared/ui'
import type { BffRoleSummary, BffEmployeeAssignment } from '@epm/contracts/bff/permission-settings'
import { bffClient, mockDepartments } from '../../api'

interface BulkRoleAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: BffRoleSummary[]
  onSuccess: () => void
}

export function BulkRoleAssignmentDialog({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: BulkRoleAssignmentDialogProps) {
  // Step state
  const [step, setStep] = useState<'select-role' | 'select-employees'>('select-role')

  // Role selection
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')

  // Employee filtering
  const [employees, setEmployees] = useState<BffEmployeeAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [hasRoleFilter, setHasRoleFilter] = useState('all') // 'all' | 'true' | 'false'

  // Selection
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())

  const activeRoles = useMemo(() => roles.filter((r) => r.isActive), [roles])
  const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId), [roles, selectedRoleId])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('select-role')
      setSelectedRoleId('')
      setEmployees([])
      setKeyword('')
      setDepartmentFilter('all')
      setHasRoleFilter('false') // Default to showing unassigned employees
      setSelectedEmployeeIds(new Set())
    }
  }, [open])

  // Load employees when moving to step 2
  useEffect(() => {
    if (step === 'select-employees' && selectedRoleId) {
      loadEmployees()
    }
  }, [step, selectedRoleId, keyword, departmentFilter, hasRoleFilter])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const response = await bffClient.listEmployeeAssignments({
        page: 1,
        pageSize: 200, // Load more for bulk selection
        keyword: keyword || undefined,
        departmentStableId: departmentFilter === 'all' ? undefined : departmentFilter,
        hasRole: hasRoleFilter === 'all' ? undefined : hasRoleFilter === 'true',
      })
      setEmployees(response.items)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (selectedRoleId) {
      setStep('select-employees')
    }
  }

  const handleBackStep = () => {
    setStep('select-role')
    setSelectedEmployeeIds(new Set())
  }

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev)
      if (next.has(employeeId)) {
        next.delete(employeeId)
      } else {
        next.add(employeeId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedEmployeeIds.size === employees.length) {
      setSelectedEmployeeIds(new Set())
    } else {
      setSelectedEmployeeIds(new Set(employees.map((e) => e.employeeId)))
    }
  }

  const handleAssign = async () => {
    if (!selectedRoleId || selectedEmployeeIds.size === 0) return

    setSaving(true)
    try {
      // Assign role to each selected employee
      const promises = Array.from(selectedEmployeeIds).map((employeeId) =>
        bffClient.assignRole({ employeeId, roleId: selectedRoleId })
      )
      await Promise.all(promises)
      onSuccess()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  // Filter employees based on current filters (client-side for responsiveness)
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      // Keyword filter
      if (keyword) {
        const kw = keyword.toLowerCase()
        if (!e.employeeCode.toLowerCase().includes(kw) && !e.employeeName.toLowerCase().includes(kw)) {
          return false
        }
      }
      return true
    })
  }, [employees, keyword])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-role' ? '一括ロール割当 - ロール選択' : `一括ロール割当 - 社員選択`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select-role' ? (
          <>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                割り当てるロールを選択してください。
              </p>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ロールを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {activeRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.roleName}</span>
                        <span className="text-muted-foreground text-xs">({role.roleCode})</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {role.assignedEmployeeCount}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="font-medium">{selectedRole.roleName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRole.roleDescription || '説明なし'}
                  </div>
                  <div className="text-sm">
                    現在の割当人数: <span className="font-medium">{selectedRole.assignedEmployeeCount}名</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button onClick={handleNextStep} disabled={!selectedRoleId}>
                次へ：社員選択
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* Selected role info */}
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Badge variant="default">{selectedRole?.roleName}</Badge>
                <span className="text-sm text-muted-foreground">を割り当てます</span>
                <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={handleBackStep}>
                  ロール変更
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="社員コード・社員名で検索..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="部門" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての部門</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.stableId} value={dept.stableId}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={hasRoleFilter} onValueChange={setHasRoleFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="割当状態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="true">割当済み</SelectItem>
                    <SelectItem value="false">未割当</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selection controls */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={filteredEmployees.length > 0 && selectedEmployeeIds.size === filteredEmployees.length}
                    onCheckedChange={toggleAll}
                  />
                  <label htmlFor="select-all" className="text-sm cursor-pointer">
                    すべて選択
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedEmployeeIds.size > 0 && (
                    <span className="text-primary font-medium">{selectedEmployeeIds.size}名選択中</span>
                  )}
                  <span className="mx-2">|</span>
                  <span>{filteredEmployees.length}名表示</span>
                </div>
              </div>

              {/* Employee list */}
              <ScrollArea className="flex-1 border rounded-md">
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">社員が見つかりません</div>
                ) : (
                  <div className="divide-y">
                    {filteredEmployees.map((employee) => {
                      const isSelected = selectedEmployeeIds.has(employee.employeeId)
                      const hasOtherRole = employee.roleId && employee.roleId !== selectedRoleId
                      const hasSameRole = employee.roleId === selectedRoleId

                      return (
                        <div
                          key={employee.employeeId}
                          className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          } ${hasSameRole ? 'opacity-50' : ''}`}
                          onClick={() => !hasSameRole && toggleEmployee(employee.employeeId)}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={hasSameRole}
                            onCheckedChange={() => !hasSameRole && toggleEmployee(employee.employeeId)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-muted-foreground">
                                {employee.employeeCode}
                              </span>
                              <span className="font-medium truncate">{employee.employeeName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {employee.departmentName || '-'}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {hasSameRole ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                割当済
                              </Badge>
                            ) : hasOtherRole ? (
                              <Badge variant="secondary" className="text-xs">
                                {employee.roleName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                未割当
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleBackStep} disabled={saving}>
                戻る
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedEmployeeIds.size === 0 || saving}
              >
                {saving ? '割当中...' : `${selectedEmployeeIds.size}名に割当`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

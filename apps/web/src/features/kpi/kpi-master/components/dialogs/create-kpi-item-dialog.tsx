'use client'

import React from 'react'
import { useState, useEffect } from 'react'
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
  RadioGroup,
  RadioGroupItem,
} from '@/shared/ui'
import type {
  BffDepartment,
  BffEmployee,
  BffSelectOption,
  BffKpiItem,
} from '../../lib/types'

interface CreateKpiItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    kpiCode: string
    kpiName: string
    kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
    hierarchyLevel: 1 | 2
    parentKpiItemId?: string
    refSubjectId?: string
    refKpiDefinitionId?: string
    refMetricId?: string
    departmentStableId?: string
    ownerEmployeeId?: string
  }) => void
  departments: BffDepartment[]
  employees: BffEmployee[]
  subjects: BffSelectOption[]
  kpiDefinitions: BffSelectOption[]
  metrics: BffSelectOption[]
  parentKpiItems: BffKpiItem[]
  editingItem?: BffKpiItem | null
}

export function CreateKpiItemDialog({
  open,
  onOpenChange,
  onSubmit,
  departments,
  employees,
  subjects,
  kpiDefinitions,
  metrics,
  parentKpiItems,
  editingItem,
}: CreateKpiItemDialogProps) {
  const [kpiCode, setKpiCode] = useState('')
  const [kpiName, setKpiName] = useState('')
  const [kpiType, setKpiType] = useState<'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'>('FINANCIAL')
  const [hierarchyLevel, setHierarchyLevel] = useState<'1' | '2'>('1')
  const [parentKpiItemId, setParentKpiItemId] = useState('')
  const [refId, setRefId] = useState('')
  const [departmentStableId, setDepartmentStableId] = useState('')
  const [ownerEmployeeId, setOwnerEmployeeId] = useState('')

  useEffect(() => {
    if (editingItem) {
      setKpiCode(editingItem.kpiCode)
      setKpiName(editingItem.kpiName)
      setKpiType(editingItem.kpiType)
      setHierarchyLevel(String(editingItem.hierarchyLevel) as '1' | '2')
      setParentKpiItemId(editingItem.parentKpiItemId ?? '')
      setDepartmentStableId(editingItem.departmentStableId ?? '')
      setOwnerEmployeeId(editingItem.ownerEmployeeId ?? '')
    } else {
      setKpiCode('')
      setKpiName('')
      setKpiType('FINANCIAL')
      setHierarchyLevel('1')
      setParentKpiItemId('')
      setRefId('')
      setDepartmentStableId('')
      setOwnerEmployeeId('')
    }
  }, [editingItem, open])

  const getRefOptions = () => {
    switch (kpiType) {
      case 'FINANCIAL':
        return subjects
      case 'NON_FINANCIAL':
        return kpiDefinitions
      case 'METRIC':
        return metrics
      default:
        return []
    }
  }

  const getRefLabel = () => {
    switch (kpiType) {
      case 'FINANCIAL':
        return '財務科目'
      case 'NON_FINANCIAL':
        return '非財務KPI定義'
      case 'METRIC':
        return '指標'
      default:
        return '参照'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (kpiCode.trim() && kpiName.trim()) {
      onSubmit({
        kpiCode,
        kpiName,
        kpiType,
        hierarchyLevel: Number(hierarchyLevel) as 1 | 2,
        parentKpiItemId: parentKpiItemId || undefined,
        refSubjectId: kpiType === 'FINANCIAL' ? refId || undefined : undefined,
        refKpiDefinitionId: kpiType === 'NON_FINANCIAL' ? refId || undefined : undefined,
        refMetricId: kpiType === 'METRIC' ? refId || undefined : undefined,
        departmentStableId: departmentStableId || undefined,
        ownerEmployeeId: ownerEmployeeId || undefined,
      })
      onOpenChange(false)
    }
  }

  const level1Items = parentKpiItems.filter(item => item.hierarchyLevel === 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'KPI項目編集' : 'KPI項目追加'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpiCode">KPIコード</Label>
              <Input
                id="kpiCode"
                placeholder="例: KPI001"
                value={kpiCode}
                onChange={(e) => setKpiCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpiName">KPI名</Label>
              <Input
                id="kpiName"
                placeholder="例: 売上高"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>KPI種別</Label>
            <RadioGroup
              value={kpiType}
              onValueChange={(v) => {
                setKpiType(v as 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC')
                setRefId('')
              }}
              className="flex gap-4"
              disabled={!!editingItem}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FINANCIAL" id="financial" />
                <Label htmlFor="financial">財務科目</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NON_FINANCIAL" id="non-financial" />
                <Label htmlFor="non-financial">非財務KPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="METRIC" id="metric" />
                <Label htmlFor="metric">指標</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>階層レベル</Label>
            <RadioGroup
              value={hierarchyLevel}
              onValueChange={(v) => setHierarchyLevel(v as '1' | '2')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="level1" />
                <Label htmlFor="level1">Lv1 (KGI)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="level2" />
                <Label htmlFor="level2">Lv2 (KPI)</Label>
              </div>
            </RadioGroup>
          </div>

          {hierarchyLevel === '2' && level1Items.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parent">親KPI項目</Label>
              <Select value={parentKpiItemId} onValueChange={setParentKpiItemId}>
                <SelectTrigger id="parent">
                  <SelectValue placeholder="親KPIを選択" />
                </SelectTrigger>
                <SelectContent>
                  {level1Items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.kpiCode} - {item.kpiName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ref">{getRefLabel()}</Label>
            <Select value={refId} onValueChange={setRefId} disabled={!!editingItem}>
              <SelectTrigger id="ref">
                <SelectValue placeholder={`${getRefLabel()}を選択`} />
              </SelectTrigger>
              <SelectContent>
                {getRefOptions().map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.code} - {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="owner">責任者</Label>
              <Select value={ownerEmployeeId} onValueChange={setOwnerEmployeeId}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="責任者を選択" />
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">
              {editingItem ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

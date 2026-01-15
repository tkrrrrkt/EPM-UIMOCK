'use client'

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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import type { BffCreateDepartmentRequest, BffDepartmentTreeNode } from '@epm/contracts/bff/organization-master'
import { ORG_UNIT_TYPE_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS } from '../../constants/options'

interface CreateDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  versionId: string | null
  parentNode: BffDepartmentTreeNode | null
  onSubmit: (versionId: string, data: BffCreateDepartmentRequest) => Promise<void>
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  versionId,
  parentNode,
  onSubmit,
}: CreateDepartmentDialogProps) {
  const [formData, setFormData] = useState<BffCreateDepartmentRequest>({
    departmentCode: '',
    departmentName: '',
    departmentNameShort: undefined,
    parentId: undefined,
    sortOrder: 10,
    orgUnitType: undefined,
    responsibilityType: undefined,
    externalCenterCode: undefined,
    notes: undefined,
  })

  useEffect(() => {
    if (parentNode) {
      setFormData((prev) => ({
        ...prev,
        parentId: parentNode.id,
      }))
    }
  }, [parentNode])

  const handleSubmit = async () => {
    if (!versionId) return
    await onSubmit(versionId, formData)
    setFormData({
      departmentCode: '',
      departmentName: '',
      departmentNameShort: undefined,
      parentId: parentNode?.id,
      sortOrder: 10,
      orgUnitType: undefined,
      responsibilityType: undefined,
      externalCenterCode: undefined,
      notes: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規部門登録</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
          {parentNode && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                親部門: <strong>{parentNode.departmentName}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="departmentCode">部門コード *</Label>
            <Input
              id="departmentCode"
              placeholder="例: SALES-3"
              value={formData.departmentCode}
              onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentName">部門名 *</Label>
            <Input
              id="departmentName"
              placeholder="例: 第三営業部"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentNameShort">部門名略称</Label>
            <Input
              id="departmentNameShort"
              placeholder="例: 第三営業"
              value={formData.departmentNameShort || ''}
              onChange={(e) => setFormData({ ...formData, departmentNameShort: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgUnitType">組織単位種別</Label>
            <Select
              value={formData.orgUnitType || ''}
              onValueChange={(value) => setFormData({ ...formData, orgUnitType: value as typeof formData.orgUnitType })}
            >
              <SelectTrigger id="orgUnitType">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {ORG_UNIT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilityType">責任種別</Label>
            <Select
              value={formData.responsibilityType || ''}
              onValueChange={(value) => setFormData({ ...formData, responsibilityType: value as typeof formData.responsibilityType })}
            >
              <SelectTrigger id="responsibilityType">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {RESPONSIBILITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">表示順</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder || 10}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalCenterCode">外部センターコード</Label>
            <Input
              id="externalCenterCode"
              placeholder="例: CC003"
              value={formData.externalCenterCode || ''}
              onChange={(e) => setFormData({ ...formData, externalCenterCode: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>登録</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

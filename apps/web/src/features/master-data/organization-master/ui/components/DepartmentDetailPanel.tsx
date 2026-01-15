'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { Pencil, Save, X, Power, PowerOff } from 'lucide-react'
import type { BffDepartmentDetailResponse, BffUpdateDepartmentRequest } from '@epm/contracts/bff/organization-master'
import { ORG_UNIT_TYPE_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS } from '../../constants/options'

interface DepartmentDetailPanelProps {
  department: BffDepartmentDetailResponse | null
  onUpdate: (id: string, data: BffUpdateDepartmentRequest) => Promise<void>
  onDeactivate: (id: string) => Promise<void>
  onReactivate: (id: string) => Promise<void>
}

export function DepartmentDetailPanel({
  department,
  onUpdate,
  onDeactivate,
  onReactivate,
}: DepartmentDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BffUpdateDepartmentRequest>({})

  useEffect(() => {
    if (department) {
      setFormData({
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        departmentNameShort: department.departmentNameShort || undefined,
        sortOrder: department.sortOrder,
        orgUnitType: department.orgUnitType || undefined,
        responsibilityType: department.responsibilityType || undefined,
        externalCenterCode: department.externalCenterCode || undefined,
        notes: department.notes || undefined,
      })
      setIsEditing(false)
    }
  }, [department])

  if (!department) {
    return (
      <div className="flex h-full items-center justify-center border-l border-border bg-card">
        <p className="text-sm text-muted-foreground">部門を選択してください</p>
      </div>
    )
  }

  const handleSave = async () => {
    await onUpdate(department.id, formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      departmentNameShort: department.departmentNameShort || undefined,
      sortOrder: department.sortOrder,
      orgUnitType: department.orgUnitType || undefined,
      responsibilityType: department.responsibilityType || undefined,
      externalCenterCode: department.externalCenterCode || undefined,
      notes: department.notes || undefined,
    })
    setIsEditing(false)
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">部門詳細</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-1 h-4 w-4" />
                編集
              </Button>
              {department.isActive ? (
                <Button size="sm" variant="outline" onClick={() => onDeactivate(department.id)}>
                  <PowerOff className="mr-1 h-4 w-4" />
                  無効化
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onReactivate(department.id)}>
                  <Power className="mr-1 h-4 w-4" />
                  再有効化
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1 h-4 w-4" />
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" />
                キャンセル
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-3 p-4">
          {/* 基本情報 */}
          <Card className="h-[420px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentCode">部門コード *</Label>
                {isEditing ? (
                  <Input
                    id="departmentCode"
                    value={formData.departmentCode || ''}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{department.departmentCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentName">部門名 *</Label>
                {isEditing ? (
                  <Input
                    id="departmentName"
                    value={formData.departmentName || ''}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{department.departmentName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentNameShort">部門名略称</Label>
                {isEditing ? (
                  <Input
                    id="departmentNameShort"
                    value={formData.departmentNameShort || ''}
                    onChange={(e) => setFormData({ ...formData, departmentNameShort: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{department.departmentNameShort || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>親部門</Label>
                <p className="text-sm">{department.parentDepartmentName || 'ルート部門'}</p>
              </div>

              <div className="space-y-2">
                <Label>ステータス</Label>
                <div>
                  {department.isActive ? (
                    <Badge variant="default">有効</Badge>
                  ) : (
                    <Badge variant="secondary">無効</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 組織情報 */}
          <Card className="h-[420px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">組織情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgUnitType">組織単位種別</Label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm">
                    {department.orgUnitType
                      ? ORG_UNIT_TYPE_OPTIONS.find((o) => o.value === department.orgUnitType)?.label
                      : '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilityType">責任種別</Label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm">
                    {department.responsibilityType
                      ? RESPONSIBILITY_TYPE_OPTIONS.find((o) => o.value === department.responsibilityType)?.label
                      : '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">表示順</Label>
                {isEditing ? (
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder || 10}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  />
                ) : (
                  <p className="text-sm">{department.sortOrder}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalCenterCode">外部センターコード</Label>
                {isEditing ? (
                  <Input
                    id="externalCenterCode"
                    value={formData.externalCenterCode || ''}
                    onChange={(e) => setFormData({ ...formData, externalCenterCode: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{department.externalCenterCode || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 階層情報 */}
          <Card className="h-[420px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">階層情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>階層レベル</Label>
                <p className="text-sm">{department.hierarchyLevel}</p>
              </div>

              <div className="space-y-2">
                <Label>階層パス</Label>
                <p className="font-mono text-sm">{department.hierarchyPath || '-'}</p>
              </div>

              <div className="space-y-2">
                <Label>Stable ID</Label>
                <p className="font-mono text-sm text-muted-foreground">{department.stableId}</p>
              </div>
            </CardContent>
          </Card>

          {/* その他の情報 */}
          <Card className="h-[420px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">その他の情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm">{department.notes || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>作成日時</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(department.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>更新日時</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(department.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}

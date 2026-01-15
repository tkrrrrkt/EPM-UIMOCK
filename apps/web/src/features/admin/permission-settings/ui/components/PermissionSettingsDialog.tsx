'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, ChevronDown, ChevronRight, Building2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DepartmentTreeSelector,
  type DepartmentSelection,
} from '@/shared/ui'
import type {
  BffMenuSummary,
  BffRoleMenuPermission,
  BffPermissionInput,
  BffAssignedDepartmentInput,
  AccessLevel,
  DataScope,
} from '@epm/contracts/bff/permission-settings'
import { bffClient, mockDepartmentTree } from '../../api'

// DataScope の日本語ラベル
const DATA_SCOPE_LABELS: Record<DataScope, string> = {
  ALL: '全社',
  HIERARCHY: '自部門配下',
  ASSIGNED: '指定部門',
}

interface PermissionSettingsDialogProps {
  roleId: string | null
  roleName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface MenuCategory {
  name: string
  menus: BffMenuSummary[]
}

interface PermissionState {
  [menuId: string]: {
    accessLevel: AccessLevel
    dataScope: DataScope
    assignedDepartments: BffAssignedDepartmentInput[]
  }
}

export function PermissionSettingsDialog({
  roleId,
  roleName,
  open,
  onOpenChange,
  onSuccess,
}: PermissionSettingsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [menus, setMenus] = useState<BffMenuSummary[]>([])
  const [permissions, setPermissions] = useState<PermissionState>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && roleId) {
      loadData()
    }
  }, [open, roleId])

  const loadData = async () => {
    if (!roleId) return
    setLoading(true)
    setError(null)
    try {
      const [menuResponse, permissionResponse] = await Promise.all([
        bffClient.listMenus(),
        bffClient.getRolePermissions(roleId),
      ])

      setMenus(menuResponse.items)

      // Initialize permission state from response
      const state: PermissionState = {}
      for (const menu of menuResponse.items) {
        const existing = permissionResponse.permissions.find((p) => p.menuId === menu.id)
        state[menu.id] = {
          accessLevel: existing?.accessLevel || 'C',
          dataScope: existing?.dataScope || 'ALL',
          assignedDepartments: existing?.assignedDepartments.map((d) => ({
            departmentStableId: d.departmentStableId,
            includeChildren: d.includeChildren,
          })) || [],
        }
      }
      setPermissions(state)

      // Expand all categories by default
      const categories = new Set(menuResponse.items.map((m) => m.menuCategory || 'その他'))
      setExpandedCategories(categories)
    } finally {
      setLoading(false)
    }
  }

  const handleAccessLevelChange = (menuId: string, accessLevel: AccessLevel) => {
    setPermissions((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        accessLevel,
        // Clear dataScope and departments if C is selected
        dataScope: accessLevel === 'C' ? 'ALL' : prev[menuId].dataScope,
        assignedDepartments: accessLevel === 'C' ? [] : prev[menuId].assignedDepartments,
      },
    }))
  }

  const handleDataScopeChange = (menuId: string, dataScope: DataScope) => {
    setPermissions((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        dataScope,
        // Clear departments if not ASSIGNED
        assignedDepartments: dataScope === 'ASSIGNED' ? prev[menuId].assignedDepartments : [],
      },
    }))
  }

  const openDepartmentSelector = (menuId: string) => {
    setSelectedMenuId(menuId)
    setDepartmentDialogOpen(true)
  }

  const handleDepartmentsChange = (departments: BffAssignedDepartmentInput[]) => {
    if (!selectedMenuId) return
    setPermissions((prev) => ({
      ...prev,
      [selectedMenuId]: {
        ...prev[selectedMenuId],
        assignedDepartments: departments,
      },
    }))
    setDepartmentDialogOpen(false)
  }

  const handleSave = async () => {
    if (!roleId) return
    setSaving(true)
    setError(null)

    try {
      const permissionInputs: BffPermissionInput[] = Object.entries(permissions).map(([menuId, p]) => ({
        menuId,
        accessLevel: p.accessLevel,
        dataScope: p.dataScope,
        assignedDepartments: p.dataScope === 'ASSIGNED' ? p.assignedDepartments : undefined,
      }))

      await bffClient.updateRolePermissions(roleId, { permissions: permissionInputs })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました'
      if (message === 'ASSIGNED_DEPARTMENTS_REQUIRED') {
        setError('「ASSIGNED」を選択した場合は、部門を1件以上指定してください')
      } else {
        setError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  // Group menus by category
  const groupedMenus = menus.reduce<MenuCategory[]>((acc, menu) => {
    const categoryName = menu.menuCategory || 'その他'
    let category = acc.find((c) => c.name === categoryName)
    if (!category) {
      category = { name: categoryName, menus: [] }
      acc.push(category)
    }
    // Only include screen-type menus (not categories)
    if (menu.menuType === 'screen') {
      category.menus.push(menu)
    }
    return acc
  }, [])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>権限設定 - {roleName}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-4">
                  {groupedMenus.map((category) => (
                    <Collapsible
                      key={category.name}
                      open={expandedCategories.has(category.name)}
                      onOpenChange={() => toggleCategory(category.name)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start font-semibold">
                          {expandedCategories.has(category.name) ? (
                            <ChevronDown className="mr-2 h-4 w-4" />
                          ) : (
                            <ChevronRight className="mr-2 h-4 w-4" />
                          )}
                          {category.name}
                          <Badge variant="secondary" className="ml-2">
                            {category.menus.length}
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 pl-6 pt-2">
                          {category.menus.map((menu) => {
                            const perm = permissions[menu.id]
                            if (!perm) return null

                            return (
                              <div
                                key={menu.id}
                                className="grid grid-cols-[1fr,120px,140px,auto] gap-3 items-center p-2 rounded-md hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{menu.menuName}</span>
                                  {menu.isConsolidation && (
                                    <Badge variant="outline" className="text-xs">連結</Badge>
                                  )}
                                </div>

                                <Select
                                  value={perm.accessLevel}
                                  onValueChange={(v) => handleAccessLevelChange(menu.id, v as AccessLevel)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A: フル</SelectItem>
                                    <SelectItem value="B">B: 参照</SelectItem>
                                    <SelectItem value="C">C: なし</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={perm.dataScope}
                                  onValueChange={(v) => handleDataScopeChange(menu.id, v as DataScope)}
                                  disabled={perm.accessLevel === 'C'}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue>
                                      {DATA_SCOPE_LABELS[perm.dataScope]}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ALL">{DATA_SCOPE_LABELS.ALL}</SelectItem>
                                    <SelectItem value="HIERARCHY">{DATA_SCOPE_LABELS.HIERARCHY}</SelectItem>
                                    <SelectItem value="ASSIGNED">{DATA_SCOPE_LABELS.ASSIGNED}</SelectItem>
                                  </SelectContent>
                                </Select>

                                <div className="min-w-[100px]">
                                  {perm.dataScope === 'ASSIGNED' && perm.accessLevel !== 'C' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => openDepartmentSelector(menu.id)}
                                    >
                                      <Building2 className="mr-1 h-3 w-3" />
                                      部門 ({perm.assignedDepartments.length})
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-4">
                  {error}
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                  キャンセル
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? '保存中...' : '保存'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Department Selection Dialog */}
      <DepartmentSelectionDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        selectedDepartments={selectedMenuId ? permissions[selectedMenuId]?.assignedDepartments || [] : []}
        onConfirm={handleDepartmentsChange}
      />
    </>
  )
}

// Department Selection Dialog with DepartmentTreeSelector
interface DepartmentSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDepartments: BffAssignedDepartmentInput[]
  onConfirm: (departments: BffAssignedDepartmentInput[]) => void
}

function DepartmentSelectionDialog({
  open,
  onOpenChange,
  selectedDepartments,
  onConfirm,
}: DepartmentSelectionDialogProps) {
  // BffAssignedDepartmentInput → DepartmentSelection に変換
  const [localSelection, setLocalSelection] = useState<DepartmentSelection[]>([])

  useEffect(() => {
    if (open) {
      setLocalSelection(
        selectedDepartments.map((d) => ({
          departmentId: d.departmentStableId,
          includeDescendants: d.includeChildren,
        }))
      )
    }
  }, [open, selectedDepartments])

  const handleConfirm = () => {
    // DepartmentSelection → BffAssignedDepartmentInput に変換
    const result: BffAssignedDepartmentInput[] = localSelection.map((s) => ({
      departmentStableId: s.departmentId,
      includeChildren: s.includeDescendants,
    }))
    onConfirm(result)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>部門選択</DialogTitle>
        </DialogHeader>

        <DepartmentTreeSelector
          departments={mockDepartmentTree}
          value={localSelection}
          onChange={setLocalSelection}
          selectionMode="multiple"
          showIncludeDescendantsToggle={true}
          showSelectAll={true}
          showSelectedCount={true}
          expandLevel={1}
          searchable={true}
          maxHeight="400px"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>
            確定 ({localSelection.length}件)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Shield, Users, UserPlus } from 'lucide-react'
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'
import { RoleSearchPanel } from './components/RoleSearchPanel'
import { RoleList } from './components/RoleList'
import { RoleFormDialog } from './components/RoleFormDialog'
import { RoleDetailDialog } from './components/RoleDetailDialog'
import { PermissionSettingsDialog } from './components/PermissionSettingsDialog'
import { EmployeeAssignmentSearchPanel } from './components/EmployeeAssignmentSearchPanel'
import { EmployeeAssignmentList } from './components/EmployeeAssignmentList'
import { BulkRoleAssignmentDialog } from './components/BulkRoleAssignmentDialog'
import { bffClient } from '../api'
import type {
  BffRoleSummary,
  BffRoleDetailResponse,
  BffEmployeeAssignment,
  BffCreateRoleRequest,
  BffUpdateRoleRequest,
} from '@epm/contracts/bff/permission-settings'

export default function PermissionSettingsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('roles')

  // Role list state
  const [rolesLoading, setRolesLoading] = useState(false)
  const [roles, setRoles] = useState<BffRoleSummary[]>([])
  const [rolesTotalCount, setRolesTotalCount] = useState(0)
  const [roleKeyword, setRoleKeyword] = useState('')
  const [roleIsActiveFilter, setRoleIsActiveFilter] = useState('all')
  const [rolePage, setRolePage] = useState(1)
  const [rolePageSize] = useState(10)
  const [roleSortBy, setRoleSortBy] = useState('roleCode')
  const [roleSortOrder, setRoleSortOrder] = useState<'asc' | 'desc'>('asc')

  // Role dialog state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<BffRoleDetailResponse | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Permission settings dialog state
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [permissionRoleId, setPermissionRoleId] = useState<string | null>(null)
  const [permissionRoleName, setPermissionRoleName] = useState('')

  // Bulk assignment dialog state
  const [bulkAssignmentDialogOpen, setBulkAssignmentDialogOpen] = useState(false)

  // Employee assignment state
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employees, setEmployees] = useState<BffEmployeeAssignment[]>([])
  const [employeesTotalCount, setEmployeesTotalCount] = useState(0)
  const [employeeKeyword, setEmployeeKeyword] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('all')
  const [hasRoleFilter, setHasRoleFilter] = useState('all')
  const [employeePage, setEmployeePage] = useState(1)
  const [employeePageSize] = useState(10)
  const [employeeSortBy, setEmployeeSortBy] = useState('employeeCode')
  const [employeeSortOrder, setEmployeeSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load roles
  useEffect(() => {
    loadRoles()
  }, [rolePage, roleSortBy, roleSortOrder, roleKeyword, roleIsActiveFilter])

  // Load employees when tab changes to assignments
  useEffect(() => {
    if (activeTab === 'assignments') {
      loadEmployees()
    }
  }, [activeTab, employeePage, employeeSortBy, employeeSortOrder, employeeKeyword, departmentFilter, employeeRoleFilter, hasRoleFilter])

  const loadRoles = async () => {
    setRolesLoading(true)
    try {
      const response = await bffClient.listRoles({
        page: rolePage,
        pageSize: rolePageSize,
        sortBy: roleSortBy as 'roleCode' | 'roleName' | 'assignedEmployeeCount',
        sortOrder: roleSortOrder,
        keyword: roleKeyword || undefined,
        isActive: roleIsActiveFilter === 'all' ? undefined : roleIsActiveFilter === 'true',
      })
      setRoles(response.items)
      setRolesTotalCount(response.totalCount)
    } finally {
      setRolesLoading(false)
    }
  }

  const loadEmployees = async () => {
    setEmployeesLoading(true)
    try {
      const response = await bffClient.listEmployeeAssignments({
        page: employeePage,
        pageSize: employeePageSize,
        sortBy: employeeSortBy as 'employeeCode' | 'employeeName' | 'departmentName' | 'roleName',
        sortOrder: employeeSortOrder,
        keyword: employeeKeyword || undefined,
        departmentStableId: departmentFilter === 'all' ? undefined : departmentFilter,
        roleId: employeeRoleFilter === 'all' ? undefined : employeeRoleFilter,
        hasRole: hasRoleFilter === 'all' ? undefined : hasRoleFilter === 'true',
      })
      setEmployees(response.items)
      setEmployeesTotalCount(response.totalCount)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const handleRoleSort = (column: string) => {
    if (roleSortBy === column) {
      setRoleSortOrder(roleSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setRoleSortBy(column)
      setRoleSortOrder('asc')
    }
    setRolePage(1)
  }

  const handleEmployeeSort = (column: string) => {
    if (employeeSortBy === column) {
      setEmployeeSortOrder(employeeSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setEmployeeSortBy(column)
      setEmployeeSortOrder('asc')
    }
    setEmployeePage(1)
  }

  const handleSelectRole = (id: string) => {
    setSelectedRoleId(id)
    setDetailDialogOpen(true)
  }

  const handleCreateRole = () => {
    setEditingRole(null)
    setFormDialogOpen(true)
  }

  const handleEditRole = (role: BffRoleDetailResponse) => {
    setEditingRole(role)
    setDetailDialogOpen(false)
    setFormDialogOpen(true)
  }

  const handleEditPermissions = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    setPermissionRoleId(roleId)
    setPermissionRoleName(role?.roleName || '')
    setDetailDialogOpen(false)
    setPermissionDialogOpen(true)
  }

  const handleRoleFormSubmit = async (data: BffCreateRoleRequest | BffUpdateRoleRequest) => {
    setFormLoading(true)
    try {
      if (editingRole) {
        await bffClient.updateRole(editingRole.id, data as BffUpdateRoleRequest)
      } else {
        await bffClient.createRole(data as BffCreateRoleRequest)
      }
      await loadRoles()
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeactivateRole = async (id: string) => {
    try {
      await bffClient.deactivateRole(id)
      await loadRoles()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'ROLE_HAS_EMPLOYEES') {
        alert('社員が割り当てられているため、このロールを無効化できません。')
      }
    }
  }

  const handleActivateRole = async (id: string) => {
    await bffClient.activateRole(id)
    await loadRoles()
  }

  const handleAssignRole = async (employeeId: string, roleId: string) => {
    setEmployeesLoading(true)
    try {
      await bffClient.assignRole({ employeeId, roleId })
      await loadEmployees()
      await loadRoles() // Refresh role counts
    } finally {
      setEmployeesLoading(false)
    }
  }

  const handleRemoveRole = async (employeeId: string) => {
    setEmployeesLoading(true)
    try {
      await bffClient.removeRoleAssignment(employeeId)
      await loadEmployees()
      await loadRoles() // Refresh role counts
    } finally {
      setEmployeesLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">権限設定</h1>
          <p className="text-muted-foreground mt-1">ロールの管理と権限の設定</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            ロール管理
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <Users className="h-4 w-4" />
            社員ロール割当
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={loadRoles} disabled={rolesLoading}>
                  <RefreshCw className={`h-4 w-4 ${rolesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <Button onClick={handleCreateRole}>
                <Plus className="mr-2 h-4 w-4" />
                新規ロール
              </Button>
            </div>

            <div className="space-y-4">
              <RoleSearchPanel
                keyword={roleKeyword}
                onKeywordChange={(value) => {
                  setRoleKeyword(value)
                  setRolePage(1)
                }}
                isActiveFilter={roleIsActiveFilter}
                onIsActiveFilterChange={(value) => {
                  setRoleIsActiveFilter(value)
                  setRolePage(1)
                }}
              />

              <RoleList
                roles={roles}
                totalCount={rolesTotalCount}
                page={rolePage}
                pageSize={rolePageSize}
                sortBy={roleSortBy}
                sortOrder={roleSortOrder}
                onSort={handleRoleSort}
                onPageChange={setRolePage}
                onSelectRole={handleSelectRole}
                onEditPermissions={handleEditPermissions}
                onDeactivate={handleDeactivateRole}
                onActivate={handleActivateRole}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Employee Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={loadEmployees} disabled={employeesLoading}>
                  <RefreshCw className={`h-4 w-4 ${employeesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <Button onClick={() => setBulkAssignmentDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                一括ロール割当
              </Button>
            </div>

            <div className="space-y-4">
              <EmployeeAssignmentSearchPanel
                keyword={employeeKeyword}
                onKeywordChange={(value) => {
                  setEmployeeKeyword(value)
                  setEmployeePage(1)
                }}
                departmentFilter={departmentFilter}
                onDepartmentFilterChange={(value) => {
                  setDepartmentFilter(value)
                  setEmployeePage(1)
                }}
                roleFilter={employeeRoleFilter}
                onRoleFilterChange={(value) => {
                  setEmployeeRoleFilter(value)
                  setEmployeePage(1)
                }}
                hasRoleFilter={hasRoleFilter}
                onHasRoleFilterChange={(value) => {
                  setHasRoleFilter(value)
                  setEmployeePage(1)
                }}
                roles={roles}
              />

              <EmployeeAssignmentList
                employees={employees}
                totalCount={employeesTotalCount}
                page={employeePage}
                pageSize={employeePageSize}
                sortBy={employeeSortBy}
                sortOrder={employeeSortOrder}
                onSort={handleEmployeeSort}
                onPageChange={setEmployeePage}
                roles={roles}
                onAssignRole={handleAssignRole}
                onRemoveRole={handleRemoveRole}
                loading={employeesLoading}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RoleDetailDialog
        roleId={selectedRoleId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleEditRole}
        onEditPermissions={handleEditPermissions}
      />

      <RoleFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        role={editingRole}
        onSubmit={handleRoleFormSubmit}
        loading={formLoading}
      />

      <PermissionSettingsDialog
        roleId={permissionRoleId}
        roleName={permissionRoleName}
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onSuccess={loadRoles}
      />

      <BulkRoleAssignmentDialog
        open={bulkAssignmentDialogOpen}
        onOpenChange={setBulkAssignmentDialogOpen}
        roles={roles}
        onSuccess={() => {
          loadEmployees()
          loadRoles()
        }}
      />
    </div>
  )
}

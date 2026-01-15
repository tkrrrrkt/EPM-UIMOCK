/**
 * MockBffClient for Permission Settings
 *
 * UI-MOCK Phase: モックデータで画面を動作させる
 * UI-BFF Phase: HttpBffClient に差し替え
 */

import type {
  BffRoleListRequest,
  BffRoleListResponse,
  BffRoleDetailResponse,
  BffRoleResponse,
  BffCreateRoleRequest,
  BffUpdateRoleRequest,
  BffMenuListResponse,
  BffMenuSummary,
  BffRolePermissionsResponse,
  BffRoleMenuPermission,
  BffUpdatePermissionsRequest,
  BffEmployeeAssignmentListRequest,
  BffEmployeeAssignmentListResponse,
  BffEmployeeAssignment,
  BffAssignRoleRequest,
  BffEmployeeRoleResponse,
  BffUserPermissionsResponse,
  AccessLevel,
  DataScope,
} from '@epm/contracts/bff/permission-settings'
import type { BffClient } from './BffClient'
import type { DepartmentNode } from '@/shared/ui'

// ============================================================================
// Mock Data
// ============================================================================

interface MockRole extends BffRoleDetailResponse {
  assignedEmployeeCount: number
}

const mockRoles: MockRole[] = [
  {
    id: 'role-001',
    roleCode: 'ADMIN',
    roleName: '管理者',
    roleDescription: 'システム全体の管理権限を持つロール',
    isActive: true,
    assignedEmployeeCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-002',
    roleCode: 'MANAGER',
    roleName: 'マネージャー',
    roleDescription: '部門管理権限を持つロール',
    isActive: true,
    assignedEmployeeCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-003',
    roleCode: 'STAFF',
    roleName: 'スタッフ',
    roleDescription: '一般社員向けの基本権限ロール',
    isActive: true,
    assignedEmployeeCount: 120,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-004',
    roleCode: 'VIEWER',
    roleName: '閲覧者',
    roleDescription: '閲覧のみ可能なロール',
    isActive: true,
    assignedEmployeeCount: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-005',
    roleCode: 'OLD_ROLE',
    roleName: '旧ロール',
    roleDescription: '廃止されたロール',
    isActive: false,
    assignedEmployeeCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
]

const mockMenus: BffMenuSummary[] = [
  // マスタデータ
  { id: 'menu-001', menuCode: 'MASTER', menuName: 'マスタデータ', menuCategory: 'マスタデータ', menuType: 'category', parentMenuId: null, isConsolidation: false, sortOrder: 100 },
  { id: 'menu-002', menuCode: 'COMPANY', menuName: '法人マスタ', menuCategory: 'マスタデータ', menuType: 'screen', parentMenuId: 'menu-001', isConsolidation: false, sortOrder: 110 },
  { id: 'menu-003', menuCode: 'ORG', menuName: '組織マスタ', menuCategory: 'マスタデータ', menuType: 'screen', parentMenuId: 'menu-001', isConsolidation: false, sortOrder: 120 },
  { id: 'menu-004', menuCode: 'EMPLOYEE', menuName: '社員マスタ', menuCategory: 'マスタデータ', menuType: 'screen', parentMenuId: 'menu-001', isConsolidation: false, sortOrder: 130 },
  { id: 'menu-005', menuCode: 'PROJECT', menuName: 'プロジェクトマスタ', menuCategory: 'マスタデータ', menuType: 'screen', parentMenuId: 'menu-001', isConsolidation: false, sortOrder: 140 },
  // 予算
  { id: 'menu-010', menuCode: 'BUDGET', menuName: '予算', menuCategory: '予算', menuType: 'category', parentMenuId: null, isConsolidation: false, sortOrder: 200 },
  { id: 'menu-011', menuCode: 'BUDGET_ENTRY', menuName: '予算入力', menuCategory: '予算', menuType: 'screen', parentMenuId: 'menu-010', isConsolidation: false, sortOrder: 210 },
  { id: 'menu-012', menuCode: 'BUDGET_APPROVAL', menuName: '予算承認', menuCategory: '予算', menuType: 'screen', parentMenuId: 'menu-010', isConsolidation: false, sortOrder: 220 },
  // レポート
  { id: 'menu-020', menuCode: 'REPORT', menuName: 'レポート', menuCategory: 'レポート', menuType: 'category', parentMenuId: null, isConsolidation: false, sortOrder: 300 },
  { id: 'menu-021', menuCode: 'BUDGET_ACTUAL', menuName: '予実分析', menuCategory: 'レポート', menuType: 'screen', parentMenuId: 'menu-020', isConsolidation: false, sortOrder: 310 },
  { id: 'menu-022', menuCode: 'VARIANCE', menuName: '差異分析', menuCategory: 'レポート', menuType: 'screen', parentMenuId: 'menu-020', isConsolidation: false, sortOrder: 320 },
  // 連結（主会社のみ）
  { id: 'menu-030', menuCode: 'CONSOL', menuName: '連結', menuCategory: '連結', menuType: 'category', parentMenuId: null, isConsolidation: true, sortOrder: 400 },
  { id: 'menu-031', menuCode: 'CONSOL_REPORT', menuName: '連結レポート', menuCategory: '連結', menuType: 'screen', parentMenuId: 'menu-030', isConsolidation: true, sortOrder: 410 },
  { id: 'menu-032', menuCode: 'ELIM', menuName: '消去仕訳', menuCategory: '連結', menuType: 'screen', parentMenuId: 'menu-030', isConsolidation: true, sortOrder: 420 },
  // 管理
  { id: 'menu-040', menuCode: 'ADMIN', menuName: '管理', menuCategory: '管理', menuType: 'category', parentMenuId: null, isConsolidation: false, sortOrder: 500 },
  { id: 'menu-041', menuCode: 'PERMISSION', menuName: '権限設定', menuCategory: '管理', menuType: 'screen', parentMenuId: 'menu-040', isConsolidation: false, sortOrder: 510 },
  { id: 'menu-042', menuCode: 'AUDIT_LOG', menuName: '監査ログ', menuCategory: '管理', menuType: 'screen', parentMenuId: 'menu-040', isConsolidation: false, sortOrder: 520 },
]

// Role permissions store (roleId -> permissions[])
const mockRolePermissions: Map<string, BffRoleMenuPermission[]> = new Map([
  ['role-001', mockMenus.map(m => ({
    menuId: m.id,
    menuCode: m.menuCode,
    menuName: m.menuName,
    menuCategory: m.menuCategory,
    accessLevel: 'A' as AccessLevel,
    dataScope: 'ALL' as DataScope,
    assignedDepartments: [],
  }))],
  ['role-002', mockMenus.filter(m => !m.isConsolidation).map(m => ({
    menuId: m.id,
    menuCode: m.menuCode,
    menuName: m.menuName,
    menuCategory: m.menuCategory,
    accessLevel: m.menuCode === 'PERMISSION' ? 'C' as AccessLevel : 'A' as AccessLevel,
    dataScope: 'HIERARCHY' as DataScope,
    assignedDepartments: [],
  }))],
  ['role-003', mockMenus.filter(m => !m.isConsolidation && m.menuCode !== 'PERMISSION' && m.menuCode !== 'AUDIT_LOG').map(m => ({
    menuId: m.id,
    menuCode: m.menuCode,
    menuName: m.menuName,
    menuCategory: m.menuCategory,
    accessLevel: m.menuCategory === 'マスタデータ' ? 'B' as AccessLevel : 'A' as AccessLevel,
    dataScope: 'ASSIGNED' as DataScope,
    assignedDepartments: [
      { departmentStableId: 'dept-001', departmentName: '営業部', includeChildren: true },
    ],
  }))],
])

const mockEmployees: BffEmployeeAssignment[] = [
  { employeeId: 'emp-001', employeeCode: 'E001', employeeName: '山田 太郎', departmentStableId: 'dept-001', departmentName: '営業部', roleId: 'role-001', roleName: '管理者' },
  { employeeId: 'emp-002', employeeCode: 'E002', employeeName: '鈴木 花子', departmentStableId: 'dept-001', departmentName: '営業部', roleId: 'role-002', roleName: 'マネージャー' },
  { employeeId: 'emp-003', employeeCode: 'E003', employeeName: '田中 一郎', departmentStableId: 'dept-002', departmentName: '開発部', roleId: 'role-003', roleName: 'スタッフ' },
  { employeeId: 'emp-004', employeeCode: 'E004', employeeName: '佐藤 次郎', departmentStableId: 'dept-002', departmentName: '開発部', roleId: 'role-003', roleName: 'スタッフ' },
  { employeeId: 'emp-005', employeeCode: 'E005', employeeName: '高橋 美咲', departmentStableId: 'dept-003', departmentName: '人事部', roleId: null, roleName: null },
  { employeeId: 'emp-006', employeeCode: 'E006', employeeName: '伊藤 健太', departmentStableId: 'dept-003', departmentName: '人事部', roleId: 'role-004', roleName: '閲覧者' },
  { employeeId: 'emp-007', employeeCode: 'E007', employeeName: '渡辺 さくら', departmentStableId: 'dept-004', departmentName: '経理部', roleId: 'role-002', roleName: 'マネージャー' },
  { employeeId: 'emp-008', employeeCode: 'E008', employeeName: '中村 大輔', departmentStableId: 'dept-004', departmentName: '経理部', roleId: null, roleName: null },
]

const mockDepartments = [
  { stableId: 'dept-001', name: '営業部' },
  { stableId: 'dept-001-1', name: '営業部 第一課' },
  { stableId: 'dept-001-2', name: '営業部 第二課' },
  { stableId: 'dept-002', name: '開発部' },
  { stableId: 'dept-002-1', name: '開発部 フロントエンド課' },
  { stableId: 'dept-002-2', name: '開発部 バックエンド課' },
  { stableId: 'dept-003', name: '人事部' },
  { stableId: 'dept-004', name: '経理部' },
]

// DepartmentNode 形式の階層データ（DepartmentTreeSelector用）
const mockDepartmentTree: DepartmentNode[] = [
  {
    id: 'dept-001',
    code: 'SALES',
    name: '営業部',
    parentId: null,
    level: 0,
    children: [
      {
        id: 'dept-001-1',
        code: 'SALES-1',
        name: '営業第一課',
        parentId: 'dept-001',
        level: 1,
        isLeaf: true,
      },
      {
        id: 'dept-001-2',
        code: 'SALES-2',
        name: '営業第二課',
        parentId: 'dept-001',
        level: 1,
        isLeaf: true,
      },
    ],
  },
  {
    id: 'dept-002',
    code: 'DEV',
    name: '開発部',
    parentId: null,
    level: 0,
    children: [
      {
        id: 'dept-002-1',
        code: 'DEV-FE',
        name: 'フロントエンド課',
        parentId: 'dept-002',
        level: 1,
        isLeaf: true,
      },
      {
        id: 'dept-002-2',
        code: 'DEV-BE',
        name: 'バックエンド課',
        parentId: 'dept-002',
        level: 1,
        isLeaf: true,
      },
    ],
  },
  {
    id: 'dept-003',
    code: 'HR',
    name: '人事部',
    parentId: null,
    level: 0,
    isLeaf: true,
  },
  {
    id: 'dept-004',
    code: 'FINANCE',
    name: '経理部',
    parentId: null,
    level: 0,
    isLeaf: true,
  },
]

// ============================================================================
// MockBffClient Implementation
// ============================================================================

export const mockBffClient: BffClient = {
  // Roles
  async listRoles(req: BffRoleListRequest): Promise<BffRoleListResponse> {
    await delay(300)

    let filtered = [...mockRoles]

    // Filter by keyword
    if (req.keyword) {
      const keyword = req.keyword.toLowerCase()
      filtered = filtered.filter(
        (r) => r.roleCode.toLowerCase().includes(keyword) || r.roleName.toLowerCase().includes(keyword),
      )
    }

    // Filter by isActive
    if (req.isActive !== undefined) {
      filtered = filtered.filter((r) => r.isActive === req.isActive)
    }

    // Sort
    const sortBy = req.sortBy || 'roleCode'
    const sortOrder = req.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof MockRole]
      const bVal = b[sortBy as keyof MockRole]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginate
    const page = req.page || 1
    const pageSize = req.pageSize || 50
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items: items.map((r) => ({
        id: r.id,
        roleCode: r.roleCode,
        roleName: r.roleName,
        roleDescription: r.roleDescription,
        assignedEmployeeCount: r.assignedEmployeeCount,
        isActive: r.isActive,
      })),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  },

  async getRoleDetail(id: string): Promise<BffRoleDetailResponse> {
    await delay(200)
    const role = mockRoles.find((r) => r.id === id)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }
    return {
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      isActive: role.isActive,
      assignedEmployeeCount: role.assignedEmployeeCount,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  },

  async createRole(req: BffCreateRoleRequest): Promise<BffRoleResponse> {
    await delay(300)

    // Check duplicate code
    if (mockRoles.some((r) => r.roleCode === req.roleCode)) {
      throw new Error('ROLE_CODE_DUPLICATE')
    }

    const newRole: MockRole = {
      id: `role-${Date.now()}`,
      roleCode: req.roleCode,
      roleName: req.roleName,
      roleDescription: req.roleDescription || null,
      isActive: true,
      assignedEmployeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockRoles.push(newRole)
    return {
      id: newRole.id,
      roleCode: newRole.roleCode,
      roleName: newRole.roleName,
      roleDescription: newRole.roleDescription,
      isActive: newRole.isActive,
      createdAt: newRole.createdAt,
      updatedAt: newRole.updatedAt,
    }
  },

  async updateRole(id: string, req: BffUpdateRoleRequest): Promise<BffRoleResponse> {
    await delay(300)

    const role = mockRoles.find((r) => r.id === id)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    // Check duplicate code
    if (req.roleCode && mockRoles.some((r) => r.id !== id && r.roleCode === req.roleCode)) {
      throw new Error('ROLE_CODE_DUPLICATE')
    }

    if (req.roleCode !== undefined) role.roleCode = req.roleCode
    if (req.roleName !== undefined) role.roleName = req.roleName
    if (req.roleDescription !== undefined) role.roleDescription = req.roleDescription
    role.updatedAt = new Date().toISOString()

    return {
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  },

  async deactivateRole(id: string): Promise<BffRoleResponse> {
    await delay(200)

    const role = mockRoles.find((r) => r.id === id)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }
    if (!role.isActive) {
      throw new Error('ROLE_ALREADY_INACTIVE')
    }
    if (role.assignedEmployeeCount > 0) {
      throw new Error('ROLE_HAS_EMPLOYEES')
    }

    role.isActive = false
    role.updatedAt = new Date().toISOString()

    return {
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  },

  async activateRole(id: string): Promise<BffRoleResponse> {
    await delay(200)

    const role = mockRoles.find((r) => r.id === id)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }
    if (role.isActive) {
      throw new Error('ROLE_ALREADY_ACTIVE')
    }

    role.isActive = true
    role.updatedAt = new Date().toISOString()

    return {
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  },

  // Menus
  async listMenus(): Promise<BffMenuListResponse> {
    await delay(200)
    // Note: In real BFF, consolidation menus would be filtered for non-primary companies
    return { items: [...mockMenus] }
  },

  // Role Permissions
  async getRolePermissions(roleId: string): Promise<BffRolePermissionsResponse> {
    await delay(200)

    const role = mockRoles.find((r) => r.id === roleId)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    const permissions = mockRolePermissions.get(roleId) || mockMenus.map(m => ({
      menuId: m.id,
      menuCode: m.menuCode,
      menuName: m.menuName,
      menuCategory: m.menuCategory,
      accessLevel: 'C' as AccessLevel,
      dataScope: 'ALL' as DataScope,
      assignedDepartments: [],
    }))

    return { roleId, permissions }
  },

  async updateRolePermissions(roleId: string, req: BffUpdatePermissionsRequest): Promise<BffRolePermissionsResponse> {
    await delay(300)

    const role = mockRoles.find((r) => r.id === roleId)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    // Validate ASSIGNED requires departments
    for (const p of req.permissions) {
      if (p.dataScope === 'ASSIGNED' && (!p.assignedDepartments || p.assignedDepartments.length === 0)) {
        throw new Error('ASSIGNED_DEPARTMENTS_REQUIRED')
      }
    }

    const newPermissions: BffRoleMenuPermission[] = req.permissions.map(p => {
      const menu = mockMenus.find(m => m.id === p.menuId)
      return {
        menuId: p.menuId,
        menuCode: menu?.menuCode || '',
        menuName: menu?.menuName || '',
        menuCategory: menu?.menuCategory || null,
        accessLevel: p.accessLevel,
        dataScope: p.dataScope,
        assignedDepartments: p.assignedDepartments?.map(d => ({
          departmentStableId: d.departmentStableId,
          departmentName: mockDepartments.find(dept => dept.stableId === d.departmentStableId)?.name || '',
          includeChildren: d.includeChildren,
        })) || [],
      }
    })

    mockRolePermissions.set(roleId, newPermissions)

    return { roleId, permissions: newPermissions }
  },

  // Employee Assignments
  async listEmployeeAssignments(req: BffEmployeeAssignmentListRequest): Promise<BffEmployeeAssignmentListResponse> {
    await delay(300)

    let filtered = [...mockEmployees]

    // Filter by keyword
    if (req.keyword) {
      const keyword = req.keyword.toLowerCase()
      filtered = filtered.filter(
        (e) => e.employeeCode.toLowerCase().includes(keyword) || e.employeeName.toLowerCase().includes(keyword),
      )
    }

    // Filter by department
    if (req.departmentStableId) {
      filtered = filtered.filter((e) => e.departmentStableId === req.departmentStableId)
    }

    // Filter by role
    if (req.roleId) {
      filtered = filtered.filter((e) => e.roleId === req.roleId)
    }

    // Filter by hasRole
    if (req.hasRole !== undefined) {
      filtered = filtered.filter((e) => req.hasRole ? e.roleId !== null : e.roleId === null)
    }

    // Sort
    const sortBy = req.sortBy || 'employeeCode'
    const sortOrder = req.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof BffEmployeeAssignment]
      const bVal = b[sortBy as keyof BffEmployeeAssignment]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginate
    const page = req.page || 1
    const pageSize = req.pageSize || 50
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      totalCount: filtered.length,
      page,
      pageSize,
    }
  },

  async assignRole(req: BffAssignRoleRequest): Promise<BffEmployeeRoleResponse> {
    await delay(300)

    const employee = mockEmployees.find((e) => e.employeeId === req.employeeId)
    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND')
    }

    const role = mockRoles.find((r) => r.id === req.roleId)
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }
    if (!role.isActive) {
      throw new Error('ROLE_INACTIVE')
    }

    // Update employee assignment
    const prevRoleId = employee.roleId
    employee.roleId = req.roleId
    employee.roleName = role.roleName

    // Update role counts
    if (prevRoleId) {
      const prevRole = mockRoles.find((r) => r.id === prevRoleId)
      if (prevRole) prevRole.assignedEmployeeCount--
    }
    role.assignedEmployeeCount++

    return {
      employeeId: employee.employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      roleId: role.id,
      roleName: role.roleName,
    }
  },

  async removeRoleAssignment(employeeId: string): Promise<void> {
    await delay(200)

    const employee = mockEmployees.find((e) => e.employeeId === employeeId)
    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND')
    }

    if (employee.roleId) {
      const role = mockRoles.find((r) => r.id === employee.roleId)
      if (role) role.assignedEmployeeCount--
    }

    employee.roleId = null
    employee.roleName = null
  },

  // User Permissions
  async getUserPermissions(): Promise<BffUserPermissionsResponse> {
    await delay(200)

    // Mock: Return admin permissions
    const permissions = mockRolePermissions.get('role-001') || []

    return {
      roleId: 'role-001',
      roleName: '管理者',
      permissions: permissions
        .filter((p) => p.accessLevel !== 'C')
        .map((p) => ({
          menuCode: p.menuCode,
          menuName: p.menuName,
          urlPath: `/admin/${p.menuCode.toLowerCase()}`,
          accessLevel: p.accessLevel as 'A' | 'B',
          dataScope: p.dataScope,
          assignedDepartmentStableIds: p.assignedDepartments.map((d) => d.departmentStableId),
        })),
    }
  },
}

// Helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Export departments for UI (department selector)
export { mockDepartments, mockDepartmentTree }

// Export as default bffClient for current phase
export const bffClient = mockBffClient

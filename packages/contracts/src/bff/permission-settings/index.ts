/**
 * BFF Contracts: permission-settings
 *
 * SSoT: .kiro/specs/admin/permission-settings/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export type AccessLevel = 'A' | 'B' | 'C'

export type DataScope = 'ALL' | 'HIERARCHY' | 'ASSIGNED'

// ============================================================================
// Request DTOs
// ============================================================================

// ロール一覧
export interface BffRoleListRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'roleCode' | 'roleName' | 'assignedEmployeeCount'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // ロールコード・ロール名部分一致
  isActive?: boolean      // 有効フラグフィルタ
}

// ロール作成
export interface BffCreateRoleRequest {
  roleCode: string
  roleName: string
  roleDescription?: string
}

// ロール更新
export interface BffUpdateRoleRequest {
  roleCode?: string
  roleName?: string
  roleDescription?: string
}

// 権限一括更新
export interface BffUpdatePermissionsRequest {
  permissions: BffPermissionInput[]
}

export interface BffPermissionInput {
  menuId: string
  accessLevel: AccessLevel
  dataScope: DataScope
  assignedDepartments?: BffAssignedDepartmentInput[]
}

export interface BffAssignedDepartmentInput {
  departmentStableId: string
  includeChildren: boolean
}

// 社員ロール割当一覧
export interface BffEmployeeAssignmentListRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'employeeCode' | 'employeeName' | 'departmentName' | 'roleName'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // 社員コード・社員名部分一致
  departmentStableId?: string  // 部門フィルタ
  roleId?: string         // ロールフィルタ
  hasRole?: boolean       // true=割当済み, false=未割当, undefined=全て
}

// 社員ロール割当
export interface BffAssignRoleRequest {
  employeeId: string
  roleId: string
}

// ============================================================================
// Response DTOs
// ============================================================================

// ロール一覧
export interface BffRoleListResponse {
  items: BffRoleSummary[]
  page: number
  pageSize: number
  totalCount: number
}

export interface BffRoleSummary {
  id: string
  roleCode: string
  roleName: string
  roleDescription: string | null
  assignedEmployeeCount: number
  isActive: boolean
}

// ロール詳細
export interface BffRoleResponse {
  id: string
  roleCode: string
  roleName: string
  roleDescription: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BffRoleDetailResponse extends BffRoleResponse {
  assignedEmployeeCount: number
}

// メニュー一覧
export interface BffMenuListResponse {
  items: BffMenuSummary[]
}

export interface BffMenuSummary {
  id: string
  menuCode: string
  menuName: string
  menuCategory: string | null
  menuType: string | null
  parentMenuId: string | null
  isConsolidation: boolean
  sortOrder: number
}

// ロール権限
export interface BffRolePermissionsResponse {
  roleId: string
  permissions: BffRoleMenuPermission[]
}

export interface BffRoleMenuPermission {
  menuId: string
  menuCode: string
  menuName: string
  menuCategory: string | null
  accessLevel: AccessLevel
  dataScope: DataScope
  assignedDepartments: BffAssignedDepartment[]
}

export interface BffAssignedDepartment {
  departmentStableId: string
  departmentName: string
  includeChildren: boolean
}

// 社員ロール割当一覧
export interface BffEmployeeAssignmentListResponse {
  items: BffEmployeeAssignment[]
  page: number
  pageSize: number
  totalCount: number
}

export interface BffEmployeeAssignment {
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentStableId: string | null
  departmentName: string | null
  roleId: string | null
  roleName: string | null
}

// 社員ロール
export interface BffEmployeeRoleResponse {
  employeeId: string
  employeeCode: string
  employeeName: string
  roleId: string
  roleName: string
}

// ユーザー権限情報
export interface BffUserPermissionsResponse {
  roleId: string | null
  roleName: string | null
  permissions: BffUserMenuPermission[]
}

export interface BffUserMenuPermission {
  menuCode: string
  menuName: string
  urlPath: string | null
  accessLevel: 'A' | 'B'  // Cは返却しない
  dataScope: DataScope
  assignedDepartmentStableIds: string[]  // ASSIGNEDの場合のみ（include_children考慮済み）
}

// ============================================================================
// Error Codes (UI-facing)
// ============================================================================

export const PermissionSettingsErrorCode = {
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_CODE_DUPLICATE: 'ROLE_CODE_DUPLICATE',
  ROLE_HAS_EMPLOYEES: 'ROLE_HAS_EMPLOYEES',
  ROLE_ALREADY_INACTIVE: 'ROLE_ALREADY_INACTIVE',
  ROLE_ALREADY_ACTIVE: 'ROLE_ALREADY_ACTIVE',
  ROLE_INACTIVE: 'ROLE_INACTIVE',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  EMPLOYEE_ALREADY_ASSIGNED: 'EMPLOYEE_ALREADY_ASSIGNED',
  MENU_NOT_FOUND: 'MENU_NOT_FOUND',
  CONSOLIDATION_MENU_RESTRICTED: 'CONSOLIDATION_MENU_RESTRICTED',
  ASSIGNED_DEPARTMENTS_REQUIRED: 'ASSIGNED_DEPARTMENTS_REQUIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type PermissionSettingsErrorCode =
  (typeof PermissionSettingsErrorCode)[keyof typeof PermissionSettingsErrorCode]

export interface PermissionSettingsError {
  code: PermissionSettingsErrorCode
  message: string
  details?: Record<string, unknown>
}

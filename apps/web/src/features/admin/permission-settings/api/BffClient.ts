/**
 * BffClient Interface for Permission Settings
 *
 * UI → BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 */

import type {
  BffRoleListRequest,
  BffRoleListResponse,
  BffRoleDetailResponse,
  BffRoleResponse,
  BffCreateRoleRequest,
  BffUpdateRoleRequest,
  BffMenuListResponse,
  BffRolePermissionsResponse,
  BffUpdatePermissionsRequest,
  BffEmployeeAssignmentListRequest,
  BffEmployeeAssignmentListResponse,
  BffAssignRoleRequest,
  BffEmployeeRoleResponse,
  BffUserPermissionsResponse,
} from '@epm/contracts/bff/permission-settings'

export interface BffClient {
  // Roles
  listRoles(req: BffRoleListRequest): Promise<BffRoleListResponse>
  getRoleDetail(id: string): Promise<BffRoleDetailResponse>
  createRole(req: BffCreateRoleRequest): Promise<BffRoleResponse>
  updateRole(id: string, req: BffUpdateRoleRequest): Promise<BffRoleResponse>
  deactivateRole(id: string): Promise<BffRoleResponse>
  activateRole(id: string): Promise<BffRoleResponse>

  // Menus
  listMenus(): Promise<BffMenuListResponse>

  // Role Permissions
  getRolePermissions(roleId: string): Promise<BffRolePermissionsResponse>
  updateRolePermissions(roleId: string, req: BffUpdatePermissionsRequest): Promise<BffRolePermissionsResponse>

  // Employee Assignments
  listEmployeeAssignments(req: BffEmployeeAssignmentListRequest): Promise<BffEmployeeAssignmentListResponse>
  assignRole(req: BffAssignRoleRequest): Promise<BffEmployeeRoleResponse>
  removeRoleAssignment(employeeId: string): Promise<void>

  // User Permissions
  getUserPermissions(): Promise<BffUserPermissionsResponse>
}

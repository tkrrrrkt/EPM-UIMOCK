/**
 * HttpBffClient for Permission Settings
 *
 * Real HTTP adapter for BFF endpoints.
 * Keep fetch usage ONLY here (UI components must not call fetch directly)
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
import type { BffClient } from './BffClient'

export function createHttpBffClient(baseUrl = '/api/bff/admin/permission'): BffClient {
  const request = async <T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ code: 'UNKNOWN_ERROR' }))
      throw new Error(error.code || 'UNKNOWN_ERROR')
    }

    return response.json()
  }

  const toQueryString = (params: Record<string, unknown>): string => {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    if (entries.length === 0) return ''
    return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
  }

  return {
    // Roles
    async listRoles(req: BffRoleListRequest): Promise<BffRoleListResponse> {
      return request('/roles' + toQueryString(req as Record<string, unknown>))
    },

    async getRoleDetail(id: string): Promise<BffRoleDetailResponse> {
      return request(`/roles/${id}`)
    },

    async createRole(req: BffCreateRoleRequest): Promise<BffRoleResponse> {
      return request('/roles', {
        method: 'POST',
        body: JSON.stringify(req),
      })
    },

    async updateRole(id: string, req: BffUpdateRoleRequest): Promise<BffRoleResponse> {
      return request(`/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      })
    },

    async deactivateRole(id: string): Promise<BffRoleResponse> {
      return request(`/roles/${id}/deactivate`, {
        method: 'POST',
      })
    },

    async activateRole(id: string): Promise<BffRoleResponse> {
      return request(`/roles/${id}/activate`, {
        method: 'POST',
      })
    },

    // Menus
    async listMenus(): Promise<BffMenuListResponse> {
      return request('/menus')
    },

    // Role Permissions
    async getRolePermissions(roleId: string): Promise<BffRolePermissionsResponse> {
      return request(`/roles/${roleId}/permissions`)
    },

    async updateRolePermissions(roleId: string, req: BffUpdatePermissionsRequest): Promise<BffRolePermissionsResponse> {
      return request(`/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify(req),
      })
    },

    // Employee Assignments
    async listEmployeeAssignments(req: BffEmployeeAssignmentListRequest): Promise<BffEmployeeAssignmentListResponse> {
      return request('/employee-assignments' + toQueryString(req as Record<string, unknown>))
    },

    async assignRole(req: BffAssignRoleRequest): Promise<BffEmployeeRoleResponse> {
      return request('/employee-assignments', {
        method: 'POST',
        body: JSON.stringify(req),
      })
    },

    async removeRoleAssignment(employeeId: string): Promise<void> {
      await request(`/employee-assignments/${employeeId}`, {
        method: 'DELETE',
      })
    },

    // User Permissions
    async getUserPermissions(): Promise<BffUserPermissionsResponse> {
      return request('/user/permissions')
    },
  }
}

// Export a default instance
export const httpBffClient = createHttpBffClient()

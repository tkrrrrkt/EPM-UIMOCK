/**
 * BFF Contracts: organization-master
 *
 * SSoT: .kiro/specs/master-data/organization-master/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export const OrgUnitType = {
  COMPANY: 'company',
  HEADQUARTERS: 'headquarters',
  DIVISION: 'division',
  DEPARTMENT: 'department',
  SECTION: 'section',
  TEAM: 'team',
} as const

export type OrgUnitType = (typeof OrgUnitType)[keyof typeof OrgUnitType]

export const ResponsibilityType = {
  PROFIT_CENTER: 'profit_center',
  COST_CENTER: 'cost_center',
  INVESTMENT_CENTER: 'investment_center',
  REVENUE_CENTER: 'revenue_center',
} as const

export type ResponsibilityType = (typeof ResponsibilityType)[keyof typeof ResponsibilityType]

// ============================================================================
// Version Request DTOs
// ============================================================================

export interface BffVersionListRequest {
  sortBy?: 'effectiveDate' | 'versionCode'
  sortOrder?: 'asc' | 'desc'
}

export interface BffCreateVersionRequest {
  versionCode: string
  versionName: string
  effectiveDate: string  // ISO 8601 date
  expiryDate?: string    // ISO 8601 date
  description?: string
}

export interface BffCopyVersionRequest {
  versionCode: string
  versionName: string
  effectiveDate: string
  expiryDate?: string
  description?: string
}

export interface BffUpdateVersionRequest {
  versionCode?: string
  versionName?: string
  effectiveDate?: string
  expiryDate?: string | null
  description?: string | null
}

// ============================================================================
// Version Response DTOs
// ============================================================================

export interface BffVersionSummary {
  id: string
  versionCode: string
  versionName: string
  effectiveDate: string
  expiryDate: string | null
  isCurrentlyEffective: boolean
  departmentCount: number
}

export interface BffVersionListResponse {
  items: BffVersionSummary[]
}

export interface BffVersionDetailResponse {
  id: string
  versionCode: string
  versionName: string
  effectiveDate: string
  expiryDate: string | null
  description: string | null
  isCurrentlyEffective: boolean
  departmentCount: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Department Request DTOs
// ============================================================================

export interface BffDepartmentTreeRequest {
  keyword?: string
  isActive?: boolean
  orgUnitType?: OrgUnitType
}

export interface BffCreateDepartmentRequest {
  departmentCode: string
  departmentName: string
  departmentNameShort?: string
  parentId?: string
  sortOrder?: number
  orgUnitType?: OrgUnitType
  responsibilityType?: ResponsibilityType
  externalCenterCode?: string
  notes?: string
}

export interface BffUpdateDepartmentRequest {
  departmentCode?: string
  departmentName?: string
  departmentNameShort?: string | null
  sortOrder?: number
  orgUnitType?: OrgUnitType | null
  responsibilityType?: ResponsibilityType | null
  externalCenterCode?: string | null
  notes?: string | null
}

export interface BffMoveDepartmentRequest {
  newParentId: string | null
}

// ============================================================================
// Department Response DTOs
// ============================================================================

export interface BffDepartmentTreeNode {
  id: string
  stableId: string
  departmentCode: string
  departmentName: string
  orgUnitType: OrgUnitType | null
  isActive: boolean
  hierarchyLevel: number
  children: BffDepartmentTreeNode[]
}

export interface BffDepartmentTreeResponse {
  roots: BffDepartmentTreeNode[]
}

export interface BffDepartmentDetailResponse {
  id: string
  stableId: string
  departmentCode: string
  departmentName: string
  departmentNameShort: string | null
  parentDepartmentId: string | null
  parentDepartmentName: string | null  // BFF で解決
  sortOrder: number
  hierarchyLevel: number
  hierarchyPath: string | null
  orgUnitType: OrgUnitType | null
  responsibilityType: ResponsibilityType | null
  externalCenterCode: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Error Codes (UI-facing)
// ============================================================================

export const OrganizationMasterErrorCode = {
  // Version errors
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  VERSION_CODE_DUPLICATE: 'VERSION_CODE_DUPLICATE',
  VERSION_DATE_OVERLAP: 'VERSION_DATE_OVERLAP',

  // Department errors
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  DEPARTMENT_CODE_DUPLICATE: 'DEPARTMENT_CODE_DUPLICATE',
  DEPARTMENT_HAS_CHILDREN: 'DEPARTMENT_HAS_CHILDREN',
  PARENT_DEPARTMENT_NOT_FOUND: 'PARENT_DEPARTMENT_NOT_FOUND',
  CIRCULAR_HIERARCHY_DETECTED: 'CIRCULAR_HIERARCHY_DETECTED',
  DEPARTMENT_ALREADY_INACTIVE: 'DEPARTMENT_ALREADY_INACTIVE',
  DEPARTMENT_ALREADY_ACTIVE: 'DEPARTMENT_ALREADY_ACTIVE',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type OrganizationMasterErrorCode =
  typeof OrganizationMasterErrorCode[keyof typeof OrganizationMasterErrorCode]

export interface OrganizationMasterError {
  code: OrganizationMasterErrorCode
  message: string
  details?: Record<string, unknown>
}

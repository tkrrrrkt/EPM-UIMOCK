// BFF Contracts for Employee Master
// SSoT for UI/BFF communication

// ============================================
// Employee Master DTOs
// ============================================

export interface BffListEmployeesRequest {
  page?: number
  pageSize?: number
  sortBy?: "employeeCode" | "employeeName" | "hireDate"
  sortOrder?: "asc" | "desc"
  keyword?: string
  isActive?: boolean
}

export interface BffEmployeeSummary {
  id: string
  employeeCode: string
  employeeName: string
  email: string | null
  hireDate: string | null
  isActive: boolean
}

export interface BffListEmployeesResponse {
  items: BffEmployeeSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCreateEmployeeRequest {
  employeeCode: string
  employeeName: string
  employeeNameKana?: string
  email?: string
  hireDate?: string
  leaveDate?: string
}

export interface BffUpdateEmployeeRequest {
  employeeCode?: string
  employeeName?: string
  employeeNameKana?: string
  email?: string
  hireDate?: string
  leaveDate?: string
}

export interface BffEmployeeDetailResponse {
  id: string
  employeeCode: string
  employeeName: string
  employeeNameKana: string | null
  email: string | null
  hireDate: string | null
  leaveDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// Employee Assignment DTOs
// ============================================

export const AssignmentType = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
} as const
export type AssignmentType = (typeof AssignmentType)[keyof typeof AssignmentType]

export interface BffCreateEmployeeAssignmentRequest {
  departmentStableId: string
  assignmentType: AssignmentType
  allocationRatio?: number
  title?: string
  effectiveDate: string
  expiryDate?: string
}

export interface BffUpdateEmployeeAssignmentRequest {
  departmentStableId?: string
  assignmentType?: AssignmentType
  allocationRatio?: number
  title?: string
  effectiveDate?: string
  expiryDate?: string
}

export interface BffEmployeeAssignmentSummary {
  id: string
  departmentStableId: string
  departmentName: string
  assignmentType: AssignmentType
  allocationRatio: number | null
  title: string | null
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
}

export interface BffListEmployeeAssignmentsResponse {
  items: BffEmployeeAssignmentSummary[]
}

export interface BffEmployeeAssignmentResponse {
  id: string
  employeeId: string
  departmentStableId: string
  departmentName: string
  assignmentType: AssignmentType
  allocationRatio: number | null
  title: string | null
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// Error Types
// ============================================

export const EmployeeMasterErrorCode = {
  EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND",
  EMPLOYEE_CODE_DUPLICATE: "EMPLOYEE_CODE_DUPLICATE",
  EMPLOYEE_ALREADY_INACTIVE: "EMPLOYEE_ALREADY_INACTIVE",
  EMPLOYEE_ALREADY_ACTIVE: "EMPLOYEE_ALREADY_ACTIVE",
  COMPANY_NOT_FOUND: "COMPANY_NOT_FOUND",
  COMPANY_ACCESS_DENIED: "COMPANY_ACCESS_DENIED",
  COMPANY_NOT_SELECTED: "COMPANY_NOT_SELECTED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  ASSIGNMENT_NOT_FOUND: "ASSIGNMENT_NOT_FOUND",
  DEPARTMENT_NOT_FOUND: "DEPARTMENT_NOT_FOUND",
  ASSIGNMENT_OVERLAP: "ASSIGNMENT_OVERLAP",
} as const

export type EmployeeMasterErrorCode =
  (typeof EmployeeMasterErrorCode)[keyof typeof EmployeeMasterErrorCode]

export interface EmployeeMasterError {
  code: EmployeeMasterErrorCode
  message: string
  details?: Record<string, unknown>
}


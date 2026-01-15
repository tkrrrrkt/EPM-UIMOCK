/**
 * BFF Contracts for Action Plan Core Feature
 * SSoT for UI ↔ BFF communication
 *
 * @see .kiro/specs/kpi/action-plan-core/design.md
 */

// === Enums ===
export type ActionPlanStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type ActionPlanPriority = "HIGH" | "MEDIUM" | "LOW"

// === Response DTOs ===
export interface BffActionPlanSummary {
  id: string
  planCode: string
  planName: string
  subjectId: string
  subjectName: string
  ownerEmployeeId: string | null
  ownerEmployeeName: string | null
  dueDate: string | null
  status: ActionPlanStatus
  progressRate: number | null
  priority: ActionPlanPriority | null
}

export interface BffActionPlanDetail extends BffActionPlanSummary {
  description: string | null
  ownerDepartmentStableId: string | null
  ownerDepartmentName: string | null
  startDate: string | null
  isActive: boolean
  wbsCount: number
  taskCount: number
  createdAt: string
  updatedAt: string
}

export interface BffKpiSubject {
  id: string
  subjectCode: string
  subjectName: string
}

// === Request DTOs ===
export interface BffListPlansRequest {
  page?: number
  pageSize?: number
  sortBy?: "planCode" | "planName" | "dueDate" | "status"
  sortOrder?: "asc" | "desc"
  keyword?: string
  status?: ActionPlanStatus
  priority?: ActionPlanPriority
}

export interface BffCreatePlanRequest {
  planCode: string
  planName: string
  description?: string
  subjectId: string
  ownerDepartmentStableId?: string
  ownerEmployeeId?: string
  startDate?: string
  dueDate?: string
  priority?: ActionPlanPriority
}

export interface BffUpdatePlanRequest {
  planCode?: string
  planName?: string
  description?: string
  subjectId?: string
  ownerDepartmentStableId?: string
  ownerEmployeeId?: string
  startDate?: string
  dueDate?: string
  status?: ActionPlanStatus
  progressRate?: number
  priority?: ActionPlanPriority
  updatedAt: string
}

// === Response Wrappers ===
export interface BffListPlansResponse {
  plans: BffActionPlanSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffPlanDetailResponse {
  plan: BffActionPlanDetail
}

export interface BffKpiSubjectsResponse {
  subjects: BffKpiSubject[]
}

// === BFF Client Interface ===
export interface BffClient {
  listPlans(request: BffListPlansRequest): Promise<BffListPlansResponse>
  getPlanDetail(id: string): Promise<BffPlanDetailResponse>
  createPlan(request: BffCreatePlanRequest): Promise<BffPlanDetailResponse>
  updatePlan(id: string, request: BffUpdatePlanRequest): Promise<BffPlanDetailResponse>
  deletePlan(id: string): Promise<void>
  getKpiSubjects(): Promise<BffKpiSubjectsResponse>
}

// === Error Codes ===
export const ActionPlanCoreErrorCode = {
  PLAN_NOT_FOUND: "PLAN_NOT_FOUND",
  PLAN_CODE_DUPLICATE: "PLAN_CODE_DUPLICATE",
  OPTIMISTIC_LOCK_ERROR: "OPTIMISTIC_LOCK_ERROR",
  SUBJECT_NOT_FOUND: "SUBJECT_NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
} as const

export type ActionPlanCoreErrorCode =
  (typeof ActionPlanCoreErrorCode)[keyof typeof ActionPlanCoreErrorCode]

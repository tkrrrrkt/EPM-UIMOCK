/**
 * BFF Contracts for Action Plan Gantt Feature
 * SSoT for UI ↔ BFF communication
 *
 * @see .kiro/specs/kpi/action-plan-gantt/design.md
 */

// === Gantt Chart Data ===
export interface BffGanttData {
  planId: string
  planName: string
  wbsItems: BffGanttWbs[]
  links: BffGanttLink[]
}

export interface BffGanttWbs {
  id: string
  parentWbsId: string | null
  wbsCode: string
  wbsName: string
  description: string | null
  assigneeDepartmentStableId: string | null
  assigneeDepartmentName: string | null
  assigneeEmployeeId: string | null
  assigneeEmployeeName: string | null
  startDate: string | null
  dueDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  progressRate: number | null
  isMilestone: boolean
  sortOrder: number
  taskCount: number
  updatedAt: string
}

export interface BffGanttLink {
  id: string
  sourceWbsId: string
  targetWbsId: string
  type: "finish_to_start"
}

// === Request DTOs ===
export interface BffCreateWbsRequest {
  actionPlanId: string
  parentWbsId?: string
  wbsCode?: string // Empty for auto-numbering
  wbsName: string
  description?: string
  assigneeDepartmentStableId?: string
  assigneeEmployeeId?: string
  startDate?: string
  dueDate?: string
  isMilestone?: boolean
}

export interface BffUpdateWbsRequest {
  wbsCode?: string
  wbsName?: string
  description?: string
  assigneeDepartmentStableId?: string
  assigneeEmployeeId?: string
  startDate?: string
  dueDate?: string
  isMilestone?: boolean
  updatedAt: string
}

export interface BffUpdateWbsScheduleRequest {
  startDate: string | null
  dueDate: string | null
}

export interface BffUpdateWbsProgressRequest {
  progressRate: number
}

export interface BffUpdateWbsDependencyRequest {
  predecessorWbsId: string | null
}

// === Response DTOs ===
export interface BffWbsResponse {
  wbs: BffGanttWbs
}

export interface BffNextWbsCodeResponse {
  nextCode: string
}

// === BFF Client Interface ===
export interface BffClient {
  getGanttData(planId: string): Promise<BffGanttData>
  createWbs(request: BffCreateWbsRequest): Promise<BffWbsResponse>
  updateWbs(id: string, request: BffUpdateWbsRequest): Promise<BffWbsResponse>
  updateWbsSchedule(id: string, request: BffUpdateWbsScheduleRequest): Promise<BffWbsResponse>
  updateWbsProgress(id: string, request: BffUpdateWbsProgressRequest): Promise<BffWbsResponse>
  updateWbsDependency(id: string, request: BffUpdateWbsDependencyRequest): Promise<BffWbsResponse>
  deleteWbs(id: string): Promise<void>
  getNextWbsCode(planId: string, parentWbsId?: string): Promise<BffNextWbsCodeResponse>
}

// === Error Codes ===
export const ActionPlanGanttErrorCode = {
  WBS_NOT_FOUND: "WBS_NOT_FOUND",
  WBS_CODE_DUPLICATE: "WBS_CODE_DUPLICATE",
  CIRCULAR_DEPENDENCY: "CIRCULAR_DEPENDENCY",
  OPTIMISTIC_LOCK_ERROR: "OPTIMISTIC_LOCK_ERROR",
  FORBIDDEN: "FORBIDDEN",
} as const

export type ActionPlanGanttErrorCode =
  (typeof ActionPlanGanttErrorCode)[keyof typeof ActionPlanGanttErrorCode]

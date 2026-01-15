/**
 * Type definitions for KPI Action Plan Gantt feature
 *
 * Re-exported from @epm/contracts/bff/action-plan-gantt (SSoT)
 */

export type {
  // Gantt Chart Data
  BffGanttData,
  BffGanttWbs,
  BffGanttLink,
  // Request DTOs
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  // Response DTOs
  BffWbsResponse,
  BffNextWbsCodeResponse,
  // Client Interface
  BffClient,
} from "@epm/contracts/bff/action-plan-gantt"

export { ActionPlanGanttErrorCode } from "@epm/contracts/bff/action-plan-gantt"

// === UI-specific types (not in contracts) ===
// ViewPeriod: ガントチャートの表示スケール
// - "day": 日表示（上段: 年月、下段: 日）
// - "week": 週表示（上段: 年月、下段: 週）
// - "month": 月表示（上段: 年、下段: 月）
export type ViewPeriod = "day" | "week" | "month"

export interface WbsTreeNode {
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
  children: WbsTreeNode[]
  level: number
  isExpanded: boolean
}

export interface FilterState {
  departmentStableId: string | null
  milestonesOnly: boolean
}

// === DHTMLX Gantt types ===
export interface DhtmlxTask {
  id: string
  text: string
  start_date: Date | null
  end_date: Date | null
  duration?: number
  progress: number
  parent: string
  type?: "task" | "project" | "milestone"
  open?: boolean
  // Custom fields
  wbsCode: string
  assigneeName: string | null
  departmentName: string | null
  taskCount: number
}

export interface DhtmlxLink {
  id: string
  source: string
  target: string
  type: "0" | "1" | "2" | "3" // 0: finish-to-start, 1: start-to-start, 2: finish-to-finish, 3: start-to-finish
}

export interface DhtmlxGanttData {
  tasks: DhtmlxTask[]
  links: DhtmlxLink[]
}

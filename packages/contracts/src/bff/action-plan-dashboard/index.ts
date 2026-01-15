/**
 * BFF Contracts for Action Plan Dashboard Feature
 * SSoT for UI ↔ BFF communication
 *
 * @see .kiro/specs/kpi/action-plan-dashboard/design.md
 */

// === Dashboard Data ===
export interface BffDashboardData {
  summary: BffDashboardSummary
  kpiGroups: BffKpiGroup[]
  lastUpdatedAt: string
}

export interface BffDashboardSummary {
  totalKpiCount: number
  totalPlanCount: number
  delayedPlanCount: number
  completedPlanCount: number
  overallProgressRate: number
}

export interface BffKpiGroup {
  kpiId: string
  kpiCode: string
  kpiName: string
  organizationName: string | null
  budgetAmount: number | null
  actualAmount: number | null
  achievementRate: number | null
  plans: BffPlanSummary[]
}

export interface BffPlanSummary {
  id: string
  planCode: string
  planName: string
  departmentName: string | null
  responsibleEmployeeName: string | null
  startDate: string | null
  dueDate: string | null
  wbsProgressRate: number | null
  taskCompletionRate: number | null
  status: "delayed" | "normal" | "completed"
  isOverdue: boolean
}

// === KPI Detail ===
export interface BffKpiDetail {
  kpiId: string
  kpiCode: string
  kpiName: string
  monthlyData: BffKpiMonthlyData[]
  totalBudget: number
  totalActual: number
  totalAchievementRate: number
}

export interface BffKpiMonthlyData {
  yearMonth: string
  budgetAmount: number
  actualAmount: number
  variance: number
  achievementRate: number
}

// === Request DTOs ===
export interface BffDashboardQuery {
  organizationId?: string
  periodFrom?: string
  periodTo?: string
  progressStatus?: "delayed" | "normal" | "completed"
}

// === BFF Client Interface ===
export interface BffClient {
  getDashboardData(query: BffDashboardQuery): Promise<BffDashboardData>
  getKpiDetail(subjectId: string): Promise<BffKpiDetail>
}

// === Error Codes ===
export const ActionPlanDashboardErrorCode = {
  KPI_NOT_FOUND: "KPI_NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
} as const

export type ActionPlanDashboardErrorCode =
  (typeof ActionPlanDashboardErrorCode)[keyof typeof ActionPlanDashboardErrorCode]

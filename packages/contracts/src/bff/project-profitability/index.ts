/**
 * BFF Contracts: project-profitability (PJ採算照会)
 *
 * SSoT: .kiro/specs/reports/project-profitability/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED'

// ============================================================================
// Request DTOs
// ============================================================================

/** PJ一覧取得リクエスト */
export interface BffProjectListRequest {
  page?: number // default: 1
  pageSize?: number // default: 20, max: 100
  sortBy?: 'projectName' | 'departmentName' | 'revenueBudget' | 'revenueProjection' | 'grossProfitRate'
  sortOrder?: 'asc' | 'desc'
  keyword?: string // PJコード・PJ名部分一致
  departmentStableId?: string
  status?: ProjectStatus
}

// ============================================================================
// Response DTOs
// ============================================================================

/** PJ一覧レスポンス */
export interface BffProjectListResponse {
  items: BffProjectSummary[]
  page: number
  pageSize: number
  totalCount: number
}

/** PJサマリ（一覧用） */
export interface BffProjectSummary {
  id: string
  projectCode: string
  projectName: string
  departmentStableId: string
  departmentName: string
  status: ProjectStatus
  revenueBudget: number // 売上予算
  revenueProjection: number // 売上着地予測
  grossProfitRate: number // 粗利率（%）
  isWarning: boolean // 警告フラグ（粗利マイナス等）
}

/** PJ詳細レスポンス */
export interface BffProjectDetailResponse {
  // 基本情報
  id: string
  projectCode: string
  projectName: string
  projectNameShort: string | null
  departmentStableId: string
  departmentName: string
  ownerEmployeeId: string | null
  ownerEmployeeName: string | null
  startDate: string | null
  endDate: string | null
  status: ProjectStatus

  // 主要指標（全部原価計算）
  metrics: BffProjectMetrics

  // 直接原価計算指標（オプション）
  directCostingMetrics: BffDirectCostingMetrics | null

  // KPI
  kpis: BffProjectKpis

  // 警告
  isWarning: boolean
  isProjectionNegative: boolean
}

/** 主要指標（全部原価計算） */
export interface BffProjectMetrics {
  // 売上高
  revenueBudget: number
  revenueActual: number
  revenueForecast: number
  revenueProjection: number // 着地予測
  revenueVariance: number // 予算差異

  // 売上原価
  cogsBudget: number
  cogsActual: number
  cogsForecast: number
  cogsProjection: number
  cogsVariance: number

  // 粗利
  grossProfitBudget: number
  grossProfitActual: number
  grossProfitForecast: number
  grossProfitProjection: number
  grossProfitVariance: number

  // 営業利益
  operatingProfitBudget: number
  operatingProfitActual: number
  operatingProfitForecast: number
  operatingProfitProjection: number
  operatingProfitVariance: number
}

/** 直接原価計算指標 */
export interface BffDirectCostingMetrics {
  // 変動費
  variableCostBudget: number
  variableCostActual: number
  variableCostProjection: number

  // 限界利益
  marginalProfitBudget: number
  marginalProfitActual: number
  marginalProfitProjection: number

  // 固定費
  fixedCostBudget: number
  fixedCostActual: number
  fixedCostProjection: number

  // 貢献利益
  contributionProfitBudget: number
  contributionProfitActual: number
  contributionProfitProjection: number
}

/** KPI */
export interface BffProjectKpis {
  revenueProgressRate: number // 売上進捗率（%）
  costConsumptionRate: number // 予算消化率（%）
  grossProfitRate: number // 粗利率（%）
  marginalProfitRate: number | null // 限界利益率（%）※直接原価有効時のみ
}

/** フィルター選択肢レスポンス */
export interface BffProjectFiltersResponse {
  departments: BffDepartmentOption[]
  statuses: BffStatusOption[]
}

/** 部門選択肢 */
export interface BffDepartmentOption {
  stableId: string
  name: string
}

/** ステータス選択肢 */
export interface BffStatusOption {
  value: ProjectStatus
  label: string
}

/** 月別推移レスポンス */
export interface BffProjectMonthlyTrendResponse {
  months: string[] // ["2025-04", "2025-05", ...]
  revenue: BffMonthlyValues
  cogs: BffMonthlyValues
  grossProfit: BffMonthlyValues
  operatingProfit: BffMonthlyValues
}

/** 月別値 */
export interface BffMonthlyValues {
  budget: number[]
  actual: number[]
  forecast: number[]
}

// ============================================================================
// Error Codes
// ============================================================================

export const ProjectProfitabilityErrorCode = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  INVALID_FILTER: 'INVALID_FILTER',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const

export type ProjectProfitabilityErrorCode =
  (typeof ProjectProfitabilityErrorCode)[keyof typeof ProjectProfitabilityErrorCode]

export interface ProjectProfitabilityError {
  code: ProjectProfitabilityErrorCode
  message: string
  details?: Record<string, unknown>
}

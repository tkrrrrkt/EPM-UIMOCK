/**
 * BFF Contracts: budget-trend-report (予算消化推移レポート)
 *
 * SSoT: .kiro/specs/仕様概要/予算実績照会レポート.md
 *
 * 予算消化率の推移、前年比較、着地予測を提供するレポート
 */

// ============================================
// Common Types
// ============================================

/** フィルターパラメータ */
export interface BffBudgetTrendFilters {
  fiscalYear: string // "2024", "2025" etc.
  accountType: "revenue" | "gross_profit" | "operating_profit" | "all"
  comparisonYear?: string // 比較年度
}

// ============================================
// Summary DTOs
// ============================================

/** サマリー取得リクエスト */
export interface BffBudgetTrendSummaryRequest {
  filters: BffBudgetTrendFilters
  organizationId?: string
}

/** サマリーデータ */
export interface BffBudgetTrendSummary {
  annualBudget: number // 年間予算
  ytdActual: number // 累計実績
  ytdBudget: number // 累計予算
  consumptionRate: number // 消化率（%）
  planConsumptionRate: number // 計画消化率（%）
  variance: number // 差異
  varianceRate: number // 差異率（%）
  landingForecast: number // 着地見込
  landingVariance: number // 着地差異
  priorYearActual: number // 前年実績
  priorYearVariance: number // 前年比
  priorYearVarianceRate: number // 前年比率（%）
}

/** サマリー取得レスポンス */
export interface BffBudgetTrendSummaryResponse {
  summary: BffBudgetTrendSummary
  currentMonth: number // 現在月
  closedMonths: number[] // 締め済み月
}

// ============================================
// Consumption Chart (消化率推移) DTOs
// ============================================

/** 消化率推移取得リクエスト */
export interface BffBudgetConsumptionChartRequest {
  filters: BffBudgetTrendFilters
  organizationId?: string
}

/** 月次消化率データ */
export interface BffBudgetConsumptionMonth {
  month: string // "4月", "5月" etc.
  monthNo: number // 4, 5 etc.
  budget: number // 累計予算
  actual: number | null // 累計実績（未来月はnull）
  consumed: number | null // 消化額（未来月はnull）
  actualRate: number | null // 実績消化率（%）
  planRate: number // 計画消化率（%）
  varianceRate: number | null // 差異率（%）
}

/** 消化率推移取得レスポンス */
export interface BffBudgetConsumptionChartResponse {
  months: BffBudgetConsumptionMonth[]
  annualBudget: number
}

// ============================================
// Year Comparison (前年比較) DTOs
// ============================================

/** 前年比較取得リクエスト */
export interface BffBudgetYearComparisonRequest {
  filters: BffBudgetTrendFilters
  organizationId?: string
}

/** 月次前年比較データ */
export interface BffBudgetYearComparisonMonth {
  month: string
  monthNo: number
  currentYear: number | null // 当年実績
  priorYear: number | null // 前年実績
  variance: number | null // 差異
  varianceRate: number | null // 差異率（%）
}

/** 前年比較取得レスポンス */
export interface BffBudgetYearComparisonResponse {
  months: BffBudgetYearComparisonMonth[]
  ytdCurrentYear: number
  ytdPriorYear: number
  ytdVariance: number
  ytdVarianceRate: number
}

// ============================================
// Landing Forecast (着地予測) DTOs
// ============================================

/** 着地予測取得リクエスト */
export interface BffBudgetLandingForecastRequest {
  filters: BffBudgetTrendFilters
  organizationId?: string
}

/** 着地予測データ */
export interface BffBudgetLandingForecast {
  annualBudget: number
  ytdActual: number
  remainingForecast: number
  landingForecast: number
  achievementRate: number
  priorYearActual: number
  priorYearVariance: number
  priorYearVarianceRate: number
}

/** 着地予測取得レスポンス */
export interface BffBudgetLandingForecastResponse {
  forecast: BffBudgetLandingForecast
}

// ============================================
// Organization Breakdown (組織別内訳) DTOs
// ============================================

/** 組織別内訳取得リクエスト */
export interface BffBudgetOrgBreakdownRequest {
  filters: BffBudgetTrendFilters
  organizationId: string
}

/** 組織別データ */
export interface BffBudgetOrgBreakdown {
  organizationId: string
  organizationName: string
  isSummary: boolean
  budget: number
  actual: number
  consumptionRate: number
  variance: number
  varianceRate: number
  priorYearActual: number
  priorYearVariance: number
}

/** 組織別内訳取得レスポンス */
export interface BffBudgetOrgBreakdownResponse {
  organizations: BffBudgetOrgBreakdown[]
}

// ============================================
// Organization Tree DTOs
// ============================================

/** 組織ツリーノード */
export interface BffBudgetTrendOrgNode {
  id: string
  name: string
  level: number
  hasChildren: boolean
  children?: BffBudgetTrendOrgNode[]
}

/** 組織ツリー取得レスポンス */
export interface BffBudgetTrendOrgTreeResponse {
  nodes: BffBudgetTrendOrgNode[]
}

// ============================================
// Error Types
// ============================================

export const BudgetTrendReportErrorCode = {
  ORGANIZATION_NOT_FOUND: "BUDGET_TREND_ORGANIZATION_NOT_FOUND",
  FISCAL_YEAR_NOT_FOUND: "BUDGET_TREND_FISCAL_YEAR_NOT_FOUND",
  NO_DATA_FOUND: "BUDGET_TREND_NO_DATA_FOUND",
  INVALID_FILTER: "BUDGET_TREND_INVALID_FILTER",
  VALIDATION_ERROR: "BUDGET_TREND_VALIDATION_ERROR",
} as const

export type BudgetTrendReportErrorCode =
  (typeof BudgetTrendReportErrorCode)[keyof typeof BudgetTrendReportErrorCode]

export interface BudgetTrendReportError {
  code: BudgetTrendReportErrorCode
  message: string
  details?: Record<string, unknown>
}

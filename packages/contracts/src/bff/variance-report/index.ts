/**
 * BFF Contracts: variance-report (差異分析レポート)
 *
 * SSoT: .kiro/specs/仕様概要/予算実績照会レポート.md
 *
 * ウォーターフォールチャートによる差異分析、科目別・組織別差異を提供
 */

// ============================================
// Common Types
// ============================================

/** 比較モード */
export const VarianceComparisonMode = {
  BUDGET_ACTUAL: "budget_actual", // 予算 vs 実績+見込
  FORECAST_PREVIOUS: "forecast_previous", // 今回見込 vs 前回見込
  YEAR_OVER_YEAR: "year_over_year", // 当年 vs 前年
} as const
export type VarianceComparisonMode = (typeof VarianceComparisonMode)[keyof typeof VarianceComparisonMode]

/** 期間タイプ */
export const VariancePeriodType = {
  MONTHLY: "monthly",
  CUMULATIVE: "cumulative",
  QUARTERLY: "quarterly",
  ANNUAL: "annual",
} as const
export type VariancePeriodType = (typeof VariancePeriodType)[keyof typeof VariancePeriodType]

/** 内訳タイプ */
export const VarianceBreakdownType = {
  ACCOUNT: "account", // 科目別
  ORGANIZATION: "organization", // 組織別
} as const
export type VarianceBreakdownType = (typeof VarianceBreakdownType)[keyof typeof VarianceBreakdownType]

/** フィルターパラメータ */
export interface BffVarianceReportFilters {
  comparisonMode: VarianceComparisonMode
  periodType: VariancePeriodType
  selectedMonth?: string // "2024-10" etc.
  selectedQuarter?: string // "2024-Q3" etc.
}

// ============================================
// Summary DTOs
// ============================================

/** サマリー取得リクエスト */
export interface BffVarianceReportSummaryRequest {
  filters: BffVarianceReportFilters
  organizationId?: string
}

/** サマリーデータ */
export interface BffVarianceReportSummary {
  budget: number
  actual: number
  variance: number
  varianceRate: number
  isPositive: boolean
}

/** サマリー取得レスポンス */
export interface BffVarianceReportSummaryResponse {
  summary: BffVarianceReportSummary
  targetSubjectName: string // "営業利益" etc.
}

// ============================================
// Waterfall Chart DTOs
// ============================================

/** ウォーターフォール取得リクエスト */
export interface BffVarianceWaterfallRequest {
  filters: BffVarianceReportFilters
  organizationId?: string
  targetSubjectId?: string // ドリルダウン対象科目
}

/** ウォーターフォール項目 */
export interface BffVarianceWaterfallItem {
  subjectId: string
  subjectCode: string
  subjectName: string
  variance: number
  profitImpact: number // 利益への影響（coefficient考慮）
  isPositive: boolean
  hasChildren: boolean // ドリルダウン可能か
  sortOrder: number
  indentLevel: number
}

/** ウォーターフォール取得レスポンス */
export interface BffVarianceWaterfallResponse {
  startValue: number // 起点値（予算）
  endValue: number // 終点値（実績+見込）
  items: BffVarianceWaterfallItem[]
  totalVariance: number
  breadcrumbs: BffVarianceBreadcrumb[]
}

/** パンくずリスト */
export interface BffVarianceBreadcrumb {
  subjectId: string
  subjectName: string
}

// ============================================
// Detail Table (詳細テーブル) DTOs
// ============================================

/** 詳細テーブル取得リクエスト */
export interface BffVarianceDetailTableRequest {
  filters: BffVarianceReportFilters
  organizationId?: string
  breakdownType: VarianceBreakdownType
}

/** 科目別詳細行 */
export interface BffVarianceAccountRow {
  subjectId: string
  subjectCode: string
  subjectName: string
  indentLevel: number
  budget: number
  actual: number
  variance: number
  varianceRate: number
  isPositive: boolean
}

/** 組織別詳細行 */
export interface BffVarianceOrganizationRow {
  organizationId: string
  organizationCode: string
  organizationName: string
  indentLevel: number
  budget: number
  actual: number
  variance: number
  varianceRate: number
  isPositive: boolean
}

/** 詳細テーブル取得レスポンス（科目別） */
export interface BffVarianceAccountDetailResponse {
  rows: BffVarianceAccountRow[]
}

/** 詳細テーブル取得レスポンス（組織別） */
export interface BffVarianceOrganizationDetailResponse {
  rows: BffVarianceOrganizationRow[]
}

// ============================================
// Subject Selection DTOs
// ============================================

/** 科目選択肢取得リクエスト */
export interface BffVarianceSubjectOptionsRequest {
  organizationId?: string
}

/** 科目選択肢 */
export interface BffVarianceSubjectOption {
  id: string
  code: string
  name: string
  subjectType: "BASE" | "AGGREGATE"
}

/** 科目選択肢取得レスポンス */
export interface BffVarianceSubjectOptionsResponse {
  subjects: BffVarianceSubjectOption[]
}

// ============================================
// Organization Tree DTOs
// ============================================

/** 組織ツリーノード */
export interface BffVarianceOrgNode {
  id: string
  name: string
  level: number
  hasChildren: boolean
  children?: BffVarianceOrgNode[]
}

/** 組織ツリー取得レスポンス */
export interface BffVarianceOrgTreeResponse {
  nodes: BffVarianceOrgNode[]
}

// ============================================
// Error Types
// ============================================

export const VarianceReportErrorCode = {
  ORGANIZATION_NOT_FOUND: "VARIANCE_REPORT_ORGANIZATION_NOT_FOUND",
  SUBJECT_NOT_FOUND: "VARIANCE_REPORT_SUBJECT_NOT_FOUND",
  NO_DATA_FOUND: "VARIANCE_REPORT_NO_DATA_FOUND",
  INVALID_FILTER: "VARIANCE_REPORT_INVALID_FILTER",
  INVALID_COMPARISON_MODE: "VARIANCE_REPORT_INVALID_COMPARISON_MODE",
  VALIDATION_ERROR: "VARIANCE_REPORT_VALIDATION_ERROR",
} as const

export type VarianceReportErrorCode = (typeof VarianceReportErrorCode)[keyof typeof VarianceReportErrorCode]

export interface VarianceReportError {
  code: VarianceReportErrorCode
  message: string
  details?: Record<string, unknown>
}

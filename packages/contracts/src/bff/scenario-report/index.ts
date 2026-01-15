/**
 * BFF Contracts: scenario-report (シナリオ分析レポート)
 *
 * SSoT: .kiro/specs/仕様概要/見込シナリオ機能.md
 *
 * W/N/B（ワースト/ノーマル/ベスト）シナリオの比較分析を提供
 */

// ============================================
// Common Types
// ============================================

/** シナリオタイプ */
export const ScenarioType = {
  WORST: "worst",
  NORMAL: "normal",
  BEST: "best",
} as const
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType]

/** フィルターパラメータ */
export interface BffScenarioReportFilters {
  fiscalYear: string // "2024", "2025" etc.
  accountType: "revenue" | "gross_profit" | "operating_profit"
  forecastEventId?: string
}

// ============================================
// Summary DTOs
// ============================================

/** サマリー取得リクエスト */
export interface BffScenarioReportSummaryRequest {
  filters: BffScenarioReportFilters
  organizationId?: string
}

/** シナリオ別サマリー */
export interface BffScenarioSummary {
  worst: number
  normal: number
  best: number
  budget: number
  range: number // best - worst（ブレ幅）
  rangeRate: number // ブレ幅の割合（%）
}

/** サマリー取得レスポンス */
export interface BffScenarioReportSummaryResponse {
  summary: BffScenarioSummary
  targetSubjectName: string
  worstVsBudgetRate: number // ワースト vs 予算（%）
  normalVsBudgetRate: number // ノーマル vs 予算（%）
  bestVsBudgetRate: number // ベスト vs 予算（%）
}

// ============================================
// Comparison Chart (シナリオ比較) DTOs
// ============================================

/** シナリオ比較取得リクエスト */
export interface BffScenarioComparisonRequest {
  filters: BffScenarioReportFilters
  organizationId?: string
}

/** 月次シナリオデータ */
export interface BffScenarioComparisonMonth {
  month: string // "4月", "5月" etc.
  monthNo: number // 4, 5 etc.
  worst: number
  normal: number
  best: number
  budget: number
  isWnbEnabled: boolean // W/N/B入力対象月か
}

/** シナリオ比較取得レスポンス */
export interface BffScenarioComparisonResponse {
  months: BffScenarioComparisonMonth[]
  annualSummary: {
    worst: number
    normal: number
    best: number
    budget: number
  }
  wnbStartMonth: number // W/N/B開始月
}

// ============================================
// Range Analysis (ブレ幅分析) DTOs
// ============================================

/** ブレ幅分析取得リクエスト */
export interface BffScenarioRangeAnalysisRequest {
  filters: BffScenarioReportFilters
  organizationId?: string
}

/** ブレ幅分析データ */
export interface BffScenarioRangeData {
  subjectId: string
  subjectCode: string
  subjectName: string
  worst: number
  normal: number
  best: number
  range: number // best - worst
  rangeRate: number // range / normal * 100
  riskAmount: number // normal - worst
  opportunityAmount: number // best - normal
}

/** ブレ幅分析取得レスポンス */
export interface BffScenarioRangeAnalysisResponse {
  subjects: BffScenarioRangeData[]
  totalRange: number
  totalRangeRate: number
}

// ============================================
// Organization Comparison (組織別比較) DTOs
// ============================================

/** 組織別シナリオ比較取得リクエスト */
export interface BffScenarioOrgComparisonRequest {
  filters: BffScenarioReportFilters
  organizationId: string // 比較対象の親組織
}

/** 組織別シナリオデータ */
export interface BffScenarioOrgData {
  organizationId: string
  organizationName: string
  isSummary: boolean
  worst: number
  normal: number
  best: number
  budget: number
  range: number
  rangeRate: number
  worstVsBudgetRate: number
  normalVsBudgetRate: number
  bestVsBudgetRate: number
}

/** 組織別シナリオ比較取得レスポンス */
export interface BffScenarioOrgComparisonResponse {
  organizations: BffScenarioOrgData[]
}

// ============================================
// Detail Table (詳細テーブル) DTOs
// ============================================

/** 詳細テーブル取得リクエスト */
export interface BffScenarioDetailTableRequest {
  filters: BffScenarioReportFilters
  organizationId?: string
}

/** 詳細テーブル行 */
export interface BffScenarioDetailRow {
  periodNo: number
  periodLabel: string
  worst: number | null
  normal: number
  best: number | null
  budget: number
  isWnbEnabled: boolean
  worstVsNormal: number | null // worst - normal
  bestVsNormal: number | null // best - normal
}

/** 詳細テーブル取得レスポンス */
export interface BffScenarioDetailTableResponse {
  rows: BffScenarioDetailRow[]
  annualSummary: {
    worst: number
    normal: number
    best: number
    budget: number
  }
}

// ============================================
// Forecast Event DTOs
// ============================================

/** 見込イベント選択肢 */
export interface BffForecastEventOption {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  wnbStartPeriodNo: number | null
}

/** 見込イベント一覧取得レスポンス */
export interface BffForecastEventListResponse {
  events: BffForecastEventOption[]
}

// ============================================
// Organization Tree DTOs
// ============================================

/** 組織ツリーノード */
export interface BffScenarioOrgNode {
  id: string
  name: string
  level: number
  hasChildren: boolean
  children?: BffScenarioOrgNode[]
}

/** 組織ツリー取得レスポンス */
export interface BffScenarioOrgTreeResponse {
  nodes: BffScenarioOrgNode[]
}

// ============================================
// Error Types
// ============================================

export const ScenarioReportErrorCode = {
  ORGANIZATION_NOT_FOUND: "SCENARIO_REPORT_ORGANIZATION_NOT_FOUND",
  FORECAST_EVENT_NOT_FOUND: "SCENARIO_REPORT_FORECAST_EVENT_NOT_FOUND",
  NO_DATA_FOUND: "SCENARIO_REPORT_NO_DATA_FOUND",
  WNB_NOT_ENABLED: "SCENARIO_REPORT_WNB_NOT_ENABLED",
  INVALID_FILTER: "SCENARIO_REPORT_INVALID_FILTER",
  VALIDATION_ERROR: "SCENARIO_REPORT_VALIDATION_ERROR",
} as const

export type ScenarioReportErrorCode = (typeof ScenarioReportErrorCode)[keyof typeof ScenarioReportErrorCode]

export interface ScenarioReportError {
  code: ScenarioReportErrorCode
  message: string
  details?: Record<string, unknown>
}

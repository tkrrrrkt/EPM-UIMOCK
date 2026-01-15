/**
 * BFF Contracts: confidence-report (確度別売上見込レポート)
 *
 * SSoT: .kiro/specs/仕様概要/確度管理機能.md
 *
 * 確度ランク別（S/A/B/C/D/Z）の売上見込を集計・分析するレポート
 * 期待値計算、組織別比較、推移分析を提供
 */

// ============================================
// Common Types
// ============================================

/** フィルターパラメータ */
export interface BffConfidenceReportFilters {
  period: string // "FY2025", "2025-10", "2025-Q4" etc.
  organizationId: string // "all" or specific org ID
  accountType: "revenue" | "gross_profit"
  ownerId?: string // "all" or specific owner ID
}

/** 確度レベル情報 */
export interface BffConfidenceLevelInfo {
  code: string // "S", "A", "B", "C", "D", "Z"
  name: string // "受注確定", "80%見込" etc.
  nameShort: string // "S", "A" etc.
  probabilityRate: number // 0.0 - 1.0
  colorCode: string // "#22C55E" etc.
  sortOrder: number
}

// ============================================
// Summary DTOs
// ============================================

/** サマリー取得リクエスト */
export interface BffConfidenceReportSummaryRequest {
  filters: BffConfidenceReportFilters
  organizationId?: string // 選択された組織
}

/** サマリーカード */
export interface BffConfidenceReportSummary {
  totalForecast: number // 総見込額
  expectedValue: number // 期待値合計
  highConfidence: number // 高確度（S+A）合計
  projectCount: number // 案件数
  budget: number // 予算
  previousExpectedValue: number // 前月期待値（比較用）
}

/** サマリー取得レスポンス */
export interface BffConfidenceReportSummaryResponse {
  summary: BffConfidenceReportSummary
  confidenceLevels: BffConfidenceLevelInfo[]
}

// ============================================
// Stack View (確度別積み上げ) DTOs
// ============================================

/** 積み上げビュー取得リクエスト */
export interface BffConfidenceStackViewRequest {
  filters: BffConfidenceReportFilters
  organizationId?: string
}

/** 確度別金額データ */
export interface BffConfidenceStackData {
  levelCode: string
  levelName: string
  colorCode: string
  amount: number
  count: number
  percentage: number
}

/** 積み上げビュー取得レスポンス */
export interface BffConfidenceStackViewResponse {
  stacks: BffConfidenceStackData[]
  totalAmount: number
  expectedValue: number
}

// ============================================
// Trend Chart (推移グラフ) DTOs
// ============================================

/** 推移グラフ取得リクエスト */
export interface BffConfidenceTrendRequest {
  filters: BffConfidenceReportFilters
  organizationId?: string
}

/** 月次推移データ */
export interface BffConfidenceTrendMonth {
  month: string // "4月", "5月" etc.
  monthNo: number // 4, 5 etc.
  S: number
  A: number
  B: number
  C: number
  D: number
  Z: number
  total: number
  expectedValue: number
}

/** 推移グラフ取得レスポンス */
export interface BffConfidenceTrendResponse {
  months: BffConfidenceTrendMonth[]
  confidenceLevels: BffConfidenceLevelInfo[]
}

// ============================================
// Organization Comparison (組織別比較) DTOs
// ============================================

/** 組織別比較取得リクエスト */
export interface BffConfidenceOrgComparisonRequest {
  filters: BffConfidenceReportFilters
  organizationId: string // 比較対象の親組織
}

/** 組織別確度データ */
export interface BffConfidenceOrgData {
  organizationId: string
  organizationName: string
  isSummary: boolean // 合計行かどうか
  confidence: Record<
    string,
    {
      amount: number
      count: number
      percentage: number
    }
  >
  total: number
  expectedValue: number
  achievementRate: number
}

/** 組織別比較取得レスポンス */
export interface BffConfidenceOrgComparisonResponse {
  organizations: BffConfidenceOrgData[]
  confidenceLevels: BffConfidenceLevelInfo[]
}

// ============================================
// Project Detail (案件詳細) DTOs
// ============================================

/** 案件一覧取得リクエスト */
export interface BffConfidenceProjectListRequest {
  filters: BffConfidenceReportFilters
  organizationId?: string
  confidenceLevel?: string // 特定の確度でフィルタ
  page?: number
  pageSize?: number
  sortBy?: "projectName" | "amount" | "expectedAmount" | "confidenceLevel" | "owner"
  sortOrder?: "asc" | "desc"
}

/** 案件データ */
export interface BffConfidenceProject {
  projectId: string
  projectCode: string
  projectName: string
  organizationName: string
  ownerName: string
  confidenceLevelCode: string
  confidenceLevelName: string
  amount: number
  expectedAmount: number
  colorCode: string
}

/** 案件一覧取得レスポンス */
export interface BffConfidenceProjectListResponse {
  projects: BffConfidenceProject[]
  totalCount: number
  page: number
  pageSize: number
}

// ============================================
// Organization Tree DTOs
// ============================================

/** 組織ツリーノード */
export interface BffConfidenceOrgNode {
  id: string
  name: string
  level: number
  hasChildren: boolean
  children?: BffConfidenceOrgNode[]
}

/** 組織ツリー取得レスポンス */
export interface BffConfidenceOrgTreeResponse {
  nodes: BffConfidenceOrgNode[]
}

// ============================================
// Error Types
// ============================================

export const ConfidenceReportErrorCode = {
  ORGANIZATION_NOT_FOUND: "CONFIDENCE_REPORT_ORGANIZATION_NOT_FOUND",
  PERIOD_NOT_FOUND: "CONFIDENCE_REPORT_PERIOD_NOT_FOUND",
  NO_DATA_FOUND: "CONFIDENCE_REPORT_NO_DATA_FOUND",
  INVALID_FILTER: "CONFIDENCE_REPORT_INVALID_FILTER",
  VALIDATION_ERROR: "CONFIDENCE_REPORT_VALIDATION_ERROR",
} as const

export type ConfidenceReportErrorCode =
  (typeof ConfidenceReportErrorCode)[keyof typeof ConfidenceReportErrorCode]

export interface ConfidenceReportError {
  code: ConfidenceReportErrorCode
  message: string
  details?: Record<string, unknown>
}

// Metrics Master BFF Contracts
// packages/contracts/src/bff/metrics-master/index.ts
// SSoT: .kiro/specs/master-data/metrics-master/design.md

// ============================================================
// Common Types
// ============================================================

export type MetricType = 'FIN_METRIC' | 'KPI_METRIC'

// ============================================================
// Request DTOs
// ============================================================

/**
 * 指標一覧取得リクエスト
 * design.md: BffListMetricsRequest
 * Note: companyId はセッションコンテキストから取得（リクエストには含めない）
 */
export interface BffListMetricsRequest {
  page?: number              // default: 1
  pageSize?: number          // default: 50, max: 200
  sortBy?: 'metricCode' | 'metricName' | 'metricType'
  sortOrder?: 'asc' | 'desc'
  keyword?: string           // 指標コード・指標名部分一致
  metricType?: MetricType    // 指標タイプフィルタ
  isActive?: boolean         // 有効フラグフィルタ
}

/**
 * 指標新規登録リクエスト
 * design.md: BffCreateMetricRequest
 * Note: companyId はセッションコンテキストから取得（リクエストには含めない）
 */
export interface BffCreateMetricRequest {
  metricCode: string
  metricName: string
  metricType: MetricType
  resultMeasureKind: string  // 通常は 'AMOUNT'
  unit?: string
  scale?: number
  formulaExpr: string        // 式（例: SUB("OP") + SUB("DA")）
  description?: string
}

/**
 * 指標更新リクエスト
 * design.md: BffUpdateMetricRequest
 */
export interface BffUpdateMetricRequest {
  metricCode?: string
  metricName?: string
  metricType?: MetricType
  resultMeasureKind?: string
  unit?: string
  scale?: number
  formulaExpr?: string
  description?: string
}

// ============================================================
// Response DTOs
// ============================================================

/**
 * 指標サマリ（一覧用）
 * design.md: BffMetricSummary
 */
export interface BffMetricSummary {
  id: string
  metricCode: string
  metricName: string
  metricType: MetricType
  unit: string | null
  isActive: boolean
}

/**
 * 指標一覧レスポンス
 * design.md: BffListMetricsResponse
 */
export interface BffListMetricsResponse {
  items: BffMetricSummary[]
  totalCount: number
  page: number
  pageSize: number
}

/**
 * 指標詳細レスポンス
 * design.md: BffMetricDetailResponse
 */
export interface BffMetricDetailResponse {
  id: string
  metricCode: string
  metricName: string
  metricType: MetricType
  resultMeasureKind: string
  unit: string | null
  scale: number
  formulaExpr: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// Error Codes
// ============================================================

/**
 * エラーコード
 * design.md: MetricsMasterErrorCode
 */
export const MetricsMasterErrorCode = {
  METRIC_NOT_FOUND: 'METRIC_NOT_FOUND',
  METRIC_CODE_DUPLICATE: 'METRIC_CODE_DUPLICATE',
  METRIC_ALREADY_INACTIVE: 'METRIC_ALREADY_INACTIVE',
  METRIC_ALREADY_ACTIVE: 'METRIC_ALREADY_ACTIVE',
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  COMPANY_ACCESS_DENIED: 'COMPANY_ACCESS_DENIED',
  COMPANY_NOT_SELECTED: 'COMPANY_NOT_SELECTED',
  FORMULA_SYNTAX_ERROR: 'FORMULA_SYNTAX_ERROR',
  SUBJECT_CODE_NOT_FOUND: 'SUBJECT_CODE_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type MetricsMasterErrorCode =
  (typeof MetricsMasterErrorCode)[keyof typeof MetricsMasterErrorCode]

export interface MetricsMasterError {
  code: MetricsMasterErrorCode
  message: string
  details?: Record<string, unknown>
}

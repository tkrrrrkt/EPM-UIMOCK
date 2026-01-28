// KPI Definitions BFF Contracts
// packages/contracts/src/bff/kpi-definitions/index.ts
// SSoT: .kiro/specs/master-data/kpi-definitions/design.md

// ============================================================
// Enums
// ============================================================

/**
 * 集計方法
 * design.md: AggregationMethod
 */
export const AggregationMethod = {
  SUM: 'SUM',   // 合計
  EOP: 'EOP',   // 期末値
  AVG: 'AVG',   // 平均
  MAX: 'MAX',   // 最大値
  MIN: 'MIN',   // 最小値
} as const

export type AggregationMethod = (typeof AggregationMethod)[keyof typeof AggregationMethod]

/**
 * 方向性
 * design.md: Direction
 */
export const Direction = {
  HIGHER_IS_BETTER: 'higher_is_better',   // 高いほど良い
  LOWER_IS_BETTER: 'lower_is_better',     // 低いほど良い
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]

// ============================================================
// Request DTOs
// ============================================================

/**
 * KPI定義一覧取得リクエスト
 * design.md: BffListKpiDefinitionsRequest
 * Note: companyId はセッションコンテキストから取得（リクエストには含めない）
 */
export interface BffListKpiDefinitionsRequest {
  page?: number                // default: 1
  pageSize?: number            // default: 50, max: 200
  sortBy?: 'kpiCode' | 'kpiName' | 'aggregationMethod'
  sortOrder?: 'asc' | 'desc'
  keyword?: string             // KPIコード・KPI名部分一致
  aggregationMethod?: AggregationMethod  // 集計方法フィルタ
  isActive?: boolean           // 有効フラグフィルタ
}

/**
 * KPI定義新規登録リクエスト
 * design.md: BffCreateKpiDefinitionRequest
 * Note: companyId はセッションコンテキストから取得（リクエストには含めない）
 */
export interface BffCreateKpiDefinitionRequest {
  kpiCode: string
  kpiName: string
  description?: string
  unit?: string                // 単位（%, 件, pt等）
  aggregationMethod: AggregationMethod
  direction?: Direction        // 方向性（null許可）
}

/**
 * KPI定義更新リクエスト
 * design.md: BffUpdateKpiDefinitionRequest
 */
export interface BffUpdateKpiDefinitionRequest {
  kpiCode?: string
  kpiName?: string
  description?: string
  unit?: string
  aggregationMethod?: AggregationMethod
  direction?: Direction | null
}

// ============================================================
// Response DTOs
// ============================================================

/**
 * KPI定義サマリ（一覧用）
 * design.md: BffKpiDefinitionSummary
 */
export interface BffKpiDefinitionSummary {
  id: string
  kpiCode: string
  kpiName: string
  unit: string | null
  aggregationMethod: AggregationMethod
  direction: Direction | null
  isActive: boolean
}

/**
 * KPI定義一覧レスポンス
 * design.md: BffListKpiDefinitionsResponse
 */
export interface BffListKpiDefinitionsResponse {
  items: BffKpiDefinitionSummary[]
  totalCount: number
  page: number
  pageSize: number
}

/**
 * KPI定義詳細レスポンス
 * design.md: BffKpiDefinitionDetailResponse
 */
export interface BffKpiDefinitionDetailResponse {
  id: string
  kpiCode: string
  kpiName: string
  description: string | null
  unit: string | null
  aggregationMethod: AggregationMethod
  direction: Direction | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// Error Codes
// ============================================================

/**
 * エラーコード
 * design.md: KpiDefinitionsErrorCode
 */
export const KpiDefinitionsErrorCode = {
  KPI_DEFINITION_NOT_FOUND: 'KPI_DEFINITION_NOT_FOUND',
  KPI_CODE_DUPLICATE: 'KPI_CODE_DUPLICATE',
  KPI_DEFINITION_ALREADY_INACTIVE: 'KPI_DEFINITION_ALREADY_INACTIVE',
  KPI_DEFINITION_ALREADY_ACTIVE: 'KPI_DEFINITION_ALREADY_ACTIVE',
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  COMPANY_ACCESS_DENIED: 'COMPANY_ACCESS_DENIED',
  COMPANY_NOT_SELECTED: 'COMPANY_NOT_SELECTED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type KpiDefinitionsErrorCode =
  (typeof KpiDefinitionsErrorCode)[keyof typeof KpiDefinitionsErrorCode]

export interface KpiDefinitionsError {
  code: KpiDefinitionsErrorCode
  message: string
  details?: Record<string, unknown>
}

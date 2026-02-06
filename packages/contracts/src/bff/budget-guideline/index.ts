// ============================================
// BFF Contract Types for Budget Guideline
// ============================================

// ============================================
// Enums
// ============================================
export const GuidelineEventStatus = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
} as const
export type GuidelineEventStatus = (typeof GuidelineEventStatus)[keyof typeof GuidelineEventStatus]

export const PeriodType = {
  ANNUAL: "ANNUAL",
  HALF: "HALF",
  QUARTER: "QUARTER",
} as const
export type PeriodType = (typeof PeriodType)[keyof typeof PeriodType]

// ============================================
// Event DTOs
// ============================================
export interface BffListGuidelineEventsRequest {
  page?: number
  pageSize?: number
  sortBy?: "eventCode" | "eventName" | "fiscalYear" | "periodType" | "status" | "updatedAt"
  sortOrder?: "asc" | "desc"
  status?: GuidelineEventStatus
  fiscalYear?: number
  periodType?: PeriodType
}

export interface BffGuidelineEventSummary {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  periodType: PeriodType
  periodNo: number
  status: GuidelineEventStatus
  updatedAt: string
}

export interface BffListGuidelineEventsResponse {
  items: BffGuidelineEventSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCreateGuidelineEventRequest {
  eventCode: string
  eventName: string
  fiscalYear: number
  periodType: PeriodType
  periodNo: number
  dimensionId: string
  layoutId: string
  description?: string
}

export interface BffUpdateGuidelineEventRequest {
  eventName?: string
  status?: GuidelineEventStatus
  description?: string
}

export interface BffDuplicateGuidelineEventRequest {
  newEventCode: string
  newEventName: string
}

export interface BffGuidelineEventResponse {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  periodType: PeriodType
  periodNo: number
  dimensionId: string
  layoutId: string
  status: GuidelineEventStatus
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface BffGuidelineEventDetailResponse extends BffGuidelineEventResponse {
  dimensionName: string
  layoutName: string
  dimensionValues: BffDimensionValueSummary[]
}

export interface BffDimensionValueSummary {
  id: string
  valueCode: string
  valueName: string
  isTotal: boolean
}

// ============================================
// Amount DTOs (Input Tab)
// ============================================
export interface BffGetGuidelineAmountsRequest {
  dimensionValueId?: string
}

export interface BffGuidelineAmountCell {
  subjectId: string
  periodKey: string
  amount: string
}

export interface BffGuidelineAmountsResponse {
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  amounts: BffGuidelineAmountCell[]
  isReadOnly: boolean
}

export interface BffSubjectRow {
  id: string
  subjectCode: string
  subjectName: string
  sortOrder: number
  isAggregate: boolean
  parentRowId: string | null // ツリー構造用（レイアウトマスタに基づく）
  indentLevel: number // 階層レベル（0から開始）
  treePath: string[] // AG-Grid Tree Data用のパス（例: ["売上高", "製品売上高"]）
}

export interface BffPeriodColumn {
  key: string
  label: string
  fiscalYear: number
  periodType: PeriodType
  periodNo: number
}

export interface BffSaveGuidelineAmountsRequest {
  dimensionValueId: string
  amounts: BffGuidelineAmountCell[]
}

export interface BffSaveGuidelineAmountsResponse {
  savedCount: number
  updatedAt: string
}

// ============================================
// Actuals DTOs (Past 5 Years)
// ============================================
export interface BffGetActualsRequest {
  dimensionValueId?: string
  yearsBack?: number
}

export interface BffActualsResponse {
  subjects: BffSubjectRow[]
  fiscalYears: number[]
  amounts: BffActualCell[]
}

export interface BffActualCell {
  subjectId: string
  fiscalYear: number
  amount: string
}

// ============================================
// Overview DTOs (Company-wide view - MTP unified format)
// ============================================
export interface BffOverviewResponse {
  subjects: BffSubjectRow[]
  actualYears: number[] // 過去5年分の実績年度
  guidelineYear: number // ガイドライン対象年度
  dimensionValues: BffDimensionValueSummary[] // 全社 + 各セグメント
  amounts: BffOverviewAmountCell[]
}

export interface BffOverviewAmountCell {
  subjectId: string
  fiscalYear: number
  dimensionValueId: string | null // null = 全社合計
  amount: string
  isActual: boolean // true = 実績, false = ガイドライン
}

// ============================================
// Trend DTOs (Time series - Annual only)
// ============================================
export interface BffGetTrendRequest {
  subjectId?: string
  dimensionValueId?: string
}

export interface BffTrendResponse {
  subjects: BffSubjectRow[]
  dimensionValues: BffDimensionValueSummary[]
  selectedSubjectId: string
  selectedDimensionValueId: string | null
  dataPoints: BffTrendDataPoint[]
}

export interface BffTrendDataPoint {
  fiscalYear: number
  isActual: boolean
  amount: string
}

// ============================================
// Error Types
// ============================================
export const GuidelineErrorCode = {
  EVENT_NOT_FOUND: "GUIDELINE_EVENT_NOT_FOUND",
  EVENT_CODE_DUPLICATE: "GUIDELINE_EVENT_CODE_DUPLICATE",
  EVENT_CONFIRMED_IMMUTABLE: "GUIDELINE_EVENT_CONFIRMED_IMMUTABLE",
  EVENT_CONFIRMED_DELETE_DENIED: "GUIDELINE_EVENT_CONFIRMED_DELETE_DENIED",
  DIMENSION_NOT_FOUND: "GUIDELINE_DIMENSION_NOT_FOUND",
  LAYOUT_NOT_FOUND: "GUIDELINE_LAYOUT_NOT_FOUND",
  INVALID_PERIOD_COMBINATION: "GUIDELINE_INVALID_PERIOD_COMBINATION",
  VALIDATION_ERROR: "GUIDELINE_VALIDATION_ERROR",
} as const

export type GuidelineErrorCode = (typeof GuidelineErrorCode)[keyof typeof GuidelineErrorCode]

export interface GuidelineError {
  code: GuidelineErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================
// Master Data DTOs
// ============================================
export interface BffDimensionSummary {
  id: string
  dimensionCode: string
  dimensionName: string
}

export interface BffLayoutSummary {
  id: string
  layoutCode: string
  layoutName: string
  layoutType: string
}

// ============================================
// Enums
// ============================================
export const MtpEventStatus = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
} as const
export type MtpEventStatus = (typeof MtpEventStatus)[keyof typeof MtpEventStatus]

export const PlanYears = {
  THREE: 3,
  FIVE: 5,
} as const
export type PlanYears = (typeof PlanYears)[keyof typeof PlanYears]

// ============================================
// Event DTOs
// ============================================
export interface BffListMtpEventsRequest {
  page?: number
  pageSize?: number
  sortBy?: "eventCode" | "eventName" | "startFiscalYear" | "status" | "updatedAt"
  sortOrder?: "asc" | "desc"
  status?: MtpEventStatus
}

export interface BffMtpEventSummary {
  id: string
  eventCode: string
  eventName: string
  planYears: number
  startFiscalYear: number
  endFiscalYear: number
  status: MtpEventStatus
  updatedAt: string
}

export interface BffListMtpEventsResponse {
  items: BffMtpEventSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCreateMtpEventRequest {
  eventCode: string
  eventName: string
  planYears: PlanYears
  startFiscalYear: number
  dimensionId: string
  layoutId: string
  description?: string
}

export interface BffUpdateMtpEventRequest {
  eventName?: string
  status?: MtpEventStatus
  description?: string
}

export interface BffDuplicateMtpEventRequest {
  newEventCode: string
  newEventName: string
}

export interface BffMtpEventResponse {
  id: string
  eventCode: string
  eventName: string
  planYears: number
  startFiscalYear: number
  endFiscalYear: number
  dimensionId: string
  layoutId: string
  status: MtpEventStatus
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface BffMtpEventDetailResponse extends BffMtpEventResponse {
  dimensionName: string
  layoutName: string
  dimensionValues: BffDimensionValueSummary[]
}

export interface BffDimensionValueSummary {
  id: string
  valueCode: string
  valueName: string
}

// ============================================
// Amount DTOs（入力タブ用）
// ============================================
export interface BffGetMtpAmountsRequest {
  dimensionValueId?: string // null = 全社合計
}

export interface BffAmountColumn {
  fiscalYear: number
  isActual: boolean // true = 実績列（グレー背景）, false = 計画列
}

export interface BffMtpAmountCell {
  subjectId: string
  fiscalYear: number
  amount: string // Decimal as string
  isActual: boolean
}

export interface BffMtpAmountsResponse {
  subjects: BffSubjectRow[]
  columns: BffAmountColumn[] // 実績列 + 計画列の順
  amounts: BffMtpAmountCell[]
  isReadOnly: boolean // 全社選択時 or CONFIRMED時
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

export interface BffSaveMtpAmountsRequest {
  dimensionValueId: string
  amounts: BffMtpAmountCell[] // isActual=false のもののみ
}

export interface BffSaveMtpAmountsResponse {
  savedCount: number
  updatedAt: string
}

// ============================================
// Overview DTOs（全社俯瞰タブ用）
// ============================================
export interface BffMtpOverviewResponse {
  subjects: BffSubjectRow[]
  fiscalYears: number[] // 計画年度のみ
  dimensionValues: BffDimensionValueSummary[] // 全社 + 各事業部
  amounts: BffOverviewAmountCell[]
}

export interface BffOverviewAmountCell {
  subjectId: string
  fiscalYear: number
  dimensionValueId: string | null // null = 全社合計
  amount: string
}

// ============================================
// Trend DTOs（推移タブ用）
// ============================================
export interface BffGetMtpTrendRequest {
  subjectId?: string // 指定なしの場合はデフォルト科目
  dimensionValueId?: string // null = 全社
}

export interface BffMtpTrendResponse {
  subject: BffSubjectRow
  dimensionValue: BffDimensionValueSummary | null // null = 全社
  dataPoints: BffTrendDataPoint[]
  tableData: BffTrendTableRow[]
}

export interface BffTrendDataPoint {
  fiscalYear: number
  amount: number // グラフ用は number
  isActual: boolean
}

export interface BffTrendTableRow {
  subjectId: string
  subjectName: string
  amounts: { fiscalYear: number; amount: string; isActual: boolean }[]
}

// ============================================
// Strategy Theme DTOs
// ============================================
export interface BffStrategyThemeSummary {
  id: string
  themeCode: string
  themeName: string
  parentThemeId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  strategyCategory: string | null
  ownerName: string | null
  targetDate: string | null
  kpis: BffThemeKpiSummary[]
  children: BffStrategyThemeSummary[]
}

export interface BffThemeKpiSummary {
  subjectId: string
  subjectCode: string
  subjectName: string
}

export interface BffListStrategyThemesResponse {
  themes: BffStrategyThemeSummary[]
}

export interface BffCreateStrategyThemeRequest {
  themeCode: string
  themeName: string
  parentThemeId?: string
  dimensionValueId?: string
  strategyCategory?: string
  description?: string
  ownerEmployeeId?: string
  targetDate?: string
  kpiSubjectIds?: string[]
}

export interface BffUpdateStrategyThemeRequest {
  themeName?: string
  strategyCategory?: string
  description?: string
  ownerEmployeeId?: string
  targetDate?: string
  kpiSubjectIds?: string[]
}

export interface BffStrategyThemeResponse {
  id: string
  themeCode: string
  themeName: string
  parentThemeId: string | null
  dimensionValueId: string | null
  strategyCategory: string | null
  description: string | null
  ownerEmployeeId: string | null
  ownerName: string | null
  targetDate: string | null
  kpis: BffThemeKpiSummary[]
  createdAt: string
  updatedAt: string
}

// ============================================
// Error Types
// ============================================
export const MtpErrorCode = {
  EVENT_NOT_FOUND: "MTP_EVENT_NOT_FOUND",
  EVENT_CODE_DUPLICATE: "MTP_EVENT_CODE_DUPLICATE",
  EVENT_CONFIRMED_IMMUTABLE: "MTP_EVENT_CONFIRMED_IMMUTABLE",
  EVENT_CONFIRMED_DELETE_DENIED: "MTP_EVENT_CONFIRMED_DELETE_DENIED",
  THEME_NOT_FOUND: "MTP_THEME_NOT_FOUND",
  THEME_CODE_DUPLICATE: "MTP_THEME_CODE_DUPLICATE",
  THEME_HAS_CHILDREN: "MTP_THEME_HAS_CHILDREN",
  DIMENSION_NOT_FOUND: "MTP_DIMENSION_NOT_FOUND",
  LAYOUT_NOT_FOUND: "MTP_LAYOUT_NOT_FOUND",
  DIMENSION_VALUE_REQUIRED: "MTP_DIMENSION_VALUE_REQUIRED",
  VALIDATION_ERROR: "MTP_VALIDATION_ERROR",
} as const

export type MtpErrorCode = (typeof MtpErrorCode)[keyof typeof MtpErrorCode]

export interface MtpError {
  code: MtpErrorCode
  message: string
  details?: Record<string, unknown>
}

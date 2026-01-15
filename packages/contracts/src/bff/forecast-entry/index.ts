// BFF Contracts for Forecast Entry (見込入力)
// SSoT for UI/BFF communication

// ============================================
// Re-export common types from budget-entry
// ============================================

import type {
  BffPeriodColumn as BaseBffPeriodColumn,
  BffBudgetCell,
  BffVarianceCell,
  BffAffectedRow,
  BffSubjectSummary,
  BffSubjectListResponse,
  BffDepartmentSummary,
} from "../budget-entry"

export {
  ScenarioType,
  PeriodType,
  PlanVersionStatus,
  SubjectClass,
} from "../budget-entry"

export type { BffBudgetCell, BffVarianceCell, BffAffectedRow, BffSubjectSummary, BffSubjectListResponse, BffDepartmentSummary }

// ============================================
// Forecast Event DTOs (イベント一覧・詳細用)
// ============================================

export interface BffListForecastEventsRequest {
  page?: number
  pageSize?: number
  sortBy?: "eventCode" | "eventName" | "fiscalYear" | "updatedAt"
  sortOrder?: "asc" | "desc"
  fiscalYear?: number
}

export interface BffForecastEventSummary {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  versionCount: number
  latestVersionName: string
  latestVersionStatus: ForecastVersionStatus
  // W/N/B設定
  wnbStartPeriodNo: number | null
  updatedAt: string
}

export interface BffListForecastEventsResponse {
  items: BffForecastEventSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCreateForecastEventRequest {
  eventCode: string
  eventName: string
  fiscalYear: number
  layoutId: string
  notes?: string
  // W/N/B設定
  wnbStartPeriodNo?: number // W/N/B開始月（1-12、null = 使用しない）
}

export interface BffUpdateForecastEventRequest {
  eventName?: string
  notes?: string
  // W/N/B設定
  wnbStartPeriodNo?: number | null // null = W/N/B無効化
}

export interface BffForecastEventResponse {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  layoutId: string
  notes: string | null
  // W/N/B設定
  wnbStartPeriodNo: number | null // W/N/B開始月（1-12、null = 使用しない）
  createdAt: string
  updatedAt: string
}

export interface BffForecastEventDetailResponse extends BffForecastEventResponse {
  layoutName: string
  versions: BffForecastVersionSummary[]
  departments: BffDepartmentSummary[]
}

// ============================================
// Forecast Version DTOs (バージョン管理：月次＋回数)
// ============================================

export const ForecastVersionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  FIXED: "FIXED",
} as const
export type ForecastVersionStatus = (typeof ForecastVersionStatus)[keyof typeof ForecastVersionStatus]

export interface BffForecastVersionSummary {
  id: string
  versionNo: number
  versionCode: string
  versionName: string // e.g., "5月見込第1回"
  forecastMonth: number // 見込作成月 (1-12)
  revisionNo: number // 同月内の回数
  status: ForecastVersionStatus
  fixedAt: string | null
}

export interface BffCreateForecastVersionRequest {
  forecastMonth: number // 見込作成月 (1-12)
  revisionNo?: number // 省略時は自動採番
  copyFromVersionId?: string // 前回見込からコピー
  notes?: string
}

// ============================================
// Month Status (月の状態)
// ============================================

export const MonthStatus = {
  ACTUAL: "ACTUAL", // 実績確定（締め済み）
  CLOSING: "CLOSING", // 仮締め中
  FORECAST: "FORECAST", // 見込入力対象
} as const
export type MonthStatus = (typeof MonthStatus)[keyof typeof MonthStatus]

// ============================================
// Forecast Grid DTOs
// ============================================

export interface BffForecastGridRequest {
  fiscalYear: number
  departmentId: string
  forecastEventId: string
  forecastVersionId: string
  projectId?: string // PJ別モード時
}

export interface BffForecastContext {
  fiscalYear: number
  departmentId: string
  departmentName: string
  forecastEventId: string
  forecastEventName: string
  forecastVersionId: string
  forecastVersionName: string
  forecastVersionStatus: ForecastVersionStatus
  forecastMonth: number
  revisionNo: number
  isEditable: boolean
}

export interface BffForecastPeriodColumn {
  periodId: string
  periodNo: number
  periodLabel: string
  periodType: "MONTH" | "QUARTER" | "HALF" | "ANNUAL"
  monthStatus: MonthStatus // 月の状態
  isOpen: boolean
  isEditable: boolean
  isAggregate: boolean
  actualValue?: string // 実績値（締め済み月のみ）
}

export interface BffForecastRow {
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: "BASE" | "AGGREGATE"
  indentLevel: number
  isExpandable: boolean
  isExpanded: boolean
  isEditable: boolean
  parentRowId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  cells: BffForecastCell[]
  annualTotal: string
}

export interface BffForecastCell {
  periodId: string
  value: string | null
  isEditable: boolean
  isDirty: boolean
  monthStatus: MonthStatus
  actualValue?: string // 実績値（締め済み月のみ）
}

export interface BffForecastSummary {
  ytdActual: string // 年初来実績
  remainingForecast: string // 残期間見込
  fullYearForecast: string // 通期見通し
  fullYearBudget: string // 通期予算
  achievementRate: number // 達成率（%）
  // 月次達成率（オプション）
  monthlyAchievement?: BffMonthlyAchievement[]
}

export interface BffMonthlyAchievement {
  periodId: string
  periodLabel: string
  cumulative: number // 累計達成率（%）
  monthly: number // 単月達成率（%）
}

export interface BffForecastGridResponse {
  context: BffForecastContext
  periods: BffForecastPeriodColumn[]
  rows: BffForecastRow[]
  summary: BffForecastSummary
}

export interface BffForecastContextResponse {
  fiscalYears: { value: number; label: string }[]
  departments: { id: string; code: string; name: string }[]
  forecastEvents: { id: string; code: string; name: string }[]
  forecastVersions: { id: string; code: string; name: string; status: string; forecastMonth: number; revisionNo: number }[]
  budgetVersions: { id: string; code: string; name: string }[] // 予算対比用
}

// ============================================
// Cell Update DTOs
// ============================================

export interface BffUpdateForecastCellRequest {
  subjectId: string
  periodId: string
  dimensionValueId?: string
  value: string | null
}

export interface BffUpdateForecastCellsRequest {
  cells: BffUpdateForecastCellRequest[]
}

export interface BffUpdateForecastCellResponse {
  success: boolean
  updatedCell: BffForecastCell
  affectedRows: BffAffectedRow[]
  updatedSummary: BffForecastSummary
}

export interface BffUpdateForecastCellsResponse {
  success: boolean
  updatedCells: BffForecastCell[]
  affectedRows: BffAffectedRow[]
  updatedSummary: BffForecastSummary
}

// ============================================
// Compare DTOs (比較モード)
// ============================================

// 予算対比
export interface BffForecastBudgetCompareRequest {
  fiscalYear: number
  departmentId: string
  forecastEventId: string
  forecastVersionId: string
  budgetVersionId: string // 比較対象の予算バージョン
  projectId?: string
}

export interface BffForecastBudgetCompareRow {
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: "BASE" | "AGGREGATE"
  indentLevel: number
  isExpandable: boolean
  isExpanded: boolean
  parentRowId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  // 見込データ
  forecastCells: BffForecastCell[]
  forecastAnnualTotal: string
  // 予算データ
  budgetCells: BffBudgetCell[]
  budgetAnnualTotal: string
  // 差異
  varianceCells: BffVarianceCell[]
  varianceAnnualTotal: string
  varianceAnnualIsPositive: boolean
}

export interface BffForecastBudgetCompareResponse {
  context: {
    fiscalYear: number
    departmentId: string
    departmentName: string
    forecastEventId: string
    forecastEventName: string
    forecastVersionId: string
    forecastVersionName: string
    budgetVersionId: string
    budgetVersionName: string
  }
  periods: BffForecastPeriodColumn[]
  rows: BffForecastBudgetCompareRow[]
  summary: BffForecastSummary
}

// 前回見込対比
export interface BffForecastPreviousCompareRequest {
  fiscalYear: number
  departmentId: string
  forecastEventId: string
  currentVersionId: string
  previousVersionId: string // 前回見込バージョン
  projectId?: string
}

export interface BffForecastPreviousCompareRow {
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: "BASE" | "AGGREGATE"
  indentLevel: number
  isExpandable: boolean
  isExpanded: boolean
  parentRowId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  // 今回見込
  currentCells: BffForecastCell[]
  currentAnnualTotal: string
  // 前回見込
  previousCells: BffForecastCell[]
  previousAnnualTotal: string
  // 差異
  varianceCells: BffVarianceCell[]
  varianceAnnualTotal: string
  varianceAnnualIsPositive: boolean
}

export interface BffForecastPreviousCompareResponse {
  context: {
    fiscalYear: number
    departmentId: string
    departmentName: string
    forecastEventId: string
    forecastEventName: string
    currentVersionId: string
    currentVersionName: string
    previousVersionId: string
    previousVersionName: string
  }
  periods: BffForecastPeriodColumn[]
  rows: BffForecastPreviousCompareRow[]
  summary: BffForecastSummary
}

// ============================================
// Error Types
// ============================================

export const ForecastEntryErrorCode = {
  // Event errors
  EVENT_NOT_FOUND: "FORECAST_EVENT_NOT_FOUND",
  EVENT_CODE_DUPLICATE: "FORECAST_EVENT_CODE_DUPLICATE",
  EVENT_HAS_FIXED_VERSION: "FORECAST_EVENT_HAS_FIXED_VERSION",
  // Version errors
  VERSION_IS_FIXED: "FORECAST_VERSION_IS_FIXED",
  VERSION_NOT_FOUND: "FORECAST_VERSION_NOT_FOUND",
  // Grid errors
  PERIOD_IS_CLOSED: "PERIOD_IS_CLOSED",
  ACTUAL_PERIOD_NOT_EDITABLE: "ACTUAL_PERIOD_NOT_EDITABLE",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  NEGATIVE_NOT_ALLOWED: "NEGATIVE_NOT_ALLOWED",
  SUBJECT_NOT_FOUND: "SUBJECT_NOT_FOUND",
  SUBJECT_NOT_EDITABLE: "SUBJECT_NOT_EDITABLE",
  DEPARTMENT_NOT_FOUND: "DEPARTMENT_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const
export type ForecastEntryErrorCode = (typeof ForecastEntryErrorCode)[keyof typeof ForecastEntryErrorCode]

export interface ForecastEntryError {
  code: ForecastEntryErrorCode
  message: string
  details?: Record<string, unknown>
}

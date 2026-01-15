// BFF Contracts for Actual Entry (実績入力)
// SSoT for UI/BFF communication

import type {
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
// Month Status (月の状態) - 実績用
// ============================================

export const ActualMonthStatus = {
  HARD_CLOSED: "HARD_CLOSED", // 確定（締め済み、編集不可）
  SOFT_CLOSED: "SOFT_CLOSED", // 仮締め（権限者のみ編集可）
  OPEN: "OPEN", // 入力中（当月、編集可能）
  FUTURE: "FUTURE", // 未経過（データなし）
} as const
export type ActualMonthStatus = (typeof ActualMonthStatus)[keyof typeof ActualMonthStatus]

// ============================================
// Source Type (データの出所)
// ============================================

export const SourceType = {
  INPUT: "INPUT", // ERP取込値 / 手入力値
  ADJUST: "ADJUST", // 調整入力
  TOTAL: "TOTAL", // 合計（表示用）
} as const
export type SourceType = (typeof SourceType)[keyof typeof SourceType]

// ============================================
// Actual Grid DTOs
// ============================================

export interface BffActualGridRequest {
  fiscalYear: number
  departmentId: string
  projectId?: string // PJ別モード時
}

export interface BffActualContext {
  fiscalYear: number
  departmentId: string
  departmentName: string
  isEditable: boolean
  currentMonth: number // 現在の月（入力中月）
}

export interface BffActualPeriodColumn {
  periodId: string
  periodNo: number
  periodLabel: string
  periodType: "MONTH" | "QUARTER" | "HALF" | "ANNUAL"
  monthStatus: ActualMonthStatus
  isOpen: boolean
  isEditable: boolean
  isAggregate: boolean
}

export interface BffActualRow {
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
  // 調整行対応
  sourceType: SourceType
  // 調整行表示時の内訳
  inputRow?: BffActualValueRow // INPUT行（ERP取込値）
  adjustRow?: BffActualValueRow // ADJUST行（調整値）
  cells: BffActualCell[]
  annualTotal: string
}

export interface BffActualValueRow {
  cells: BffActualCell[]
  annualTotal: string
}

export interface BffActualCell {
  periodId: string
  value: string | null
  isEditable: boolean
  isDirty: boolean
  monthStatus: ActualMonthStatus
}

export interface BffActualGridResponse {
  context: BffActualContext
  periods: BffActualPeriodColumn[]
  rows: BffActualRow[]
}

export interface BffActualContextResponse {
  fiscalYears: { value: number; label: string }[]
  departments: { id: string; code: string; name: string }[]
  // 実績はバージョン管理なし（単一）
  budgetVersions: { id: string; code: string; name: string }[] // 予算対比用
  forecastVersions: { id: string; code: string; name: string }[] // 見込対比用
}

// ============================================
// Cell Update DTOs
// ============================================

export interface BffUpdateActualCellRequest {
  subjectId: string
  periodId: string
  dimensionValueId?: string
  value: string | null
  sourceType: SourceType // INPUT or ADJUST
}

export interface BffUpdateActualCellsRequest {
  cells: BffUpdateActualCellRequest[]
}

export interface BffUpdateActualCellResponse {
  success: boolean
  updatedCell: BffActualCell
  affectedRows: BffAffectedRow[]
}

export interface BffUpdateActualCellsResponse {
  success: boolean
  updatedCells: BffActualCell[]
  affectedRows: BffAffectedRow[]
}

// ============================================
// Compare DTOs (比較モード)
// ============================================

// 予算対比
export interface BffActualBudgetCompareRequest {
  fiscalYear: number
  departmentId: string
  budgetVersionId: string
  projectId?: string
}

export interface BffActualBudgetCompareRow {
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
  // 実績データ
  actualCells: BffActualCell[]
  actualAnnualTotal: string
  // 予算データ
  budgetCells: BffBudgetCell[]
  budgetAnnualTotal: string
  // 差異
  varianceCells: BffVarianceCell[]
  varianceAnnualTotal: string
  varianceAnnualIsPositive: boolean
}

export interface BffActualBudgetCompareResponse {
  context: {
    fiscalYear: number
    departmentId: string
    departmentName: string
    budgetVersionId: string
    budgetVersionName: string
  }
  periods: BffActualPeriodColumn[]
  rows: BffActualBudgetCompareRow[]
}

// 見込対比
export interface BffActualForecastCompareRequest {
  fiscalYear: number
  departmentId: string
  forecastVersionId: string
  projectId?: string
}

export interface BffActualForecastCompareRow {
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
  // 実績データ
  actualCells: BffActualCell[]
  actualAnnualTotal: string
  // 見込データ
  forecastCells: BffBudgetCell[]
  forecastAnnualTotal: string
  // 差異
  varianceCells: BffVarianceCell[]
  varianceAnnualTotal: string
  varianceAnnualIsPositive: boolean
}

export interface BffActualForecastCompareResponse {
  context: {
    fiscalYear: number
    departmentId: string
    departmentName: string
    forecastVersionId: string
    forecastVersionName: string
  }
  periods: BffActualPeriodColumn[]
  rows: BffActualForecastCompareRow[]
}

// ============================================
// Error Types
// ============================================

export const ActualEntryErrorCode = {
  // Grid errors
  PERIOD_IS_CLOSED: "ACTUAL_PERIOD_IS_CLOSED",
  PERIOD_IS_FUTURE: "ACTUAL_PERIOD_IS_FUTURE",
  INVALID_AMOUNT: "ACTUAL_INVALID_AMOUNT",
  NEGATIVE_NOT_ALLOWED: "ACTUAL_NEGATIVE_NOT_ALLOWED",
  SUBJECT_NOT_FOUND: "ACTUAL_SUBJECT_NOT_FOUND",
  SUBJECT_NOT_EDITABLE: "ACTUAL_SUBJECT_NOT_EDITABLE",
  DEPARTMENT_NOT_FOUND: "ACTUAL_DEPARTMENT_NOT_FOUND",
  VALIDATION_ERROR: "ACTUAL_VALIDATION_ERROR",
  INPUT_NOT_EDITABLE: "ACTUAL_INPUT_NOT_EDITABLE", // ERP取込値は編集不可
} as const
export type ActualEntryErrorCode = (typeof ActualEntryErrorCode)[keyof typeof ActualEntryErrorCode]

export interface ActualEntryError {
  code: ActualEntryErrorCode
  message: string
  details?: Record<string, unknown>
}

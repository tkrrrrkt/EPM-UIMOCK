// BFF Contracts for Budget Entry
// SSoT for UI/BFF communication

// ============================================
// Enums (Event Level)
// ============================================

export const ScenarioType = {
  BUDGET: "BUDGET",
  FORECAST: "FORECAST",
  ACTUAL: "ACTUAL",
} as const
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType]

// ============================================
// Plan Event DTOs (イベント一覧・詳細用)
// ============================================

export interface BffListPlanEventsRequest {
  page?: number
  pageSize?: number
  sortBy?: "eventCode" | "eventName" | "fiscalYear" | "scenarioType" | "updatedAt"
  sortOrder?: "asc" | "desc"
  scenarioType?: ScenarioType
  fiscalYear?: number
}

export interface BffPlanEventSummary {
  id: string
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  fiscalYear: number
  versionCount: number
  latestVersionName: string
  latestVersionStatus: PlanVersionStatus
  updatedAt: string
}

export interface BffListPlanEventsResponse {
  items: BffPlanEventSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCreatePlanEventRequest {
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  fiscalYear: number
  layoutId: string
  notes?: string
}

export interface BffUpdatePlanEventRequest {
  eventName?: string
  notes?: string
}

export interface BffPlanEventResponse {
  id: string
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  fiscalYear: number
  layoutId: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BffPlanEventDetailResponse extends BffPlanEventResponse {
  layoutName: string
  versions: BffPlanVersionSummary[]
  departments: BffDepartmentSummary[]
}

export interface BffPlanVersionSummary {
  id: string
  versionNo: number
  versionCode: string
  versionName: string
  status: PlanVersionStatus
  fixedAt: string | null
}

export interface BffDepartmentSummary {
  id: string
  departmentCode: string
  departmentName: string
}

export interface BffDuplicatePlanEventRequest {
  newEventCode: string
  newEventName: string
}

// ============================================
// Request DTOs (Grid Level)
// ============================================

export interface BffBudgetGridRequest {
  fiscalYear: number
  departmentId: string
  planEventId: string
  planVersionId: string
}

export interface BffUpdateCellRequest {
  subjectId: string
  periodId: string
  dimensionValueId?: string
  value: string | null
}

export interface BffUpdateCellsRequest {
  cells: BffUpdateCellRequest[]
}

export interface BffBudgetCompareRequest {
  fiscalYear: number
  departmentId: string
  planEventId: string
  baseVersionId: string
  currentVersionId: string
}

// ============================================
// Response DTOs
// ============================================

export interface BffBudgetContext {
  fiscalYear: number
  departmentId: string
  departmentName: string
  planEventId: string
  planEventName: string
  planVersionId: string
  planVersionName: string
  planVersionStatus: PlanVersionStatus
  isEditable: boolean
}

export const PeriodType = {
  MONTH: "MONTH",
  QUARTER: "QUARTER",
  HALF: "HALF",
  ANNUAL: "ANNUAL",
} as const
export type PeriodType = (typeof PeriodType)[keyof typeof PeriodType]

export interface BffPeriodColumn {
  periodId: string
  periodNo: number
  periodLabel: string
  periodType: PeriodType
  isOpen: boolean
  isEditable: boolean
  isAggregate: boolean // 集計列かどうか（Q, 上期, 下期, 通期）
}

export interface BffBudgetCell {
  periodId: string
  value: string | null
  isEditable: boolean
  isDirty: boolean
}

export interface BffBudgetRow {
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: SubjectClass
  indentLevel: number
  isExpandable: boolean
  isExpanded: boolean
  isEditable: boolean
  parentRowId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  cells: BffBudgetCell[]
  annualTotal: string
}

export interface BffBudgetGridResponse {
  context: BffBudgetContext
  periods: BffPeriodColumn[]
  rows: BffBudgetRow[]
}

export interface BffBudgetContextResponse {
  fiscalYears: { value: number; label: string }[]
  departments: { id: string; code: string; name: string }[]
  planEvents: { id: string; code: string; name: string; scenarioType: string }[]
  planVersions: { id: string; code: string; name: string; status: string }[]
}

export interface BffAffectedRow {
  rowId: string
  cells: BffBudgetCell[]
  annualTotal: string
}

export interface BffUpdateCellResponse {
  success: boolean
  updatedCell: BffBudgetCell
  affectedRows: BffAffectedRow[]
}

export interface BffUpdateCellsResponse {
  success: boolean
  updatedCells: BffBudgetCell[]
  affectedRows: BffAffectedRow[]
}

export interface BffVarianceCell {
  periodId: string
  value: string | null
  isPositive: boolean
}

export interface BffBudgetCompareRow extends BffBudgetRow {
  baseCells: BffBudgetCell[]
  currentCells: BffBudgetCell[]
  varianceCells: BffVarianceCell[]
}

export interface BffBudgetCompareResponse {
  context: BffBudgetContext
  periods: BffPeriodColumn[]
  rows: BffBudgetCompareRow[]
}

// ============================================
// Historical Actual Data DTOs (過去実績用)
// ============================================

export interface BffHistoricalActualRequest {
  departmentId: string
  fiscalYears: number[] // 取得したい過去年度のリスト
  subjectIds?: string[] // 特定科目のみ取得する場合
}

export interface BffHistoricalActualRow {
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: SubjectClass
  indentLevel: number
  fiscalYearAmounts: BffFiscalYearAmount[]
}

export interface BffFiscalYearAmount {
  fiscalYear: number
  periodAmounts: BffPeriodAmount[]
  annualTotal: string
}

export interface BffPeriodAmount {
  periodId: string
  periodNo: number
  periodLabel: string
  value: string | null
}

export interface BffHistoricalActualResponse {
  departmentId: string
  departmentName: string
  fiscalYears: number[]
  periods: BffPeriodColumn[]
  rows: BffHistoricalActualRow[]
}

// ============================================
// Subject Filter DTOs (科目フィルター用)
// ============================================

export interface BffSubjectSummary {
  id: string
  code: string
  name: string
  class: SubjectClass
  hasChildren: boolean
}

export interface BffSubjectListResponse {
  subjects: BffSubjectSummary[]
}

// ============================================
// Historical Compare DTOs (過去実績との比較用)
// ============================================

export interface BffHistoricalCompareRequest {
  fiscalYear: number
  departmentId: string
  planEventId: string
  planVersionId: string
  compareFiscalYear: number // 比較対象の過去年度
}

export interface BffHistoricalCompareRow {
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: SubjectClass
  indentLevel: number
  isExpandable: boolean
  isExpanded: boolean
  parentRowId: string | null
  dimensionValueId: string | null
  dimensionValueName: string | null
  // 現在の予算データ
  currentCells: BffBudgetCell[]
  currentAnnualTotal: string
  // 過去実績データ
  historicalCells: BffBudgetCell[]
  historicalAnnualTotal: string
  // 差異
  varianceCells: BffVarianceCell[]
  varianceAnnualTotal: string
  varianceAnnualIsPositive: boolean
}

export interface BffHistoricalCompareResponse {
  context: {
    fiscalYear: number
    departmentId: string
    departmentName: string
    planEventId: string
    planEventName: string
    planVersionId: string
    planVersionName: string
    compareFiscalYear: number
  }
  periods: BffPeriodColumn[]
  rows: BffHistoricalCompareRow[]
}

// ============================================
// Enums
// ============================================

export const PlanVersionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  FIXED: "FIXED",
} as const
export type PlanVersionStatus = (typeof PlanVersionStatus)[keyof typeof PlanVersionStatus]

export const SubjectClass = {
  BASE: "BASE",
  AGGREGATE: "AGGREGATE",
} as const
export type SubjectClass = (typeof SubjectClass)[keyof typeof SubjectClass]

// ============================================
// Error Types
// ============================================

export const BudgetEntryErrorCode = {
  // Event errors
  EVENT_NOT_FOUND: "BUDGET_EVENT_NOT_FOUND",
  EVENT_CODE_DUPLICATE: "BUDGET_EVENT_CODE_DUPLICATE",
  EVENT_HAS_FIXED_VERSION: "BUDGET_EVENT_HAS_FIXED_VERSION",
  // Version errors
  VERSION_IS_FIXED: "VERSION_IS_FIXED",
  PLAN_VERSION_NOT_FOUND: "PLAN_VERSION_NOT_FOUND",
  // Grid errors
  PERIOD_IS_CLOSED: "PERIOD_IS_CLOSED",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  NEGATIVE_NOT_ALLOWED: "NEGATIVE_NOT_ALLOWED",
  SUBJECT_NOT_FOUND: "SUBJECT_NOT_FOUND",
  SUBJECT_NOT_EDITABLE: "SUBJECT_NOT_EDITABLE",
  DEPARTMENT_NOT_FOUND: "DEPARTMENT_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const
export type BudgetEntryErrorCode = (typeof BudgetEntryErrorCode)[keyof typeof BudgetEntryErrorCode]

export interface BudgetEntryError {
  code: BudgetEntryErrorCode
  message: string
  details?: Record<string, unknown>
}

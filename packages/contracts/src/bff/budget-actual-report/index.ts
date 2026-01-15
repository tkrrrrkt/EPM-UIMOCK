// BFF Contracts for Budget Actual Report (予算実績照会)
// SSoT for UI/BFF communication
// Reference: .kiro/specs/kpi/budget-actual-report/design.md

// ============================================================
// Common Types
// ============================================================

/** 共通ヘッダーパラメータ */
export interface BffReportHeaderParams {
  companyId?: string
  planEventId: string
  fiscalYear: number
}

/** 予算イベント種別 */
export const PlanEventType = {
  BUDGET: "BUDGET",
  REVISED_BUDGET: "REVISED_BUDGET",
  FORECAST: "FORECAST",
} as const
export type PlanEventType = (typeof PlanEventType)[keyof typeof PlanEventType]

// ============================================================
// Plan Event (予算イベント)
// ============================================================

export interface BffPlanEvent {
  id: string
  eventCode: string
  eventName: string
  eventType: PlanEventType
}

export interface BffPlanEventListResponse {
  items: BffPlanEvent[]
}

// ============================================================
// Summary Tab (サマリータブ)
// ============================================================

export interface BffSummaryRequest extends BffReportHeaderParams {}

export interface BffKpiCard {
  subjectId: string
  subjectName: string
  budget: number
  outlook: number
  achievementRate: number
  yearOverYearRate: number | null
  isAchievementAlert: boolean
  isYearOverYearAlert: boolean
  isBudgetOverrunAlert: boolean
}

export const AlertSeverity = {
  WARNING: "warning",
  CRITICAL: "critical",
} as const
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity]

export interface BffAlertItem {
  organizationName: string
  subjectName: string
  message: string
  severity: AlertSeverity
}

export interface BffPeriodInfo {
  fiscalYear: number
  currentMonth: number
  closedMonths: number[]
}

export interface BffSummaryResponse {
  kpiCards: BffKpiCard[]
  alerts: BffAlertItem[]
  periodInfo: BffPeriodInfo
}

// ============================================================
// Detail Tab (詳細テーブルタブ)
// ============================================================

export const DisplayMode = {
  OUTLOOK: "outlook",
  BUDGET_OUTLOOK: "budgetOutlook",
  ACHIEVEMENT_RATE: "achievementRate",
  VARIANCE: "variance",
} as const
export type DisplayMode = (typeof DisplayMode)[keyof typeof DisplayMode]

export interface BffDetailRequest extends BffReportHeaderParams {
  layoutId?: string
  organizationId?: string
  displayMode: DisplayMode
  page?: number
  pageSize?: number
}

export const LineType = {
  HEADER: "header",
  ACCOUNT: "account",
  NOTE: "note",
  BLANK: "blank",
} as const
export type LineType = (typeof LineType)[keyof typeof LineType]

export interface BffMatrixCell {
  organizationId: string
  primaryValue: number | null
  secondaryValue: number | null
  displayText: string
  isPositive: boolean
  isNegative: boolean
}

export interface BffMatrixRow {
  lineId: string
  lineNo: number
  lineType: LineType
  displayName: string
  indentLevel: number
  isBold: boolean
  isExpandable: boolean
  isExpanded: boolean
  cells: BffMatrixCell[]
}

export interface BffMatrixColumn {
  organizationId: string
  organizationName: string
  isTotal: boolean
  isClickable: boolean
}

export interface BffBreadcrumb {
  organizationId: string
  organizationName: string
}

export interface BffDetailResponse {
  columns: BffMatrixColumn[]
  rows: BffMatrixRow[]
  breadcrumbs: BffBreadcrumb[]
  displayMode: DisplayMode
  page: number
  pageSize: number
  totalRows: number
}

// ============================================================
// Trend Tab (推移分析タブ)
// ============================================================

export const ComparisonMode = {
  MONTH_OVER_MONTH: "monthOverMonth",
  YTD: "ytd",
  FULL_YEAR: "fullYear",
} as const
export type ComparisonMode = (typeof ComparisonMode)[keyof typeof ComparisonMode]

export interface BffTrendRequest extends BffReportHeaderParams {
  subjectId: string
  organizationId: string
  comparisonMode: ComparisonMode
}

export interface BffMonthlyData {
  month: number
  currentYearActual: number | null
  currentYearForecast: number | null
  priorYearActual: number | null
  variance: number | null
  varianceRate: number | null
}

export interface BffTrendResponse {
  subjectName: string
  organizationName: string
  comparisonMode: ComparisonMode
  monthlyData: BffMonthlyData[]
  ytdCurrent: number
  ytdPriorYear: number
  ytdVariance: number
  ytdVarianceRate: number
}

// ============================================================
// Variance Tab (差異分析タブ)
// ============================================================

export const VarianceComparisonMode = {
  BUDGET_VS_OUTLOOK: "budgetVsOutlook",
  BUDGET_VS_ACTUAL: "budgetVsActual",
  YEAR_OVER_YEAR: "yearOverYear",
} as const
export type VarianceComparisonMode = (typeof VarianceComparisonMode)[keyof typeof VarianceComparisonMode]

export interface BffVarianceRequest extends BffReportHeaderParams {
  targetSubjectId: string
  organizationId: string
  comparisonMode: VarianceComparisonMode
  drilldownSubjectId?: string
}

export interface BffWaterfallItem {
  subjectId: string
  subjectName: string
  variance: number
  profitImpact: number
  isPositive: boolean
  hasChildren: boolean
  sortOrder: number
}

export interface BffVarianceBreadcrumb {
  subjectId: string
  subjectName: string
}

export interface BffVarianceResponse {
  targetSubjectName: string
  comparisonMode: VarianceComparisonMode
  startValue: number
  endValue: number
  items: BffWaterfallItem[]
  totalVariance: number
  breadcrumbs: BffVarianceBreadcrumb[]
}

// ============================================================
// Export (エクスポート)
// ============================================================

export const ExportTab = {
  SUMMARY: "summary",
  DETAIL: "detail",
  TREND: "trend",
  VARIANCE: "variance",
} as const
export type ExportTab = (typeof ExportTab)[keyof typeof ExportTab]

export interface BffExportRequest extends BffReportHeaderParams {
  tab: ExportTab
  layoutId?: string
  organizationId?: string
}

// ============================================================
// Organization (組織)
// ============================================================

export interface BffOrganizationRequest {
  companyId?: string
  parentOrgId?: string
}

export interface BffOrganization {
  id: string
  organizationCode: string
  organizationName: string
  level: number
  hasChildren: boolean
}

export interface BffOrganizationListResponse {
  items: BffOrganization[]
  parentOrganization: BffOrganization | null
}

// ============================================================
// Subject (科目) - for Trend/Variance selection
// ============================================================

export interface BffSubjectOption {
  id: string
  subjectCode: string
  subjectName: string
  subjectType: string
}

export interface BffSubjectListResponse {
  items: BffSubjectOption[]
}

// ============================================================
// Error Contracts
// ============================================================

export const BudgetActualReportErrorCode = {
  PLAN_EVENT_NOT_FOUND: "PLAN_EVENT_NOT_FOUND",
  ORGANIZATION_NOT_FOUND: "ORGANIZATION_NOT_FOUND",
  LAYOUT_NOT_FOUND: "LAYOUT_NOT_FOUND",
  SUBJECT_NOT_FOUND: "SUBJECT_NOT_FOUND",
  NO_DATA_FOUND: "NO_DATA_FOUND",
  INVALID_FISCAL_YEAR: "INVALID_FISCAL_YEAR",
  INVALID_COMPARISON_MODE: "INVALID_COMPARISON_MODE",
  EXPORT_FAILED: "EXPORT_FAILED",
  EXPORT_ROW_LIMIT_EXCEEDED: "EXPORT_ROW_LIMIT_EXCEEDED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const

export type BudgetActualReportErrorCode =
  (typeof BudgetActualReportErrorCode)[keyof typeof BudgetActualReportErrorCode]

export interface BudgetActualReportError {
  code: BudgetActualReportErrorCode
  message: string
  details?: Record<string, unknown>
}

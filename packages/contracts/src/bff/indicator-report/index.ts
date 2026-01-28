// BFF Contracts for Indicator Report (財務指標分析レポート)
// SSoT for UI/BFF communication
// Reference: .kiro/specs/reporting/indicator-report/design.md

// ============================================================
// Enums
// ============================================================

/** シナリオ種別 */
export const ScenarioType = {
  BUDGET: "BUDGET",
  FORECAST: "FORECAST",
  ACTUAL: "ACTUAL",
} as const
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType]

/** 表示粒度 */
export const DisplayGranularity = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
} as const
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity]

/** レイアウト行種別 */
export const LayoutLineType = {
  HEADER: "header",
  ITEM: "item",
  DIVIDER: "divider",
  NOTE: "note",
  BLANK: "blank",
} as const
export type LayoutLineType = (typeof LayoutLineType)[keyof typeof LayoutLineType]

/** 項目参照種別 */
export const ItemRefType = {
  FINANCIAL: "FINANCIAL",
  NON_FINANCIAL: "NON_FINANCIAL",
  METRIC: "METRIC",
} as const
export type ItemRefType = (typeof ItemRefType)[keyof typeof ItemRefType]

// ============================================================
// Request DTOs
// ============================================================

/** 選択肢取得リクエスト */
export interface BffSelectorOptionsRequest {
  fiscalYear?: number
  scenarioType?: ScenarioType
  planEventId?: string
}

/** レポートデータ取得リクエスト */
export interface BffIndicatorReportDataRequest {
  fiscalYear: number
  primaryScenarioType: ScenarioType
  primaryPlanEventId?: string
  primaryPlanVersionId?: string
  compareScenarioType?: ScenarioType
  comparePlanEventId?: string
  comparePlanVersionId?: string
  startPeriodCode: string
  endPeriodCode: string
  displayGranularity: DisplayGranularity
  departmentStableId: string
  includeChildren: boolean
}

// ============================================================
// Response DTOs
// ============================================================

/** レイアウト情報レスポンス */
export interface BffIndicatorReportLayoutResponse {
  layoutId: string
  layoutCode: string
  layoutName: string
  headerText: string | null
  lines: BffLayoutLine[]
}

/** レイアウト行 */
export interface BffLayoutLine {
  lineId: string
  lineNo: number
  lineType: LayoutLineType
  displayName: string | null
  itemRefType: ItemRefType | null
  indentLevel: number
  isBold: boolean
}

/** 選択肢レスポンス */
export interface BffSelectorOptionsResponse {
  fiscalYears: number[]
  planEvents: BffPlanEventOption[]
  planVersions: BffPlanVersionOption[]
  departments: BffDepartmentNode[]
}

/** 計画イベント選択肢 */
export interface BffPlanEventOption {
  id: string
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  fiscalYear: number
}

/** 計画バージョン選択肢 */
export interface BffPlanVersionOption {
  id: string
  versionCode: string
  versionName: string
  status: string
}

/** 部門ノード */
export interface BffDepartmentNode {
  stableId: string
  departmentCode: string
  departmentName: string
  level: number
  hasChildren: boolean
  children?: BffDepartmentNode[]
}

/** レポートデータレスポンス */
export interface BffIndicatorReportDataResponse {
  fiscalYear: number
  periodRange: {
    start: string
    end: string
    granularity: DisplayGranularity
  }
  departmentName: string
  includeChildren: boolean
  rows: BffReportRow[]
}

/** レポート行 */
export interface BffReportRow {
  lineId: string
  lineNo: number
  lineType: LayoutLineType
  displayName: string | null
  indentLevel: number
  isBold: boolean
  itemRefType: ItemRefType | null
  primaryValue: number | null
  compareValue: number | null
  differenceValue: number | null
  differenceRate: number | null
  unit: string | null
}

// ============================================================
// Error Contracts
// ============================================================

/** エラーコード */
export const IndicatorReportErrorCode = {
  LAYOUT_NOT_CONFIGURED: "INDICATOR_REPORT_LAYOUT_NOT_CONFIGURED",
  LAYOUT_NOT_FOUND: "INDICATOR_REPORT_LAYOUT_NOT_FOUND",
  PLAN_EVENT_NOT_FOUND: "INDICATOR_REPORT_PLAN_EVENT_NOT_FOUND",
  PLAN_VERSION_NOT_FOUND: "INDICATOR_REPORT_PLAN_VERSION_NOT_FOUND",
  DEPARTMENT_NOT_FOUND: "INDICATOR_REPORT_DEPARTMENT_NOT_FOUND",
  INVALID_PERIOD_RANGE: "INDICATOR_REPORT_INVALID_PERIOD_RANGE",
  NO_KPI_EVENT_FOUND: "INDICATOR_REPORT_NO_KPI_EVENT_FOUND",
  METRIC_EVALUATION_ERROR: "INDICATOR_REPORT_METRIC_EVALUATION_ERROR",
  VALIDATION_ERROR: "INDICATOR_REPORT_VALIDATION_ERROR",
} as const
export type IndicatorReportErrorCode =
  (typeof IndicatorReportErrorCode)[keyof typeof IndicatorReportErrorCode]

/** エラーレスポンス */
export interface IndicatorReportError {
  code: IndicatorReportErrorCode
  message: string
  details?: Record<string, unknown>
}

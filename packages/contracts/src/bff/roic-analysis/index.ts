// BFF Contracts for ROIC Analysis (ROIC分析)
// SSoT for UI/BFF communication
// Reference: .kiro/specs/reports/roic-analysis/design.md

// ============================================================
// Enums
// ============================================================

/** Primary/Compareのデータソース種別 */
export const RoicPrimaryType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const
export type RoicPrimaryType = (typeof RoicPrimaryType)[keyof typeof RoicPrimaryType]

/** 表示粒度 */
export const RoicGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
} as const
export type RoicGranularity = (typeof RoicGranularity)[keyof typeof RoicGranularity]

/** 動作モード（標準/簡易） */
export const RoicMode = {
  STANDARD: 'STANDARD',
  SIMPLIFIED: 'SIMPLIFIED',
} as const
export type RoicMode = (typeof RoicMode)[keyof typeof RoicMode]

/** ROICツリーの行種別 */
export const RoicLineType = {
  HEADER: 'header',
  ACCOUNT: 'account',
  NOTE: 'note',
  BLANK: 'blank',
  ADJUSTMENT: 'adjustment',
} as const
export type RoicLineType = (typeof RoicLineType)[keyof typeof RoicLineType]

/** ROICツリーのセクション */
export const RoicTreeSection = {
  ROIC: 'roic',
  NOPAT: 'nopat',
  INVESTED_CAPITAL: 'invested_capital',
  DECOMPOSITION: 'decomposition',
} as const
export type RoicTreeSection = (typeof RoicTreeSection)[keyof typeof RoicTreeSection]

/** KPIの表示フォーマット */
export const RoicKpiFormat = {
  CURRENCY: 'currency',
  PERCENT: 'percent',
  RATE: 'rate',
} as const
export type RoicKpiFormat = (typeof RoicKpiFormat)[keyof typeof RoicKpiFormat]

// ============================================================
// Options Request/Response
// ============================================================

export interface BffRoicOptionsRequest {
  companyId: string
}

export interface BffRoicFiscalYearOption {
  fiscalYear: number
  label: string
}

export interface BffRoicEventOption {
  id: string
  eventCode: string
  eventName: string
  scenarioType: RoicPrimaryType
  fiscalYear: number
  hasFixedVersion: boolean
}

export interface BffRoicVersionOption {
  id: string
  versionCode: string
  versionName: string
  versionNo: number
  status: 'DRAFT' | 'FIXED'
}

export interface BffRoicDepartmentNode {
  id: string
  stableId: string
  name: string
  code: string
  level: number
  hasChildren: boolean
  children?: BffRoicDepartmentNode[]
}

export interface BffRoicOptionsResponse {
  /** 動作モード（標準/簡易） */
  mode: RoicMode
  /** 選択可能年度 */
  fiscalYears: BffRoicFiscalYearOption[]
  /** 予算イベント一覧 */
  budgetEvents: BffRoicEventOption[]
  /** 見込イベント一覧 */
  forecastEvents: BffRoicEventOption[]
  /** イベントID -> バージョン一覧 */
  versions: Record<string, BffRoicVersionOption[]>
  /** 部門ツリー */
  departments: BffRoicDepartmentNode[]
  /** ROIC用PLレイアウトID */
  roicPlLayoutId: string | null
  /** ROIC用PLレイアウト名 */
  roicPlLayoutName: string | null
  /** ROIC用BSレイアウトID */
  roicBsLayoutId: string | null
  /** ROIC用BSレイアウト名 */
  roicBsLayoutName: string | null
  /** WACC（%表示用、0.08 = 8%） */
  waccRate: number | null
  /** 実効税率（%表示用、0.30 = 30%） */
  effectiveTaxRate: number | null
  /** ROIC設定完了フラグ */
  isConfigComplete: boolean
  /** 不足設定項目 */
  missingConfigItems: string[]
}

// ============================================================
// Data Request/Response
// ============================================================

export interface BffRoicDataRequest {
  companyId: string
  fiscalYear: number
  primaryType: RoicPrimaryType
  primaryEventId?: string
  primaryVersionId?: string
  compareEnabled: boolean
  compareFiscalYear?: number
  compareType?: RoicPrimaryType
  compareEventId?: string
  compareVersionId?: string
  /** 期間開始（1-12） */
  periodFrom: number
  /** 期間終了（1-12） */
  periodTo: number
  granularity: RoicGranularity
  departmentStableId: string
  /** 配下集約フラグ */
  includeSubDepartments: boolean
}

// ============================================================
// KPI Items (11 indicators)
// ============================================================

export interface BffRoicKpiItem {
  /** KPI識別子 */
  id: string
  /** 表示名 */
  name: string
  /** 元値 */
  originalValue: number | null
  /** シミュレーション後の値（UIで管理） */
  simulatedValue: number | null
  /** 比較値 */
  compareValue: number | null
  /** 単位表示 */
  unit: string
  /** 計算可能フラグ（分母0などで計算不可の場合false） */
  isCalculable: boolean
  /** 表示フォーマット */
  format: RoicKpiFormat
  /** 表示優先順（1=Top tier, 2=Middle, 3=Bottom） */
  displayPriority: number
}

// ============================================================
// ROIC Tree
// ============================================================

export interface BffRoicTreeLine {
  /** 行ID */
  lineId: string
  /** 行番号 */
  lineNo: number
  /** 行種別 */
  lineType: RoicLineType
  /** 表示名 */
  displayName: string
  /** 科目ID（account行の場合） */
  subjectId: string | null
  /** インデントレベル */
  indentLevel: number
  /** 編集可能フラグ */
  isEditable: boolean
  /** 調整差分行フラグ */
  isAdjustment: boolean
  /** 元値 */
  originalValue: number | null
  /** 比較値 */
  compareValue: number | null
  /** 親行ID */
  parentLineId: string | null
  /** 子行ID配列 */
  childLineIds: string[]
  /** 集計係数（+1/-1） */
  rollupCoefficient: number
  /** ツリーセクション */
  section: RoicTreeSection
}

// ============================================================
// Charts
// ============================================================

export interface BffRoicChartPoint {
  /** 期間識別子 */
  period: string
  /** 期間ラベル */
  label: string
  /** ROIC元値 */
  roicOriginal: number | null
  /** ROICシミュレーション後 */
  roicSimulated: number | null
  /** ROIC比較値 */
  roicCompare: number | null
  /** WACC */
  wacc: number | null
}

export interface BffRoicVsWaccChartData {
  /** チャートポイント */
  points: BffRoicChartPoint[]
  /** 単一点フラグ（バレットチャート表示用） */
  isSinglePoint: boolean
  /** WACC値 */
  waccRate: number | null
}

export interface BffRoicDecompositionBar {
  /** NOPAT率 */
  nopatRate: number | null
  /** 資本回転率 */
  capitalTurnover: number | null
  /** ROIC */
  roic: number | null
}

export interface BffRoicDecompositionChartData {
  /** 元値 */
  original: BffRoicDecompositionBar
  /** シミュレーション後 */
  simulated: BffRoicDecompositionBar
  /** 比較値 */
  compare: BffRoicDecompositionBar | null
}

// ============================================================
// Warnings
// ============================================================

export interface BffRoicWarning {
  /** 警告コード */
  code: string
  /** 警告メッセージ */
  message: string
}

// ============================================================
// Main Data Response
// ============================================================

export interface BffRoicDataResponse {
  /** 動作モード */
  mode: RoicMode
  /** KPI一覧（11指標） */
  kpis: BffRoicKpiItem[]
  /** ROICツリー */
  tree: BffRoicTreeLine[]
  /** ROIC vs WACCチャートデータ */
  roicVsWaccChart: BffRoicVsWaccChartData
  /** ROIC分解チャートデータ */
  decompositionChart: BffRoicDecompositionChartData
  /** 警告一覧 */
  warnings: BffRoicWarning[]
  /** BS実績代替フラグ */
  bsSubstitutedWithActual: boolean
}

// ============================================================
// Simple Input Request/Response (簡易モード用)
// ============================================================

export interface BffRoicSimpleInputRequest {
  companyId: string
  fiscalYear: number
  departmentStableId: string
}

export interface BffRoicSimpleInputLine {
  /** 科目ID */
  subjectId: string
  /** 科目コード */
  subjectCode: string
  /** 科目名 */
  subjectName: string
  /** インデントレベル */
  indentLevel: number
  /** 編集可能フラグ（BASE + posting_allowed のみ true） */
  isEditable: boolean
  /** 集計科目フラグ */
  isAggregate: boolean
  /** 親科目ID */
  parentSubjectId: string | null
  /** 上期値（period_no=6） */
  h1Value: number | null
  /** 下期値（period_no=12） */
  h2Value: number | null
  /** 通期値（上期・下期の平均、読取専用） */
  annualValue: number | null
}

export interface BffRoicSimpleInputResponse {
  /** 営業資産科目ツリー */
  operatingAssets: BffRoicSimpleInputLine[]
  /** 営業負債科目ツリー */
  operatingLiabilities: BffRoicSimpleInputLine[]
  /** 既存イベントID（未作成の場合null） */
  eventId: string | null
  /** 既存バージョンID（未作成の場合null） */
  versionId: string | null
}

export interface BffRoicSimpleInputSaveItem {
  subjectId: string
  h1Value: number | null
  h2Value: number | null
}

export interface BffRoicSimpleInputSaveRequest {
  companyId: string
  fiscalYear: number
  departmentStableId: string
  operatingAssets: BffRoicSimpleInputSaveItem[]
  operatingLiabilities: BffRoicSimpleInputSaveItem[]
}

export interface BffRoicSimpleInputSaveResponse {
  success: boolean
  /** 作成/更新されたイベントID */
  eventId: string
  /** 作成/更新されたバージョンID */
  versionId: string
}

// ============================================================
// Error Codes
// ============================================================

export const RoicAnalysisErrorCode = {
  /** ROIC設定未完了 */
  ROIC_CONFIG_NOT_SET: 'ROIC_CONFIG_NOT_SET',
  /** Primary未選択 */
  PRIMARY_NOT_SELECTED: 'PRIMARY_NOT_SELECTED',
  /** データなし */
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  /** BSデータなし */
  NO_BS_DATA: 'NO_BS_DATA',
  /** 部門が見つからない */
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  /** 期間が不正 */
  PERIOD_INVALID: 'PERIOD_INVALID',
  /** イベントが見つからない */
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  /** バージョンが見つからない */
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  /** バリデーションエラー */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 簡易入力不可（配下集約ON時など） */
  SIMPLE_INPUT_NOT_ALLOWED: 'SIMPLE_INPUT_NOT_ALLOWED',
  /** 簡易入力対象科目なし */
  NO_SIMPLE_INPUT_SUBJECTS: 'NO_SIMPLE_INPUT_SUBJECTS',
} as const

export type RoicAnalysisErrorCode =
  (typeof RoicAnalysisErrorCode)[keyof typeof RoicAnalysisErrorCode]

export interface BffRoicAnalysisError {
  code: RoicAnalysisErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================================
// Warning Codes (for BffRoicWarning.code)
// ============================================================

export const RoicWarningCode = {
  /** BSが実績で代替された */
  BS_SUBSTITUTED_WITH_ACTUAL: 'BS_SUBSTITUTED_WITH_ACTUAL',
  /** WACCが未設定 */
  WACC_NOT_SET: 'WACC_NOT_SET',
  /** 一部期間のデータが欠損 */
  PARTIAL_DATA_MISSING: 'PARTIAL_DATA_MISSING',
} as const

export type RoicWarningCode =
  (typeof RoicWarningCode)[keyof typeof RoicWarningCode]

// ============================================================
// KPI IDs (for BffRoicKpiItem.id)
// ============================================================

export const RoicKpiId = {
  ROIC: 'roic',
  NOPAT: 'nopat',
  EBIT: 'ebit',
  EFFECTIVE_TAX_RATE: 'effectiveTaxRate',
  INVESTED_CAPITAL: 'investedCapital',
  OPERATING_ASSETS: 'operatingAssets',
  OPERATING_LIABILITIES: 'operatingLiabilities',
  NOPAT_RATE: 'nopatRate',
  CAPITAL_TURNOVER: 'capitalTurnover',
  WACC: 'wacc',
  ROIC_SPREAD: 'roicSpread',
} as const

export type RoicKpiId = (typeof RoicKpiId)[keyof typeof RoicKpiId]

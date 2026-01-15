/**
 * BFF Contracts: forecast-wnb (見込シナリオ W/N/B)
 *
 * SSoT: .kiro/specs/仕様概要/見込シナリオ機能.md
 *
 * W/N/B は科目の「合計」に対して入力する
 * - ワースト: 悲観シナリオ
 * - ノーマル: 通常見込（グリッドの値と連動）
 * - ベスト: 楽観シナリオ
 */

// ============================================
// Enums
// ============================================

export const ScenarioCase = {
  WORST: "WORST",
  NORMAL: "NORMAL", // グリッドの通常値と同期
  BEST: "BEST",
} as const
export type ScenarioCase = (typeof ScenarioCase)[keyof typeof ScenarioCase]

// ============================================
// W/N/B Dialog DTOs
// ============================================

/**
 * W/N/B入力ダイアログ用データ取得リクエスト
 */
export interface BffWnbDialogRequest {
  forecastEventId: string
  forecastVersionId: string
  departmentId: string
  subjectId: string
  projectId?: string // PJ別モード時
}

/**
 * W/N/B入力ダイアログ用データ取得レスポンス
 */
export interface BffWnbDialogResponse {
  subjectId: string
  subjectCode: string
  subjectName: string
  wnbStartPeriodNo: number // W/N/B開始月（1-12）
  periods: BffWnbPeriod[]
  annualSummary: BffWnbAnnualSummary
}

/**
 * W/N/B期間別データ
 */
export interface BffWnbPeriod {
  periodId: string
  periodNo: number
  periodLabel: string // "4月", "5月", ...
  isWnbEnabled: boolean // W/N/B入力可能か（開始月以降）
  isEditable: boolean // 編集可能か（締め状態考慮）
  worst: string | null // ワースト値（null=未入力）
  normal: string // ノーマル値（グリッドの値）
  best: string | null // ベスト値（null=未入力）
  budget: string // 予算値（参考表示）
}

/**
 * W/N/B通期サマリー
 */
export interface BffWnbAnnualSummary {
  worst: string // ワースト通期計
  normal: string // ノーマル通期計
  best: string // ベスト通期計
  budget: string // 予算通期計
}

// ============================================
// W/N/B Save DTOs
// ============================================

/**
 * W/N/B保存リクエスト
 */
export interface BffWnbSaveRequest {
  forecastEventId: string
  forecastVersionId: string
  departmentId: string
  subjectId: string
  projectId?: string
  values: BffWnbValue[]
}

/**
 * W/N/B期間別入力値
 */
export interface BffWnbValue {
  periodNo: number
  worst: string | null // null = 未入力（ノーマル値を使用）
  normal: string // ノーマル値（グリッドにも反映）
  best: string | null // null = 未入力（ノーマル値を使用）
}

/**
 * W/N/B保存レスポンス
 */
export interface BffWnbSaveResponse {
  success: boolean
  updatedPeriods: BffWnbPeriod[]
  updatedAnnualSummary: BffWnbAnnualSummary
  // グリッド連動: ノーマル値の変更があった場合
  gridUpdates?: BffWnbGridUpdate[]
}

/**
 * グリッド更新情報（ノーマル値変更時）
 */
export interface BffWnbGridUpdate {
  periodId: string
  periodNo: number
  value: string
}

// ============================================
// Forecast Event Extension (W/N/B設定)
// ============================================

/**
 * 見込イベント作成リクエスト（W/N/B設定追加）
 */
export interface BffCreateForecastEventWithWnbRequest {
  eventCode: string
  eventName: string
  fiscalYear: number
  layoutId: string
  notes?: string
  // W/N/B設定
  wnbStartPeriodNo?: number // W/N/B開始月（null = 使用しない）
}

/**
 * 見込イベント更新リクエスト（W/N/B設定追加）
 */
export interface BffUpdateForecastEventWnbRequest {
  wnbStartPeriodNo?: number | null // null = W/N/B無効化
}

// ============================================
// Grid Extension (W/N/Bアイコン表示用)
// ============================================

/**
 * W/N/B対応のグリッド行（拡張）
 */
export interface BffForecastRowWithWnb {
  // 基本情報（既存のBffForecastRowと同じ）
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
  annualTotal: string

  // W/N/B拡張
  isWnbEnabled: boolean // この科目がW/N/B対象か
  wnbCells: BffWnbCellInfo[] // 各セルのW/N/B情報
}

/**
 * セル単位のW/N/B情報
 */
export interface BffWnbCellInfo {
  periodId: string
  periodNo: number
  hasWnbData: boolean // W/N/Bデータが存在するか
  isWnbPeriod: boolean // W/N/B入力可能期間か
  worst: string | null
  normal: string
  best: string | null
}

// ============================================
// Error Types
// ============================================

export const WnbErrorCode = {
  SUBJECT_NOT_WNB_ENABLED: "SUBJECT_NOT_WNB_ENABLED",
  PERIOD_BEFORE_WNB_START: "PERIOD_BEFORE_WNB_START",
  PERIOD_IS_CLOSED: "PERIOD_IS_CLOSED",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  VERSION_IS_FIXED: "VERSION_IS_FIXED",
  NOT_FOUND: "WNB_NOT_FOUND",
  VALIDATION_ERROR: "WNB_VALIDATION_ERROR",
} as const
export type WnbErrorCode = (typeof WnbErrorCode)[keyof typeof WnbErrorCode]

export interface WnbError {
  code: WnbErrorCode
  message: string
  details?: Record<string, unknown>
}

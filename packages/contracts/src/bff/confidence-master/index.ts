/**
 * BFF Contracts: confidence-master (確度マスタ・確度管理)
 *
 * SSoT: .kiro/specs/仕様概要/確度管理機能.md
 *
 * 確度ランク（S/A/B/C/D/Z等）別に金額を入力・管理
 * 期待値 = Σ(確度×金額) を自動計算
 */

// ============================================
// Confidence Level Master DTOs
// ============================================

/**
 * 確度マスタ取得リクエスト
 */
export interface BffConfidenceLevelListRequest {
  companyId: string
  includeInactive?: boolean // 無効な確度も含めるか
}

/**
 * 確度マスタ取得レスポンス
 */
export interface BffConfidenceLevelListResponse {
  companyId: string
  companyName: string
  levels: BffConfidenceLevel[]
}

/**
 * 確度マスタ
 */
export interface BffConfidenceLevel {
  id: string
  levelCode: string // 'S', 'A', 'B', 'C', 'D', 'Z'
  levelName: string // '受注', '80%受注', ...
  levelNameShort: string // 'S', 'A', ...
  probabilityRate: number // 0.0 - 1.0 (100% = 1.0)
  colorCode: string // '#22C55E', '#84CC16', ...
  sortOrder: number
  isActive: boolean
}

/**
 * 確度マスタ保存リクエスト
 */
export interface BffConfidenceLevelSaveRequest {
  companyId: string
  levels: BffConfidenceLevelInput[]
}

/**
 * 確度マスタ入力
 */
export interface BffConfidenceLevelInput {
  id?: string // 新規はundefined
  levelCode: string
  levelName: string
  levelNameShort: string
  probabilityRate: number // 0-100 (UI表示用、保存時に0-1に変換)
  colorCode: string
  sortOrder: number
  isActive: boolean
}

/**
 * 確度マスタ保存レスポンス
 */
export interface BffConfidenceLevelSaveResponse {
  success: boolean
  levels: BffConfidenceLevel[]
}

/**
 * 確度マスタ削除リクエスト
 */
export interface BffConfidenceLevelDeleteRequest {
  companyId: string
  levelId: string
}

// ============================================
// Confidence Grid DTOs (確度展開入力)
// ============================================

/**
 * 確度展開行
 * 確度管理対象科目の場合、科目行の下に確度別行が展開される
 */
export interface BffConfidenceExpandedRow {
  // 親科目情報
  subjectId: string
  subjectCode: string
  subjectName: string
  isConfidenceEnabled: boolean // 確度管理対象か

  // 確度別行（展開時のみ）
  confidenceRows: BffConfidenceLevelRow[]

  // サマリー行
  summaryRow: BffConfidenceSummaryRow
}

/**
 * 確度別入力行
 */
export interface BffConfidenceLevelRow {
  confidenceLevelId: string
  levelCode: string
  levelName: string
  levelNameShort: string
  probabilityRate: number // 0.0 - 1.0
  colorCode: string
  sortOrder: number
  cells: BffConfidenceCell[] // 期間別金額
  annualTotal: string // 年間合計
}

/**
 * 確度別セル
 */
export interface BffConfidenceCell {
  periodId: string
  periodNo: number
  value: string | null // 金額（null = 未入力）
  isEditable: boolean
}

/**
 * 確度サマリー行（合計・期待値・予算）
 */
export interface BffConfidenceSummaryRow {
  // 合計行: 確度別金額の単純合計
  totalCells: BffConfidenceSummaryCell[]
  totalAnnual: string

  // 期待値行: Σ(確度×金額)
  expectedCells: BffConfidenceSummaryCell[]
  expectedAnnual: string

  // 予算行（参考表示）
  budgetCells: BffConfidenceSummaryCell[]
  budgetAnnual: string
}

/**
 * サマリーセル
 */
export interface BffConfidenceSummaryCell {
  periodId: string
  periodNo: number
  value: string
}

// ============================================
// Confidence Value Update DTOs
// ============================================

/**
 * 確度別金額更新リクエスト
 */
export interface BffConfidenceValueUpdateRequest {
  eventId: string
  versionId: string
  departmentId: string
  subjectId: string
  periodId: string
  confidenceLevelId: string
  amount: string | null // null = クリア
  projectId?: string
}

/**
 * 確度別金額更新レスポンス
 */
export interface BffConfidenceValueUpdateResponse {
  success: boolean
  // 更新されたセル
  updatedCell: BffConfidenceCell
  // 影響を受けたサマリー
  updatedSummary: BffConfidenceSummaryRow
  // 親科目の合計更新
  subjectTotal: string
}

/**
 * 確度別金額一括更新リクエスト
 */
export interface BffConfidenceValueBulkUpdateRequest {
  eventId: string
  versionId: string
  departmentId: string
  subjectId: string
  projectId?: string
  values: BffConfidenceValueInput[]
}

/**
 * 確度別金額入力
 */
export interface BffConfidenceValueInput {
  periodId: string
  confidenceLevelId: string
  amount: string | null
}

// ============================================
// Report Layout Extension (確度管理対象設定)
// ============================================

/**
 * レイアウト項目（確度管理設定追加）
 */
export interface BffReportLayoutItemWithConfidence {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  sortOrder: number
  // ディメンション設定
  hasDimension: boolean
  dimensionId: string | null
  dimensionName: string | null
  // 確度管理設定
  confidenceEnabled: boolean // 確度管理対象か
  // W/N/B設定
  wnbEnabled: boolean // W/N/B対象か
}

/**
 * レイアウト項目更新（確度・W/N/B設定）
 */
export interface BffUpdateLayoutItemFlagsRequest {
  layoutId: string
  itemId: string
  confidenceEnabled?: boolean
  wnbEnabled?: boolean
}

// ============================================
// Grid Integration (グリッドへの確度展開統合)
// ============================================

/**
 * 確度対応のグリッド行
 */
export interface BffGridRowWithConfidence {
  // 基本情報
  rowId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: "BASE" | "AGGREGATE"
  indentLevel: number
  parentRowId: string | null

  // 展開制御
  isExpandable: boolean // 確度展開可能か
  isExpanded: boolean // 現在展開中か
  expandType: "DIMENSION" | "CONFIDENCE" | "NONE" // 展開種別

  // 確度管理
  isConfidenceEnabled: boolean
  confidenceData?: BffConfidenceExpandedRow // 展開時のデータ

  // W/N/B（合計に対して）
  isWnbEnabled: boolean

  // セルデータ
  cells: BffGridCellWithConfidence[]
  annualTotal: string
}

/**
 * 確度対応のセル
 */
export interface BffGridCellWithConfidence {
  periodId: string
  periodNo: number
  value: string | null
  isEditable: boolean
  // 確度管理対象の場合、これは確度合計値
  isConfidenceTotal: boolean
  // W/N/B対象の場合
  hasWnbData: boolean
  isWnbPeriod: boolean
}

// ============================================
// Error Types
// ============================================

export const ConfidenceErrorCode = {
  // Master errors
  LEVEL_CODE_DUPLICATE: "CONFIDENCE_LEVEL_CODE_DUPLICATE",
  LEVEL_NOT_FOUND: "CONFIDENCE_LEVEL_NOT_FOUND",
  LEVEL_IN_USE: "CONFIDENCE_LEVEL_IN_USE", // 削除不可
  // Value errors
  SUBJECT_NOT_CONFIDENCE_ENABLED: "SUBJECT_NOT_CONFIDENCE_ENABLED",
  INVALID_AMOUNT: "CONFIDENCE_INVALID_AMOUNT",
  VERSION_IS_FIXED: "CONFIDENCE_VERSION_IS_FIXED",
  PERIOD_IS_CLOSED: "CONFIDENCE_PERIOD_IS_CLOSED",
  // Validation
  VALIDATION_ERROR: "CONFIDENCE_VALIDATION_ERROR",
} as const
export type ConfidenceErrorCode = (typeof ConfidenceErrorCode)[keyof typeof ConfidenceErrorCode]

export interface ConfidenceError {
  code: ConfidenceErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================
// Default Confidence Levels (初期データ)
// ============================================

/**
 * 確度マスタの初期データ
 * 会社作成時にこのデータをコピーして初期設定する
 */
export const DEFAULT_CONFIDENCE_LEVELS: Omit<BffConfidenceLevel, "id">[] = [
  {
    levelCode: "S",
    levelName: "受注",
    levelNameShort: "S",
    probabilityRate: 1.0,
    colorCode: "#22C55E", // green-500
    sortOrder: 1,
    isActive: true,
  },
  {
    levelCode: "A",
    levelName: "80%受注",
    levelNameShort: "A",
    probabilityRate: 0.8,
    colorCode: "#84CC16", // lime-500
    sortOrder: 2,
    isActive: true,
  },
  {
    levelCode: "B",
    levelName: "50%受注",
    levelNameShort: "B",
    probabilityRate: 0.5,
    colorCode: "#EAB308", // yellow-500
    sortOrder: 3,
    isActive: true,
  },
  {
    levelCode: "C",
    levelName: "20%受注",
    levelNameShort: "C",
    probabilityRate: 0.2,
    colorCode: "#F97316", // orange-500
    sortOrder: 4,
    isActive: true,
  },
  {
    levelCode: "D",
    levelName: "0%（案件化）",
    levelNameShort: "D",
    probabilityRate: 0.0,
    colorCode: "#EF4444", // red-500
    sortOrder: 5,
    isActive: true,
  },
  {
    levelCode: "Z",
    levelName: "目安なし",
    levelNameShort: "Z",
    probabilityRate: 0.0,
    colorCode: "#6B7280", // gray-500
    sortOrder: 6,
    isActive: true,
  },
]

// BFF Contracts for Data Import
// SSoT for UI/BFF communication
// Based on: .kiro/specs/仕様検討/20260116_データ取込機能.md

// ============================================
// Enums
// ============================================

export const ImportType = {
  BUDGET: "BUDGET",
  FORECAST: "FORECAST",
  ACTUAL: "ACTUAL",
} as const
export type ImportType = (typeof ImportType)[keyof typeof ImportType]

export const ImportSourceType = {
  PASTE: "PASTE",
  EXCEL: "EXCEL",
  CSV: "CSV",
  API: "API",
} as const
export type ImportSourceType = (typeof ImportSourceType)[keyof typeof ImportSourceType]

export const ImportBatchStatus = {
  PENDING: "PENDING",
  ANALYZING: "ANALYZING",
  MAPPING_REQUIRED: "MAPPING_REQUIRED",
  AGGREGATING: "AGGREGATING",
  STAGING: "STAGING",
  VALIDATING: "VALIDATING",
  VALIDATED: "VALIDATED",
  IMPORTING: "IMPORTING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const
export type ImportBatchStatus = (typeof ImportBatchStatus)[keyof typeof ImportBatchStatus]

export const MappingType = {
  SUBJECT: "SUBJECT",
  DEPARTMENT: "DEPARTMENT",
  COLUMN: "COLUMN",
} as const
export type MappingType = (typeof MappingType)[keyof typeof MappingType]

export const MappingStatus = {
  MAPPED: "MAPPED",
  UNMAPPED: "UNMAPPED",
} as const
export type MappingStatus = (typeof MappingStatus)[keyof typeof MappingStatus]

export const ValidationSeverity = {
  ERROR: "ERROR",
  WARNING: "WARNING",
} as const
export type ValidationSeverity = (typeof ValidationSeverity)[keyof typeof ValidationSeverity]

export const ValidationErrorType = {
  REQUIRED: "REQUIRED",
  FORMAT: "FORMAT",
  MAPPING: "MAPPING",
  RANGE: "RANGE",
} as const
export type ValidationErrorType = (typeof ValidationErrorType)[keyof typeof ValidationErrorType]

export const ColumnMappingTarget = {
  SUBJECT_CODE: "SUBJECT_CODE",
  DEPARTMENT_CODE: "DEPARTMENT_CODE",
  PROJECT_CODE: "PROJECT_CODE",
  PERIOD: "PERIOD",
  AMOUNT: "AMOUNT",
  IGNORE: "IGNORE",
} as const
export type ColumnMappingTarget = (typeof ColumnMappingTarget)[keyof typeof ColumnMappingTarget]

export const FormatType = {
  HORIZONTAL: "HORIZONTAL", // 横持ち（月が列）
  VERTICAL: "VERTICAL", // 縦持ち（月が行）
} as const
export type FormatType = (typeof FormatType)[keyof typeof FormatType]

// ============================================
// Import Start DTOs (取込開始)
// ============================================

/** ファイルアップロード用：取込開始リクエスト */
export interface BffImportStartRequest {
  importType: ImportType
  eventId?: string
  versionId?: string
  templateCode?: string
}

/** ファイルアップロード用：取込開始レスポンス */
export interface BffImportStartResponse {
  batchId: string
  uploadUrl: string
}

/** コピペ用：取込開始リクエスト */
export interface BffImportPasteRequest {
  importType: ImportType
  eventId?: string
  versionId?: string
  templateCode?: string
  data: string[][] // 2次元配列（SpreadJSから）
}

/** コピペ用：取込開始レスポンス */
export interface BffImportPasteResponse {
  batchId: string
  rowCount: number
  needsAggregation: boolean // 5000行超の場合true
}

// ============================================
// Pre-Mapping DTOs (大量データの事前マッピング)
// ============================================

export interface BffImportPreMappingRequest {
  batchId: string
}

export interface BffColumnMapping {
  columnIndex: number
  headerName: string
  mappingTarget: ColumnMappingTarget | null
  isLearned: boolean
}

export interface BffCodeMapping {
  sourceValue: string
  targetId: string | null
  targetCode: string | null
  targetName: string | null
  status: MappingStatus
  isLearned: boolean
  rowCount: number // この外部コードが出現する行数
}

export interface BffImportPreMappingResponse {
  batchId: string
  rowCount: number
  columnMappings: BffColumnMapping[]
  subjectCodes: BffCodeMapping[]
  departmentCodes: BffCodeMapping[]
  unmappedSubjectCount: number
  unmappedDepartmentCount: number
}

// ============================================
// Mapping Update DTOs (マッピング適用)
// ============================================

export interface BffMappingUpdate {
  mappingType: MappingType
  sourceValue: string
  targetId: string
  remember: boolean // このマッピングを記憶するか
}

export interface BffColumnMappingUpdate {
  columnIndex: number
  mappingTarget: ColumnMappingTarget
}

export interface BffApplyMappingRequest {
  batchId: string
  codeMappings: BffMappingUpdate[]
  columnMappings: BffColumnMappingUpdate[]
  rememberAll: boolean // すべてのマッピングを記憶するか
}

export interface BffApplyMappingResponse {
  batchId: string
  success: boolean
}

// ============================================
// Aggregation DTOs (大量データ集計)
// ============================================

export interface BffImportAggregateRequest {
  batchId: string
}

export interface BffImportAggregateResponse {
  batchId: string
  originalRows: number
  aggregatedRows: number
  aggregationAxes: string[] // 例: ["年月", "部門", "科目"]
}

// ============================================
// Staging DTOs (ステージングデータ)
// ============================================

export interface BffImportStagingRequest {
  batchId: string
}

export interface BffStagingColumn {
  key: string
  label: string
  columnType: ColumnMappingTarget
  width: number
}

export interface BffStagingRow {
  rowIndex: number
  excluded: boolean // 除外フラグ
  cells: Record<string, string | null>
  validationStatus: "OK" | "ERROR" | "WARNING"
}

export interface BffImportStagingResponse {
  batchId: string
  columns: BffStagingColumn[]
  rows: BffStagingRow[]
  summary: {
    totalRows: number
    includedRows: number
    excludedRows: number
  }
}

/** ステージングデータ更新リクエスト（行の除外/編集） */
export interface BffUpdateStagingRequest {
  batchId: string
  updates: BffStagingRowUpdate[]
}

export interface BffStagingRowUpdate {
  rowIndex: number
  excluded?: boolean // 除外フラグの変更
  cells?: Record<string, string | null> // セル値の変更
}

export interface BffUpdateStagingResponse {
  batchId: string
  success: boolean
  updatedRows: number
}

// ============================================
// Validation DTOs (検証)
// ============================================

export interface BffImportValidateRequest {
  batchId: string
}

export interface BffValidationError {
  rowIndex: number
  columnKey: string
  errorType: ValidationErrorType
  severity: ValidationSeverity
  message: string
  currentValue: string | null
  suggestion: string | null // 自動修正提案
}

export interface BffImportValidateResponse {
  batchId: string
  status: "VALID" | "HAS_ERRORS" | "HAS_WARNINGS"
  summary: {
    totalRows: number
    validRows: number
    errorRows: number
    warningRows: number
    excludedRows: number
  }
  errors: BffValidationError[]
}

// ============================================
// Auto-Fix DTOs (自動修正提案)
// ============================================

export interface BffAutoFixSuggestion {
  rowIndex: number
  columnKey: string
  currentValue: string
  suggestedValue: string
  reason: string
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface BffGetAutoFixSuggestionsRequest {
  batchId: string
}

export interface BffGetAutoFixSuggestionsResponse {
  batchId: string
  suggestions: BffAutoFixSuggestion[]
}

export interface BffApplyAutoFixRequest {
  batchId: string
  fixes: Array<{
    rowIndex: number
    columnKey: string
    newValue: string
  }>
}

export interface BffApplyAutoFixResponse {
  batchId: string
  appliedCount: number
  success: boolean
}

// ============================================
// Execute DTOs (取込実行)
// ============================================

export interface BffImportExecuteRequest {
  batchId: string
  overwrite: boolean // 同一キーのデータを上書きするか
}

export interface BffImportExecuteResponse {
  batchId: string
  status: "COMPLETED" | "FAILED"
  importedRows: number
  excludedRows: number
  message: string | null
  targetEventName: string | null
  targetVersionName: string | null
}

// ============================================
// History DTOs (取込履歴)
// ============================================

export interface BffImportHistoryRequest {
  importType?: ImportType
  fromDate?: string // ISO date string
  toDate?: string // ISO date string
  page?: number
  pageSize?: number
}

export interface BffImportHistoryItem {
  id: string
  batchId: string
  importType: ImportType
  eventId: string | null
  eventName: string | null
  versionId: string | null
  versionName: string | null
  totalRows: number
  sourceType: ImportSourceType
  sourceFilename: string | null
  result: "SUCCESS" | "FAILED"
  createdByName: string
  createdAt: string // ISO datetime string
}

export interface BffImportHistoryResponse {
  items: BffImportHistoryItem[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// ============================================
// Mapping Rule Management DTOs (マッピングルール管理)
// ============================================

export interface BffMappingRuleListRequest {
  mappingType?: MappingType
  sourceSystem?: string
  page?: number
  pageSize?: number
}

export interface BffMappingRule {
  id: string
  mappingType: MappingType
  sourceSystem: string | null
  sourceValue: string
  targetId: string
  targetCode: string
  targetName: string
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export interface BffMappingRuleListResponse {
  rules: BffMappingRule[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface BffCreateMappingRuleRequest {
  mappingType: MappingType
  sourceSystem?: string
  sourceValue: string
  targetId: string
}

export interface BffCreateMappingRuleResponse {
  rule: BffMappingRule
}

export interface BffDeleteMappingRuleRequest {
  ruleId: string
}

export interface BffDeleteMappingRuleResponse {
  success: boolean
}

// ============================================
// Template DTOs (テンプレート管理)
// ============================================

export interface BffTemplateListRequest {
  includeSystem?: boolean
}

export interface BffTemplate {
  id: string
  templateCode: string
  templateName: string
  description: string | null
  formatType: FormatType
  isSystem: boolean
  createdByName: string | null
  lastUsedAt: string | null
}

export interface BffTemplateListResponse {
  templates: BffTemplate[]
}

export interface BffTemplateDetailResponse extends BffTemplate {
  columnMappings: BffColumnMapping[]
}

// ============================================
// Context DTOs (コンテキスト情報)
// ============================================

export interface BffImportContextRequest {
  importType: ImportType
}

export interface BffImportContextResponse {
  importType: ImportType
  events: Array<{
    id: string
    code: string
    name: string
    fiscalYear: number
  }>
  versions: Array<{
    id: string
    eventId: string
    code: string
    name: string
    status: string
  }>
  templates: Array<{
    code: string
    name: string
    isSystem: boolean
  }>
}

// ============================================
// Master Data for Mapping (マッピング用マスタ)
// ============================================

export interface BffSubjectForMapping {
  id: string
  code: string
  name: string
  parentId: string | null
  hierarchyPath: string // "売上 > 売上高" のような表示用パス
}

export interface BffDepartmentForMapping {
  id: string
  code: string
  name: string
  parentId: string | null
  hierarchyPath: string
}

export interface BffMappingMasterResponse {
  subjects: BffSubjectForMapping[]
  departments: BffDepartmentForMapping[]
}

// ============================================
// Batch Status DTOs (バッチ状態確認)
// ============================================

export interface BffBatchStatusRequest {
  batchId: string
}

export interface BffBatchStatusResponse {
  batchId: string
  status: ImportBatchStatus
  progress: number | null // 0-100 for progress display
  message: string | null
  createdAt: string
  updatedAt: string
}

// ============================================
// Error Types
// ============================================

export const DataImportErrorCode = {
  // Batch errors
  BATCH_NOT_FOUND: "IMPORT_BATCH_NOT_FOUND",
  BATCH_EXPIRED: "IMPORT_BATCH_EXPIRED",
  BATCH_INVALID_STATE: "IMPORT_BATCH_INVALID_STATE",

  // File errors
  FILE_TOO_LARGE: "IMPORT_FILE_TOO_LARGE",
  FILE_FORMAT_INVALID: "IMPORT_FILE_FORMAT_INVALID",
  FILE_EMPTY: "IMPORT_FILE_EMPTY",
  FILE_UPLOAD_FAILED: "IMPORT_FILE_UPLOAD_FAILED",

  // Mapping errors
  MAPPING_INCOMPLETE: "IMPORT_MAPPING_INCOMPLETE",
  MAPPING_RULE_NOT_FOUND: "IMPORT_MAPPING_RULE_NOT_FOUND",
  MAPPING_RULE_DUPLICATE: "IMPORT_MAPPING_RULE_DUPLICATE",

  // Validation errors
  VALIDATION_FAILED: "IMPORT_VALIDATION_FAILED",
  HAS_UNRESOLVED_ERRORS: "IMPORT_HAS_UNRESOLVED_ERRORS",

  // Target errors
  EVENT_NOT_FOUND: "IMPORT_EVENT_NOT_FOUND",
  VERSION_NOT_FOUND: "IMPORT_VERSION_NOT_FOUND",
  VERSION_NOT_EDITABLE: "IMPORT_VERSION_NOT_EDITABLE",
  PERIOD_CLOSED: "IMPORT_PERIOD_CLOSED",

  // Execution errors
  IMPORT_FAILED: "IMPORT_EXECUTION_FAILED",
  CONCURRENT_IMPORT: "IMPORT_CONCURRENT_IMPORT",

  // Template errors
  TEMPLATE_NOT_FOUND: "IMPORT_TEMPLATE_NOT_FOUND",

  // General errors
  UNKNOWN_ERROR: "IMPORT_UNKNOWN_ERROR",
} as const
export type DataImportErrorCode = (typeof DataImportErrorCode)[keyof typeof DataImportErrorCode]

export interface DataImportError {
  code: DataImportErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================
// Constants
// ============================================

/** SpreadJS展開の閾値（これを超えると事前集計が必要） */
export const LARGE_DATA_THRESHOLD = 5000

/** 集計軸 */
export const AGGREGATION_AXES = [
  "period", // 年月
  "department", // 部門
  "subject", // 科目
  "project", // プロジェクト（あれば）
  "dimension", // ディメンション（あれば）
] as const

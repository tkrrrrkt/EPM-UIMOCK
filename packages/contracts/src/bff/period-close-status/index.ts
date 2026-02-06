/**
 * BFF Contracts: period-close-status
 *
 * SSoT: .kiro/specs/仕様概要/月次締処理状況管理.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

// 締めステータス: 2段階のみ（仮締め廃止）
export const CloseStatus = {
  OPEN: 'OPEN',
  HARD_CLOSED: 'HARD_CLOSED',
} as const

export type CloseStatus = (typeof CloseStatus)[keyof typeof CloseStatus]

// 締めアクション: 本締めと差し戻しのみ（仮締め廃止）
export const CloseAction = {
  HARD_CLOSE: 'HARD_CLOSE',
  REOPEN: 'REOPEN',
} as const

export type CloseAction = (typeof CloseAction)[keyof typeof CloseAction]

export const CloseCheckType = {
  PREVIOUS_MONTH_CLOSED: 'PREVIOUS_MONTH_CLOSED',
  ACTUAL_IMPORTED: 'ACTUAL_IMPORTED',
} as const

export type CloseCheckType = (typeof CloseCheckType)[keyof typeof CloseCheckType]

// ============================================================================
// Request DTOs
// ============================================================================

export interface BffListPeriodCloseStatusRequest {
  companyId: string
  fiscalYear: number
}

export interface BffHardCloseRequest {
  accountingPeriodId: string
}

export interface BffReopenRequest {
  accountingPeriodId: string
  notes?: string  // 差し戻し理由
}

export interface BffRunAllocationRequest {
  accountingPeriodId: string
  dryRun?: boolean  // ドライラン（プレビュー）モード
}

export interface BffAllocationResultItem {
  allocationRuleId: string
  allocationRuleName: string
  sourceAmount: number      // 配賦元金額
  allocatedAmount: number   // 配賦金額
  targetCount: number       // 配賦先数
}

export interface BffRunAllocationResponse {
  success: boolean
  accountingPeriodId: string
  executedAt: string
  isDryRun: boolean
  results: BffAllocationResultItem[]
  totalSourceAmount: number
  totalAllocatedAmount: number
  errorMessage?: string
}

// ============================================================================
// 配賦イベント関連（Phase 2追加）
// ============================================================================

export interface BffAllocationEvent {
  id: string
  eventCode: string
  eventName: string
  scenarioType: 'ACTUAL' | 'BUDGET' | 'FORECAST'
  executionOrder: number
  stepCount: number
  isActive: boolean
}

export interface BffListAllocationEventsRequest {
  companyId: string
  scenarioType?: 'ACTUAL' | 'BUDGET' | 'FORECAST'
}

export interface BffListAllocationEventsResponse {
  events: BffAllocationEvent[]
}

export interface BffExecuteAllocationRequest {
  companyId: string
  accountingPeriodId: string
  eventIds: string[]  // 実行するイベントID（execution_order順）
}

export interface BffAllocationEventResult {
  eventId: string
  eventName: string
  status: 'SUCCESS' | 'FAILED'
  stepCount: number
  detailCount: number
  totalAllocatedAmount: number
  errorMessage?: string
}

export interface BffExecuteAllocationResponse {
  success: boolean
  executionIds: string[]
  results: BffAllocationEventResult[]
  errorMessage?: string
}

// ============================================================================
// 配賦結果VIEW関連（Phase 2追加）
// ============================================================================

export interface BffGetAllocationResultRequest {
  companyId: string
  accountingPeriodId: string
}

export interface BffAllocationExecution {
  executionId: string
  eventId: string
  eventName: string
  executedAt: string
  executedBy: string
  status: 'SUCCESS' | 'FAILED'
  steps: BffAllocationStepResult[]
}

export interface BffAllocationStepResult {
  stepId: string
  stepNo: number
  stepName: string
  fromSubjectCode: string
  fromSubjectName: string
  fromDepartmentCode: string
  fromDepartmentName: string
  sourceAmount: number
  details: BffAllocationDetail[]
}

export interface BffAllocationDetail {
  detailId: string
  targetType: 'DEPARTMENT' | 'DIMENSION_VALUE'
  targetCode: string
  targetName: string
  toSubjectCode: string
  toSubjectName: string
  driverType: string
  driverValue: number | null
  ratio: number
  allocatedAmount: number
}

export interface BffAllocationResultResponse {
  companyId: string
  accountingPeriodId: string
  periodLabel: string
  executions: BffAllocationExecution[]
}

// AG Grid Tree Data 用のフラット化構造
export interface BffAllocationTreeNode {
  id: string
  orgHierarchy: string[]  // ['イベント名', 'ステップ名', '配賦先']
  nodeType: 'EVENT' | 'STEP' | 'DETAIL'
  eventName?: string
  stepName?: string
  fromSubject?: string
  fromDepartment?: string
  targetName?: string
  toSubject?: string
  driverType?: string
  ratio?: number
  amount?: number
}

// ============================================================================
// 入力ロック解除関連（Phase 2追加）
// ============================================================================

export interface BffUnlockInputRequest {
  accountingPeriodId: string
}

export interface BffUnlockInputResponse {
  success: boolean
  newInputLocked: boolean
  deletedExecutionCount: number
  errorMessage?: string
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface BffCloseCheckResult {
  checkType: CloseCheckType
  passed: boolean
  message: string
}

export interface BffPeriodCloseStatus {
  accountingPeriodId: string
  fiscalYear: number
  periodNo: number           // 1-12
  periodLabel: string        // "4月", "5月"...
  closeStatus: CloseStatus   // OPEN or HARD_CLOSED
  closedAt: string | null    // ISO8601 本締め日時
  operatedBy: string | null  // 本締め操作者名
  canHardClose: boolean      // 本締め可能か（前月本締め済み & 配賦済み）
  canReopen: boolean         // 差し戻し可能か（権限者のみ）
  checkResults: BffCloseCheckResult[]  // チェック結果
  // 入力ロック・配賦処理関連
  inputLocked: boolean       // 入力ロック状態（配賦実行で自動ON）
  inputLockedAt: string | null  // 入力ロック日時
  inputLockedBy: string | null  // 入力ロック操作者名
  canUnlockInput: boolean    // 入力ロック解除可能か（OPEN状態のみ）
  hasAllocationResult: boolean // 配賦結果があるか
  canRunAllocation: boolean  // 配賦実行可能か
}

export interface BffListPeriodCloseStatusResponse {
  companyId: string
  companyName: string
  fiscalYear: number
  periods: BffPeriodCloseStatus[]
}

export interface BffCloseOperationResponse {
  success: boolean
  accountingPeriodId: string
  newStatus: CloseStatus
  operatedAt: string
  errorMessage?: string
}

// 年度選択用
export interface BffFiscalYear {
  fiscalYear: number
  label: string  // "2026年度"
}

export interface BffFiscalYearListResponse {
  fiscalYears: BffFiscalYear[]
  currentFiscalYear: number
}

// ============================================================================
// Error Codes (UI-facing)
// ============================================================================

export const PeriodCloseStatusErrorCode = {
  PERIOD_NOT_FOUND: 'PERIOD_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  PREVIOUS_MONTH_NOT_CLOSED: 'PREVIOUS_MONTH_NOT_CLOSED',
  ALREADY_HARD_CLOSED: 'ALREADY_HARD_CLOSED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type PeriodCloseStatusErrorCode =
  typeof PeriodCloseStatusErrorCode[keyof typeof PeriodCloseStatusErrorCode]

export interface PeriodCloseStatusError {
  code: PeriodCloseStatusErrorCode
  message: string
  details?: Record<string, unknown>
}

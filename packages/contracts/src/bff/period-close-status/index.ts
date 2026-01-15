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

export const CloseStatus = {
  OPEN: 'OPEN',
  SOFT_CLOSED: 'SOFT_CLOSED',
  HARD_CLOSED: 'HARD_CLOSED',
} as const

export type CloseStatus = (typeof CloseStatus)[keyof typeof CloseStatus]

export const CloseAction = {
  SOFT_CLOSE: 'SOFT_CLOSE',
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

export interface BffSoftCloseRequest {
  accountingPeriodId: string
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
  closeStatus: CloseStatus
  closedAt: string | null    // ISO8601
  operatedBy: string | null  // 操作者名
  canSoftClose: boolean      // 仮締め可能か
  canHardClose: boolean      // 本締め可能か
  canReopen: boolean         // 戻し可能か（権限者のみ）
  checkResults: BffCloseCheckResult[]  // チェック結果
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

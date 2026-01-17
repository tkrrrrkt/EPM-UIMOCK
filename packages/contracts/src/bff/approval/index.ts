/**
 * BFF Contracts: approval (承認ワークフロー)
 *
 * SSoT: .kiro/specs/workflow/approval/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'

export type ApprovalAction = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'WITHDRAW' | 'SKIP'

export type ScenarioType = 'BUDGET' | 'FORECAST'

// ============================================================================
// Request DTOs
// ============================================================================

/** 承認待ち一覧取得リクエスト */
export interface BffApprovalListRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'departmentName' | 'submittedAt' | 'eventName'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // 部門名・イベント名部分一致
  scenarioType?: ScenarioType
}

/** 承認アクションリクエスト（submit/approve/reject/withdraw共通） */
export interface BffApprovalActionRequest {
  comment?: string        // 任意コメント
}

// ============================================================================
// Response DTOs
// ============================================================================

/** 承認待ち一覧レスポンス */
export interface BffApprovalListResponse {
  items: BffApprovalSummary[]
  page: number
  pageSize: number
  totalCount: number
}

/** 承認サマリ（一覧用） */
export interface BffApprovalSummary {
  id: string
  departmentStableId: string
  departmentName: string
  planVersionId: string
  planVersionName: string
  eventName: string
  scenarioType: ScenarioType
  currentStep: number
  status: ApprovalStatus
  submittedAt: string | null
  submittedByEmployeeName: string | null
}

/** 承認詳細レスポンス */
export interface BffApprovalDetailResponse {
  id: string
  departmentStableId: string
  departmentName: string
  planVersionId: string
  planVersionName: string
  eventName: string
  scenarioType: ScenarioType
  currentStep: number
  status: ApprovalStatus
  submittedAt: string | null
  submittedByEmployeeId: string | null
  submittedByEmployeeName: string | null
  finalApprovedAt: string | null
  summary: BffBudgetSummary | null
  approvers: BffApproverStep[]
  canApprove: boolean
  canReject: boolean
  canWithdraw: boolean
  isCurrentUserApprover: boolean
  currentUserStep: number | null
}

/** 予算サマリ（売上・原価・営業利益） */
export interface BffBudgetSummary {
  revenue: string         // Decimal as string
  cost: string
  operatingProfit: string
}

/** 承認ステップ情報 */
export interface BffApproverStep {
  step: number
  approverEmployeeId: string | null
  approverEmployeeName: string | null
  deputyEmployeeId: string | null
  deputyEmployeeName: string | null
  isCompleted: boolean
  isCurrent: boolean
  isCurrentUser: boolean
  completedAt: string | null
  completedByEmployeeName: string | null
}

/** 承認待ち件数レスポンス */
export interface BffApprovalCountResponse {
  count: number
}

/** 承認アクションレスポンス */
export interface BffApprovalActionResponse {
  id: string
  status: ApprovalStatus
  currentStep: number
  message: string
}

/** 承認履歴レスポンス */
export interface BffApprovalHistoryResponse {
  items: BffApprovalHistoryItem[]
}

/** 承認履歴アイテム */
export interface BffApprovalHistoryItem {
  id: string
  step: number
  action: ApprovalAction
  actorEmployeeId: string
  actorEmployeeName: string
  actedAt: string
  comment: string | null
}

// ============================================================================
// Error Codes
// ============================================================================

export const ApprovalErrorCode = {
  STATUS_NOT_FOUND: 'STATUS_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  NOT_AUTHORIZED_TO_APPROVE: 'NOT_AUTHORIZED_TO_APPROVE',
  NOT_AUTHORIZED_TO_REJECT: 'NOT_AUTHORIZED_TO_REJECT',
  NOT_AUTHORIZED_TO_WITHDRAW: 'NOT_AUTHORIZED_TO_WITHDRAW',
  NOT_AUTHORIZED_TO_SUBMIT: 'NOT_AUTHORIZED_TO_SUBMIT',
  LOWER_APPROVER_CANNOT_APPROVE_UPPER: 'LOWER_APPROVER_CANNOT_APPROVE_UPPER',
  APPROVAL_NOT_REQUIRED: 'APPROVAL_NOT_REQUIRED',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
} as const

export type ApprovalErrorCode =
  (typeof ApprovalErrorCode)[keyof typeof ApprovalErrorCode]

export interface ApprovalError {
  code: ApprovalErrorCode
  message: string
  details?: Record<string, unknown>
}

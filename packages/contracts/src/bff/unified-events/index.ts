/**
 * BFF Contracts: Unified Events Management
 *
 * 統一イベント管理のBFFコントラクト定義
 * UIは packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export const UnifiedEventType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  MEETING: 'MEETING',
  MTP: 'MTP',
  GUIDELINE: 'GUIDELINE',
} as const
export type UnifiedEventType = (typeof UnifiedEventType)[keyof typeof UnifiedEventType]

export const SubmissionStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  OVERDUE: 'OVERDUE',
} as const
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus]

// ============================================================================
// Request DTOs
// ============================================================================

export interface BffUnifiedEventListRequest {
  page?: number              // default: 1
  pageSize?: number          // default: 20, max: 100
  sortBy?: 'eventName' | 'createdAt' | 'deadline' | 'statusLabel'
  sortOrder?: 'asc' | 'desc'
  keyword?: string           // イベント名部分一致
  eventType?: UnifiedEventType
  fiscalYear?: number
  statusLabel?: string
}

export interface BffSubmissionListRequest {
  status?: SubmissionStatus[]
  departmentIds?: string[]
  includeChildren?: boolean  // 子部門含む
}

export interface BffSendReminderRequest {
  departmentIds: string[]
  message?: string
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface BffUnifiedEvent {
  id: string
  eventType: UnifiedEventType
  eventName: string
  targetPeriod: string
  status: string             // 元ステータス
  statusLabel: string        // 統一表示ラベル
  deadline: string | null    // ISO8601
  createdAt: string
  // 登録状況対象イベントのみ
  progress: {
    total: number
    completed: number
    rate: number             // 0-100
  } | null
  hasSubmissionTracking: boolean  // 登録状況管理対象か
}

export interface BffUnifiedEventListResponse {
  items: BffUnifiedEvent[]
  page: number
  pageSize: number
  totalCount: number
}

export interface BffUnifiedEventDetailResponse {
  id: string
  eventType: UnifiedEventType
  eventName: string
  targetPeriod: string
  periodStart: string | null  // ISO8601
  periodEnd: string | null    // ISO8601
  status: string
  statusLabel: string
  deadline: string | null
  createdAt: string
  createdBy: string | null
  hasSubmissionTracking: boolean
}

export interface BffSubmissionSummary {
  total: number
  notStarted: number
  inProgress: number
  submitted: number
  approved: number
  rejected: number
  overdue: number
  completionRate: number     // 0-100
  daysUntilDeadline: number | null
}

export interface BffDepartmentSubmission {
  departmentId: string
  departmentStableId: string
  departmentName: string
  departmentLevel: number
  parentDepartmentId: string | null
  status: SubmissionStatus
  lastUpdatedAt: string | null
  lastUpdatedBy: string | null
  submittedAt: string | null
  // 承認ワークフロー情報（BUDGET/FORECASTのみ）
  approvalInfo: {
    currentStep: number
    maxSteps: number
    nextApproverName: string | null
  } | null
}

export interface BffSubmissionListResponse {
  eventId: string
  eventType: UnifiedEventType
  eventName: string
  deadline: string | null
  summary: BffSubmissionSummary
  departments: BffDepartmentSubmission[]
}

export interface BffSendReminderResponse {
  success: boolean
  sentCount: number
  message: string
}

// ============================================================================
// Error Codes
// ============================================================================

export const UnifiedEventsErrorCode = {
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  INVALID_EVENT_TYPE: 'INVALID_EVENT_TYPE',
  SUBMISSION_NOT_SUPPORTED: 'SUBMISSION_NOT_SUPPORTED',
  REMINDER_FAILED: 'REMINDER_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const

export type UnifiedEventsErrorCode =
  (typeof UnifiedEventsErrorCode)[keyof typeof UnifiedEventsErrorCode]

export interface UnifiedEventsError {
  code: UnifiedEventsErrorCode
  message: string
  details?: Record<string, unknown>
}

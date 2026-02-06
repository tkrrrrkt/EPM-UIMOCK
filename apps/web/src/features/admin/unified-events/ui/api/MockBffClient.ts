/**
 * MockBffClient for Unified Events
 *
 * Phase 1: UI-MOCK - モックデータで画面を動作させる
 * Phase 2: UI-BFF - HttpBffClient に差し替え
 */

import type {
  UnifiedEventType,
  BffUnifiedEventListRequest,
  BffUnifiedEventListResponse,
  BffUnifiedEvent,
  BffUnifiedEventDetailResponse,
  BffSubmissionListRequest,
  BffSubmissionListResponse,
  BffDepartmentSubmission,
  BffSubmissionSummary,
  BffSendReminderRequest,
  BffSendReminderResponse,
  SubmissionStatus,
} from '@epm/contracts/bff/unified-events'
import type { BffClient } from './BffClient'

// ============================================================================
// Mock Data: Events
// ============================================================================

const mockEvents: BffUnifiedEvent[] = [
  // BUDGET events
  {
    id: 'budget-2026-001',
    eventType: 'BUDGET',
    eventName: '2026年度 年次予算',
    targetPeriod: '2026年4月〜2027年3月',
    status: 'SUBMITTED',
    statusLabel: '受付中',
    deadline: '2026-03-15T23:59:59+09:00',
    createdAt: '2025-12-01T10:00:00+09:00',
    progress: { total: 15, completed: 8, rate: 53 },
    hasSubmissionTracking: true,
  },
  {
    id: 'budget-2025-001',
    eventType: 'BUDGET',
    eventName: '2025年度 年次予算',
    targetPeriod: '2025年4月〜2026年3月',
    status: 'FIXED',
    statusLabel: '確定済',
    deadline: '2025-03-15T23:59:59+09:00',
    createdAt: '2024-12-01T10:00:00+09:00',
    progress: { total: 15, completed: 15, rate: 100 },
    hasSubmissionTracking: true,
  },
  // FORECAST events
  {
    id: 'forecast-2026-q2',
    eventType: 'FORECAST',
    eventName: '2026年度 Q2見込',
    targetPeriod: '2026年7月〜2026年9月',
    status: 'DRAFT',
    statusLabel: '下書き',
    deadline: '2026-06-20T23:59:59+09:00',
    createdAt: '2026-05-15T10:00:00+09:00',
    progress: { total: 15, completed: 0, rate: 0 },
    hasSubmissionTracking: true,
  },
  {
    id: 'forecast-2026-q1',
    eventType: 'FORECAST',
    eventName: '2026年度 Q1見込',
    targetPeriod: '2026年4月〜2026年6月',
    status: 'APPROVED',
    statusLabel: '承認済',
    deadline: '2026-03-20T23:59:59+09:00',
    createdAt: '2026-02-15T10:00:00+09:00',
    progress: { total: 15, completed: 12, rate: 80 },
    hasSubmissionTracking: true,
  },
  // MEETING events
  {
    id: 'meeting-2026-02',
    eventType: 'MEETING',
    eventName: '2026年2月度 経営会議',
    targetPeriod: '2026年2月',
    status: 'COLLECTING',
    statusLabel: '受付中',
    deadline: '2026-02-10T18:00:00+09:00',
    createdAt: '2026-01-25T10:00:00+09:00',
    progress: { total: 10, completed: 6, rate: 60 },
    hasSubmissionTracking: true,
  },
  {
    id: 'meeting-2026-01',
    eventType: 'MEETING',
    eventName: '2026年1月度 経営会議',
    targetPeriod: '2026年1月',
    status: 'HELD',
    statusLabel: '開催済',
    deadline: '2026-01-10T18:00:00+09:00',
    createdAt: '2025-12-25T10:00:00+09:00',
    progress: { total: 10, completed: 10, rate: 100 },
    hasSubmissionTracking: true,
  },
  {
    id: 'meeting-2025-12',
    eventType: 'MEETING',
    eventName: '2025年12月度 経営会議',
    targetPeriod: '2025年12月',
    status: 'CLOSED',
    statusLabel: '完了',
    deadline: '2025-12-10T18:00:00+09:00',
    createdAt: '2025-11-25T10:00:00+09:00',
    progress: { total: 10, completed: 10, rate: 100 },
    hasSubmissionTracking: true,
  },
  // MTP events
  {
    id: 'mtp-2027-2029',
    eventType: 'MTP',
    eventName: '第5次中期経営計画（2027-2029）',
    targetPeriod: '2027年4月〜2030年3月',
    status: 'DRAFT',
    statusLabel: '下書き',
    deadline: null,
    createdAt: '2026-01-10T10:00:00+09:00',
    progress: null,
    hasSubmissionTracking: false,
  },
  {
    id: 'mtp-2024-2026',
    eventType: 'MTP',
    eventName: '第4次中期経営計画（2024-2026）',
    targetPeriod: '2024年4月〜2027年3月',
    status: 'CONFIRMED',
    statusLabel: '確定済',
    deadline: null,
    createdAt: '2023-02-01T10:00:00+09:00',
    progress: null,
    hasSubmissionTracking: false,
  },
  // GUIDELINE events
  {
    id: 'guideline-2027',
    eventType: 'GUIDELINE',
    eventName: '2027年度 予算編成ガイドライン',
    targetPeriod: '2027年度',
    status: 'DRAFT',
    statusLabel: '下書き',
    deadline: null,
    createdAt: '2026-01-20T10:00:00+09:00',
    progress: null,
    hasSubmissionTracking: false,
  },
  {
    id: 'guideline-2026',
    eventType: 'GUIDELINE',
    eventName: '2026年度 予算編成ガイドライン',
    targetPeriod: '2026年度',
    status: 'DISTRIBUTED',
    statusLabel: '配布済',
    deadline: null,
    createdAt: '2025-01-15T10:00:00+09:00',
    progress: null,
    hasSubmissionTracking: false,
  },
  {
    id: 'guideline-2025',
    eventType: 'GUIDELINE',
    eventName: '2025年度 予算編成ガイドライン',
    targetPeriod: '2025年度',
    status: 'CLOSED',
    statusLabel: '完了',
    deadline: null,
    createdAt: '2024-01-15T10:00:00+09:00',
    progress: null,
    hasSubmissionTracking: false,
  },
]

// ============================================================================
// Mock Data: Department Submissions
// ============================================================================

const mockDepartmentSubmissions: Record<string, BffDepartmentSubmission[]> = {
  'budget-2026-001': [
    {
      departmentId: 'dept-001',
      departmentStableId: 'STABLE-001',
      departmentName: '営業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-02-28T15:30:00+09:00',
      lastUpdatedBy: '山田太郎',
      submittedAt: '2026-02-25T10:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-001-1',
      departmentStableId: 'STABLE-001-1',
      departmentName: '営業1課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-001',
      status: 'APPROVED',
      lastUpdatedAt: '2026-02-20T14:00:00+09:00',
      lastUpdatedBy: '鈴木一郎',
      submittedAt: '2026-02-18T09:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-001-2',
      departmentStableId: 'STABLE-001-2',
      departmentName: '営業2課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-001',
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-22T11:00:00+09:00',
      lastUpdatedBy: '田中花子',
      submittedAt: '2026-02-22T11:00:00+09:00',
      approvalInfo: { currentStep: 1, maxSteps: 3, nextApproverName: '佐藤部長' },
    },
    {
      departmentId: 'dept-002',
      departmentStableId: 'STABLE-002',
      departmentName: '製造本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'IN_PROGRESS',
      lastUpdatedAt: '2026-02-15T16:00:00+09:00',
      lastUpdatedBy: '高橋次郎',
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-002-1',
      departmentStableId: 'STABLE-002-1',
      departmentName: '製造1課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-002',
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-18T10:00:00+09:00',
      lastUpdatedBy: '伊藤三郎',
      submittedAt: '2026-02-18T10:00:00+09:00',
      approvalInfo: { currentStep: 2, maxSteps: 3, nextApproverName: '高橋本部長' },
    },
    {
      departmentId: 'dept-002-2',
      departmentStableId: 'STABLE-002-2',
      departmentName: '製造2課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-002',
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-003',
      departmentStableId: 'STABLE-003',
      departmentName: '管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'REJECTED',
      lastUpdatedAt: '2026-02-26T09:00:00+09:00',
      lastUpdatedBy: '渡辺四郎',
      submittedAt: '2026-02-24T15:00:00+09:00',
      approvalInfo: { currentStep: 2, maxSteps: 3, nextApproverName: '経理部長' },
    },
    {
      departmentId: 'dept-003-1',
      departmentStableId: 'STABLE-003-1',
      departmentName: '経理課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-003',
      status: 'APPROVED',
      lastUpdatedAt: '2026-02-20T11:00:00+09:00',
      lastUpdatedBy: '中村五郎',
      submittedAt: '2026-02-19T14:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-003-2',
      departmentStableId: 'STABLE-003-2',
      departmentName: '総務課',
      departmentLevel: 2,
      parentDepartmentId: 'dept-003',
      status: 'OVERDUE',
      lastUpdatedAt: '2026-02-10T09:00:00+09:00',
      lastUpdatedBy: '小林六郎',
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-004',
      departmentStableId: 'STABLE-004',
      departmentName: '研究開発本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-02-27T14:00:00+09:00',
      lastUpdatedBy: '加藤七郎',
      submittedAt: '2026-02-26T10:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-005',
      departmentStableId: 'STABLE-005',
      departmentName: '情報システム本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-02-25T16:00:00+09:00',
      lastUpdatedBy: '松本八郎',
      submittedAt: '2026-02-24T11:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-006',
      departmentStableId: 'STABLE-006',
      departmentName: '人事本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-28T10:00:00+09:00',
      lastUpdatedBy: '井上九郎',
      submittedAt: '2026-02-28T10:00:00+09:00',
      approvalInfo: { currentStep: 1, maxSteps: 3, nextApproverName: '田中本部長' },
    },
    {
      departmentId: 'dept-007',
      departmentStableId: 'STABLE-007',
      departmentName: '海外事業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'IN_PROGRESS',
      lastUpdatedAt: '2026-02-20T09:00:00+09:00',
      lastUpdatedBy: '木村十郎',
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-008',
      departmentStableId: 'STABLE-008',
      departmentName: '品質管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
  ],
  'meeting-2026-02': [
    {
      departmentId: 'dept-001',
      departmentStableId: 'STABLE-001',
      departmentName: '営業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-05T14:00:00+09:00',
      lastUpdatedBy: '山田太郎',
      submittedAt: '2026-02-05T14:00:00+09:00',
      approvalInfo: null,
    },
    {
      departmentId: 'dept-002',
      departmentStableId: 'STABLE-002',
      departmentName: '製造本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-06T10:00:00+09:00',
      lastUpdatedBy: '高橋次郎',
      submittedAt: '2026-02-06T10:00:00+09:00',
      approvalInfo: null,
    },
    {
      departmentId: 'dept-003',
      departmentStableId: 'STABLE-003',
      departmentName: '管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'IN_PROGRESS',
      lastUpdatedAt: '2026-02-04T16:00:00+09:00',
      lastUpdatedBy: '渡辺四郎',
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-004',
      departmentStableId: 'STABLE-004',
      departmentName: '研究開発本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-07T11:00:00+09:00',
      lastUpdatedBy: '加藤七郎',
      submittedAt: '2026-02-07T11:00:00+09:00',
      approvalInfo: null,
    },
    {
      departmentId: 'dept-005',
      departmentStableId: 'STABLE-005',
      departmentName: '情報システム本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-05T09:00:00+09:00',
      lastUpdatedBy: '松本八郎',
      submittedAt: '2026-02-05T09:00:00+09:00',
      approvalInfo: null,
    },
    {
      departmentId: 'dept-006',
      departmentStableId: 'STABLE-006',
      departmentName: '人事本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-02-06T15:00:00+09:00',
      lastUpdatedBy: '井上九郎',
      submittedAt: '2026-02-06T15:00:00+09:00',
      approvalInfo: null,
    },
    {
      departmentId: 'dept-007',
      departmentStableId: 'STABLE-007',
      departmentName: '海外事業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-008',
      departmentStableId: 'STABLE-008',
      departmentName: '品質管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'OVERDUE',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-009',
      departmentStableId: 'STABLE-009',
      departmentName: '法務本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'IN_PROGRESS',
      lastUpdatedAt: '2026-02-03T11:00:00+09:00',
      lastUpdatedBy: '斎藤十一郎',
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-010',
      departmentStableId: 'STABLE-010',
      departmentName: '広報本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
  ],
  'forecast-2026-q2': [
    {
      departmentId: 'dept-001',
      departmentStableId: 'STABLE-001',
      departmentName: '営業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-002',
      departmentStableId: 'STABLE-002',
      departmentName: '製造本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-003',
      departmentStableId: 'STABLE-003',
      departmentName: '管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-004',
      departmentStableId: 'STABLE-004',
      departmentName: '研究開発本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
    {
      departmentId: 'dept-005',
      departmentStableId: 'STABLE-005',
      departmentName: '情報システム本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'NOT_STARTED',
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      submittedAt: null,
      approvalInfo: null,
    },
  ],
  'forecast-2026-q1': [
    {
      departmentId: 'dept-001',
      departmentStableId: 'STABLE-001',
      departmentName: '営業本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-03-18T14:00:00+09:00',
      lastUpdatedBy: '山田太郎',
      submittedAt: '2026-03-15T10:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-002',
      departmentStableId: 'STABLE-002',
      departmentName: '製造本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-03-17T11:00:00+09:00',
      lastUpdatedBy: '高橋次郎',
      submittedAt: '2026-03-14T09:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-003',
      departmentStableId: 'STABLE-003',
      departmentName: '管理本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'SUBMITTED',
      lastUpdatedAt: '2026-03-16T16:00:00+09:00',
      lastUpdatedBy: '渡辺四郎',
      submittedAt: '2026-03-16T16:00:00+09:00',
      approvalInfo: { currentStep: 2, maxSteps: 3, nextApproverName: '田中本部長' },
    },
    {
      departmentId: 'dept-004',
      departmentStableId: 'STABLE-004',
      departmentName: '研究開発本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'APPROVED',
      lastUpdatedAt: '2026-03-19T10:00:00+09:00',
      lastUpdatedBy: '加藤七郎',
      submittedAt: '2026-03-17T14:00:00+09:00',
      approvalInfo: { currentStep: 3, maxSteps: 3, nextApproverName: null },
    },
    {
      departmentId: 'dept-005',
      departmentStableId: 'STABLE-005',
      departmentName: '情報システム本部',
      departmentLevel: 1,
      parentDepartmentId: null,
      status: 'IN_PROGRESS',
      lastUpdatedAt: '2026-03-10T09:00:00+09:00',
      lastUpdatedBy: '松本八郎',
      submittedAt: null,
      approvalInfo: null,
    },
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateSummary(departments: BffDepartmentSubmission[], deadline: string | null): BffSubmissionSummary {
  const counts = departments.reduce(
    (acc, dept) => {
      acc[dept.status] = (acc[dept.status] || 0) + 1
      return acc
    },
    {} as Record<SubmissionStatus, number>
  )

  const total = departments.length
  const completed = (counts.APPROVED || 0) + (counts.SUBMITTED || 0)

  let daysUntilDeadline: number | null = null
  if (deadline) {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return {
    total,
    notStarted: counts.NOT_STARTED || 0,
    inProgress: counts.IN_PROGRESS || 0,
    submitted: counts.SUBMITTED || 0,
    approved: counts.APPROVED || 0,
    rejected: counts.REJECTED || 0,
    overdue: counts.OVERDUE || 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    daysUntilDeadline,
  }
}

// ============================================================================
// MockBffClient Implementation
// ============================================================================

export const mockBffClient: BffClient = {
  async listEvents(request: BffUnifiedEventListRequest): Promise<BffUnifiedEventListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = [...mockEvents]

    // Apply filters
    if (request.eventType) {
      filtered = filtered.filter((e) => e.eventType === request.eventType)
    }
    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter((e) => e.eventName.toLowerCase().includes(kw))
    }
    if (request.statusLabel) {
      filtered = filtered.filter((e) => e.statusLabel === request.statusLabel)
    }
    if (request.fiscalYear) {
      filtered = filtered.filter((e) => e.targetPeriod.includes(String(request.fiscalYear)))
    }

    // Apply sorting
    const sortBy = request.sortBy || 'createdAt'
    const sortOrder = request.sortOrder || 'desc'
    filtered.sort((a, b) => {
      let aVal: string | number | null
      let bVal: string | number | null

      switch (sortBy) {
        case 'eventName':
          aVal = a.eventName
          bVal = b.eventName
          break
        case 'deadline':
          aVal = a.deadline
          bVal = b.deadline
          break
        case 'statusLabel':
          aVal = a.statusLabel
          bVal = b.statusLabel
          break
        default:
          aVal = a.createdAt
          bVal = b.createdAt
      }

      if (aVal === null) return sortOrder === 'asc' ? 1 : -1
      if (bVal === null) return sortOrder === 'asc' ? -1 : 1

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Apply pagination
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 20, 100)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items,
      page,
      pageSize,
      totalCount: filtered.length,
    }
  },

  async getEventDetail(
    eventType: UnifiedEventType,
    eventId: string
  ): Promise<BffUnifiedEventDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const event = mockEvents.find((e) => e.eventType === eventType && e.id === eventId)
    if (!event) {
      throw new Error('EVENT_NOT_FOUND')
    }

    // Parse period for periodStart/periodEnd
    let periodStart: string | null = null
    let periodEnd: string | null = null

    if (event.eventType === 'BUDGET' || event.eventType === 'FORECAST') {
      // e.g., "2026年4月〜2027年3月"
      const match = event.targetPeriod.match(/(\d{4})年(\d{1,2})月〜(\d{4})年(\d{1,2})月/)
      if (match) {
        periodStart = `${match[1]}-${match[2].padStart(2, '0')}-01`
        periodEnd = `${match[3]}-${match[4].padStart(2, '0')}-01`
      }
    }

    return {
      id: event.id,
      eventType: event.eventType,
      eventName: event.eventName,
      targetPeriod: event.targetPeriod,
      periodStart,
      periodEnd,
      status: event.status,
      statusLabel: event.statusLabel,
      deadline: event.deadline,
      createdAt: event.createdAt,
      createdBy: '管理者',
      hasSubmissionTracking: event.hasSubmissionTracking,
    }
  },

  async listSubmissions(
    eventType: UnifiedEventType,
    eventId: string,
    request: BffSubmissionListRequest
  ): Promise<BffSubmissionListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Check if event supports submission tracking
    const event = mockEvents.find((e) => e.eventType === eventType && e.id === eventId)
    if (!event || !event.hasSubmissionTracking) {
      throw new Error('SUBMISSION_NOT_SUPPORTED')
    }

    let departments = mockDepartmentSubmissions[eventId] || []

    // Apply filters
    if (request.status && request.status.length > 0) {
      departments = departments.filter((d) => request.status!.includes(d.status))
    }
    if (request.departmentIds && request.departmentIds.length > 0) {
      if (request.includeChildren) {
        // Include children of selected departments
        const selectedIds = new Set(request.departmentIds)
        departments = departments.filter(
          (d) => selectedIds.has(d.departmentId) || (d.parentDepartmentId && selectedIds.has(d.parentDepartmentId))
        )
      } else {
        departments = departments.filter((d) => request.departmentIds!.includes(d.departmentId))
      }
    }

    const summary = calculateSummary(departments, event.deadline)

    return {
      eventId,
      eventType: event.eventType,
      eventName: event.eventName,
      deadline: event.deadline,
      summary,
      departments,
    }
  },

  async sendReminder(
    _eventType: UnifiedEventType,
    _eventId: string,
    request: BffSendReminderRequest
  ): Promise<BffSendReminderResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Phase 1: Mock response only
    return {
      success: true,
      sentCount: request.departmentIds.length,
      message: `${request.departmentIds.length}件の部門に催促を送信しました`,
    }
  },
}

// Export as default bffClient for current phase
export const bffClient = mockBffClient

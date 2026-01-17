/**
 * MockBffClient: approval (承認ワークフロー)
 *
 * 開発・テスト用のモック実装
 */

import type { BffClient } from './BffClient'
import type {
  BffApprovalListRequest,
  BffApprovalListResponse,
  BffApprovalDetailResponse,
  BffApprovalCountResponse,
  BffApprovalActionRequest,
  BffApprovalActionResponse,
  BffApprovalHistoryResponse,
  BffApprovalSummary,
  BffApproverStep,
  ApprovalStatus,
} from '@epm/contracts/bff/approval'

// ============================================================================
// Mock Data (mutable for stateful simulation)
// ============================================================================

// モック状態管理 - アクション実行後に状態を反映
let mockApprovalState: Map<string, { status: ApprovalStatus; currentStep: number }> = new Map()

const mockApprovers: BffApproverStep[] = [
  {
    step: 1,
    approverEmployeeId: 'emp-001',
    approverEmployeeName: '田中 一郎',
    deputyEmployeeId: 'emp-002',
    deputyEmployeeName: '鈴木 二郎',
    isCompleted: true,
    isCurrent: false,
    isCurrentUser: false,
    completedAt: '2026-01-10T10:00:00+09:00',
    completedByEmployeeName: '田中 一郎',
  },
  {
    step: 2,
    approverEmployeeId: 'emp-003',
    approverEmployeeName: '佐藤 三郎',
    deputyEmployeeId: null,
    deputyEmployeeName: null,
    isCompleted: false,
    isCurrent: true,
    isCurrentUser: true, // 現在のユーザーが承認者
    completedAt: null,
    completedByEmployeeName: null,
  },
  {
    step: 3,
    approverEmployeeId: 'emp-004',
    approverEmployeeName: '山田 四郎',
    deputyEmployeeId: null,
    deputyEmployeeName: null,
    isCompleted: false,
    isCurrent: false,
    isCurrentUser: false,
    completedAt: null,
    completedByEmployeeName: null,
  },
]

const mockApprovals: BffApprovalSummary[] = [
  {
    id: 'approval-001',
    departmentStableId: 'dept-sales1',
    departmentName: '営業1課',
    planVersionId: 'pv-001',
    planVersionName: 'FY2026予算 第1回',
    eventName: 'FY2026 当初予算',
    scenarioType: 'BUDGET',
    currentStep: 2,
    status: 'PENDING',
    submittedAt: '2026-01-10T09:00:00+09:00',
    submittedByEmployeeName: '中村 太郎',
  },
  {
    id: 'approval-002',
    departmentStableId: 'dept-sales2',
    departmentName: '営業2課',
    planVersionId: 'pv-001',
    planVersionName: 'FY2026予算 第1回',
    eventName: 'FY2026 当初予算',
    scenarioType: 'BUDGET',
    currentStep: 1,
    status: 'PENDING',
    submittedAt: '2026-01-11T14:30:00+09:00',
    submittedByEmployeeName: '小林 花子',
  },
  {
    id: 'approval-003',
    departmentStableId: 'dept-dev1',
    departmentName: '開発1課',
    planVersionId: 'pv-002',
    planVersionName: 'FY2026見込 1月',
    eventName: 'FY2026 1月見込',
    scenarioType: 'FORECAST',
    currentStep: 1,
    status: 'PENDING',
    submittedAt: '2026-01-12T11:00:00+09:00',
    submittedByEmployeeName: '山田 次郎',
  },
]

const mockDetail: BffApprovalDetailResponse = {
  id: 'approval-001',
  departmentStableId: 'dept-sales1',
  departmentName: '営業1課',
  planVersionId: 'pv-001',
  planVersionName: 'FY2026予算 第1回',
  eventName: 'FY2026 当初予算',
  scenarioType: 'BUDGET',
  currentStep: 2,
  status: 'PENDING',
  submittedAt: '2026-01-10T09:00:00+09:00',
  submittedByEmployeeId: 'emp-010',
  submittedByEmployeeName: '中村 太郎',
  finalApprovedAt: null,
  summary: {
    revenue: '272000000',
    cost: '114953600',
    operatingProfit: '107046400',
  },
  approvers: mockApprovers,
  canApprove: true,
  canReject: true,
  canWithdraw: false,
  isCurrentUserApprover: true,
  currentUserStep: 2,
}

const mockHistory: BffApprovalHistoryResponse = {
  items: [
    {
      id: 'hist-001',
      step: 0,
      action: 'SUBMIT',
      actorEmployeeId: 'emp-010',
      actorEmployeeName: '中村 太郎',
      actedAt: '2026-01-10T09:00:00+09:00',
      comment: '第1回予算を提出します。',
    },
    {
      id: 'hist-002',
      step: 1,
      action: 'APPROVE',
      actorEmployeeId: 'emp-001',
      actorEmployeeName: '田中 一郎',
      actedAt: '2026-01-10T10:00:00+09:00',
      comment: '確認しました。',
    },
  ],
}

// ============================================================================
// MockBffClient Implementation
// ============================================================================

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // 状態が変更されたアイテムの現在の値を取得
  private getApprovalWithState(approval: BffApprovalSummary): BffApprovalSummary {
    const state = mockApprovalState.get(approval.id)
    if (state) {
      return { ...approval, status: state.status, currentStep: state.currentStep }
    }
    return approval
  }

  async listApprovals(request: BffApprovalListRequest): Promise<BffApprovalListResponse> {
    await this.delay()

    let filtered = mockApprovals.map((a) => this.getApprovalWithState(a))

    // keyword フィルタ
    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.departmentName.toLowerCase().includes(kw) ||
          a.eventName.toLowerCase().includes(kw)
      )
    }

    // scenarioType フィルタ
    if (request.scenarioType) {
      filtered = filtered.filter((a) => a.scenarioType === request.scenarioType)
    }

    // ソート
    const sortBy = request.sortBy || 'submittedAt'
    const sortOrder = request.sortOrder || 'desc'
    filtered.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'departmentName') {
        cmp = a.departmentName.localeCompare(b.departmentName)
      } else if (sortBy === 'eventName') {
        cmp = a.eventName.localeCompare(b.eventName)
      } else {
        // submittedAt
        cmp = (a.submittedAt || '').localeCompare(b.submittedAt || '')
      }
      return sortOrder === 'desc' ? -cmp : cmp
    })

    // ページング
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 50, 200)
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return {
      items: paged,
      page,
      pageSize,
      totalCount: filtered.length,
    }
  }

  async getApprovalDetail(id: string): Promise<BffApprovalDetailResponse> {
    await this.delay()

    // モックでは固定データを返す（idに応じて調整可能）
    const baseSummary = mockApprovals.find((a) => a.id === id)
    if (!baseSummary) {
      throw {
        code: 'STATUS_NOT_FOUND',
        message: '指定された承認ステータスが見つかりません',
      }
    }

    // 状態変更を反映
    const summary = this.getApprovalWithState(baseSummary)

    // 承認/却下/取り下げ後の権限を調整
    const isActionable = summary.status === 'PENDING'

    return {
      ...mockDetail,
      id: summary.id,
      departmentStableId: summary.departmentStableId,
      departmentName: summary.departmentName,
      planVersionId: summary.planVersionId,
      planVersionName: summary.planVersionName,
      eventName: summary.eventName,
      scenarioType: summary.scenarioType,
      currentStep: summary.currentStep,
      status: summary.status,
      submittedAt: summary.submittedAt,
      canApprove: isActionable && mockDetail.canApprove,
      canReject: isActionable && mockDetail.canReject,
      canWithdraw: summary.status === 'PENDING', // 申請者なら取り下げ可能
    }
  }

  async getApprovalCount(): Promise<BffApprovalCountResponse> {
    await this.delay(100) // 軽量APIなので短めのdelay

    // 状態変更を反映してカウント
    const pendingCount = mockApprovals
      .map((a) => this.getApprovalWithState(a))
      .filter((a) => a.status === 'PENDING').length

    return {
      count: pendingCount,
    }
  }

  async submitApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    await this.delay()

    return {
      id,
      status: 'PENDING',
      currentStep: 1,
      message: '承認申請を提出しました。',
    }
  }

  async approveApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    await this.delay()

    // モックでは次段階へ進む or 最終承認
    const base = mockApprovals.find((a) => a.id === id)
    const current = base ? this.getApprovalWithState(base) : null
    const nextStep = (current?.currentStep || 1) + 1
    const isFinal = nextStep > 3 // 3段階想定

    const newStatus: ApprovalStatus = isFinal ? 'APPROVED' : 'PENDING'
    const newStep = isFinal ? 3 : nextStep

    // 状態を保存
    mockApprovalState.set(id, { status: newStatus, currentStep: newStep })

    return {
      id,
      status: newStatus,
      currentStep: newStep,
      message: isFinal ? '最終承認が完了しました。' : '承認しました。次の承認者に通知されます。',
    }
  }

  async rejectApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    await this.delay()

    // 状態を保存
    mockApprovalState.set(id, { status: 'REJECTED', currentStep: 0 })

    return {
      id,
      status: 'REJECTED',
      currentStep: 0,
      message: '差し戻しました。申請者に通知されます。',
    }
  }

  async withdrawApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    await this.delay()

    // 状態を保存
    mockApprovalState.set(id, { status: 'WITHDRAWN', currentStep: 0 })

    return {
      id,
      status: 'WITHDRAWN',
      currentStep: 0,
      message: '取り下げました。',
    }
  }

  async getApprovalHistory(statusId: string): Promise<BffApprovalHistoryResponse> {
    await this.delay()

    return mockHistory
  }
}

/**
 * MockBffClient for Period Close Status
 *
 * UI-MOCK Phase: モックデータで画面を動作させる
 * UI-BFF Phase: HttpBffClient に差し替え
 *
 * 締めステータス: OPEN / HARD_CLOSED の2段階（仮締め廃止）
 * 入力制御: input_locked フラグで管理
 */

import type {
  BffListPeriodCloseStatusRequest,
  BffListPeriodCloseStatusResponse,
  BffHardCloseRequest,
  BffReopenRequest,
  BffCloseOperationResponse,
  BffFiscalYearListResponse,
  BffPeriodCloseStatus,
  CloseStatus,
  BffRunAllocationRequest,
  BffRunAllocationResponse,
  BffListAllocationEventsRequest,
  BffListAllocationEventsResponse,
  BffExecuteAllocationRequest,
  BffExecuteAllocationResponse,
  BffGetAllocationResultRequest,
  BffAllocationResultResponse,
  BffUnlockInputRequest,
  BffUnlockInputResponse,
  BffAllocationEvent,
  BffAllocationExecution,
} from '@epm/contracts/bff/period-close-status'
import type { BffClient } from './BffClient'

// Mock data - 配賦イベント（配賦マスタと同じIDを使用）
const mockAllocationEvents: BffAllocationEvent[] = [
  {
    id: 'evt-001',
    eventCode: 'ALLOC-001',
    eventName: '本社経費配賦(実績)',
    scenarioType: 'ACTUAL',
    executionOrder: 1,
    stepCount: 2,
    isActive: true,
  },
  {
    id: 'evt-002',
    eventCode: 'ALLOC-002',
    eventName: '間接費配賦(予算)',
    scenarioType: 'BUDGET',
    executionOrder: 2,
    stepCount: 3,
    isActive: true,
  },
  {
    id: 'evt-003',
    eventCode: 'ALLOC-003',
    eventName: 'IT費用配賦(実績)',
    scenarioType: 'ACTUAL',
    executionOrder: 3,
    stepCount: 1,
    isActive: false,
  },
]

// Mock data - 配賦結果（期間ごとに保持）
const mockAllocationResults: Record<string, BffAllocationExecution[]> = {
  'ap-2026-04': [
    {
      executionId: 'exec-evt-001-2026-04',
      eventId: 'evt-001',
      eventName: '本社経費配賦(実績)',
      executedAt: '2026-05-09T09:00:00Z',
      executedBy: '山田太郎',
      status: 'SUCCESS',
      steps: [
        {
          stepId: 'step-evt-001-1',
          stepNo: 1,
          stepName: '本社費→事業部',
          fromSubjectCode: 'HQ-COMMON',
          fromSubjectName: '本社共通費',
          fromDepartmentCode: 'HQ',
          fromDepartmentName: '本社',
          sourceAmount: 8500000,
          details: [
            {
              detailId: 'detail-001-1-1',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES',
              targetName: '営業部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 25,
              ratio: 0.42,
              allocatedAmount: 3570000,
            },
            {
              detailId: 'detail-001-1-2',
              targetType: 'DEPARTMENT',
              targetCode: 'MFG',
              targetName: '製造部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 20,
              ratio: 0.33,
              allocatedAmount: 2805000,
            },
            {
              detailId: 'detail-001-1-3',
              targetType: 'DEPARTMENT',
              targetCode: 'ADMIN',
              targetName: '管理部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 15,
              ratio: 0.25,
              allocatedAmount: 2125000,
            },
          ],
        },
        {
          stepId: 'step-evt-001-2',
          stepNo: 2,
          stepName: 'IT費→部門',
          fromSubjectCode: 'IT-COST',
          fromSubjectName: 'IT費',
          fromDepartmentCode: 'HQ',
          fromDepartmentName: '本社',
          sourceAmount: 3200000,
          details: [
            {
              detailId: 'detail-001-2-1',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES',
              targetName: '営業部',
              toSubjectCode: 'IT-COST',
              toSubjectName: 'IT費',
              driverType: 'FIXED',
              driverValue: null,
              ratio: 0.35,
              allocatedAmount: 1120000,
            },
            {
              detailId: 'detail-001-2-2',
              targetType: 'DEPARTMENT',
              targetCode: 'MFG',
              targetName: '製造部',
              toSubjectCode: 'IT-COST',
              toSubjectName: 'IT費',
              driverType: 'FIXED',
              driverValue: null,
              ratio: 0.40,
              allocatedAmount: 1280000,
            },
            {
              detailId: 'detail-001-2-3',
              targetType: 'DEPARTMENT',
              targetCode: 'ADMIN',
              targetName: '管理部',
              toSubjectCode: 'IT-COST',
              toSubjectName: 'IT費',
              driverType: 'FIXED',
              driverValue: null,
              ratio: 0.25,
              allocatedAmount: 800000,
            },
          ],
        },
      ],
    },
    {
      executionId: 'exec-evt-002-2026-04',
      eventId: 'evt-002',
      eventName: '間接費配賦(予算)',
      executedAt: '2026-05-09T09:01:00Z',
      executedBy: '山田太郎',
      status: 'SUCCESS',
      steps: [
        {
          stepId: 'step-evt-002-1',
          stepNo: 1,
          stepName: '事業部費→課',
          fromSubjectCode: 'DIV-COMMON',
          fromSubjectName: '事業部共通費',
          fromDepartmentCode: 'SALES',
          fromDepartmentName: '営業部',
          sourceAmount: 2500000,
          details: [
            {
              detailId: 'detail-002-1-1',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES-1',
              targetName: '営業1課',
              toSubjectCode: 'DIV-COMMON',
              toSubjectName: '事業部共通費',
              driverType: 'SUBJECT_AMOUNT',
              driverValue: 45000000,
              ratio: 0.45,
              allocatedAmount: 1125000,
            },
            {
              detailId: 'detail-002-1-2',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES-2',
              targetName: '営業2課',
              toSubjectCode: 'DIV-COMMON',
              toSubjectName: '事業部共通費',
              driverType: 'SUBJECT_AMOUNT',
              driverValue: 35000000,
              ratio: 0.35,
              allocatedAmount: 875000,
            },
            {
              detailId: 'detail-002-1-3',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES-3',
              targetName: '営業3課',
              toSubjectCode: 'DIV-COMMON',
              toSubjectName: '事業部共通費',
              driverType: 'SUBJECT_AMOUNT',
              driverValue: 20000000,
              ratio: 0.20,
              allocatedAmount: 500000,
            },
          ],
        },
      ],
    },
  ],
  'ap-2026-08': [
    {
      executionId: 'exec-evt-001-2026-08',
      eventId: 'evt-001',
      eventName: '本社経費配賦(実績)',
      executedAt: '2026-09-05T10:00:00Z',
      executedBy: '鈴木花子',
      status: 'SUCCESS',
      steps: [
        {
          stepId: 'step-evt-001-1-08',
          stepNo: 1,
          stepName: '本社費→事業部',
          fromSubjectCode: 'HQ-COMMON',
          fromSubjectName: '本社共通費',
          fromDepartmentCode: 'HQ',
          fromDepartmentName: '本社',
          sourceAmount: 10500000,
          details: [
            {
              detailId: 'detail-001-1-1-08',
              targetType: 'DEPARTMENT',
              targetCode: 'SALES',
              targetName: '営業部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 28,
              ratio: 0.44,
              allocatedAmount: 4620000,
            },
            {
              detailId: 'detail-001-1-2-08',
              targetType: 'DEPARTMENT',
              targetCode: 'MFG',
              targetName: '製造部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 21,
              ratio: 0.33,
              allocatedAmount: 3465000,
            },
            {
              detailId: 'detail-001-1-3-08',
              targetType: 'DEPARTMENT',
              targetCode: 'ADMIN',
              targetName: '管理部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 15,
              ratio: 0.23,
              allocatedAmount: 2415000,
            },
          ],
        },
      ],
    },
  ],
}

// Mock data - 月次締め状況（仮締め廃止版）
const mockPeriodStatuses: Record<string, BffPeriodCloseStatus[]> = {
  'company-001': [
    {
      accountingPeriodId: 'ap-2026-04',
      fiscalYear: 2026,
      periodNo: 1,
      periodLabel: '4月',
      closeStatus: 'HARD_CLOSED',
      closedAt: '2026-05-10T10:00:00Z',
      operatedBy: '山田太郎',
      canHardClose: false,
      canReopen: false,
      checkResults: [],
      inputLocked: true,
      inputLockedAt: '2026-05-09T09:00:00Z',
      inputLockedBy: '山田太郎',
      canUnlockInput: false,
      hasAllocationResult: true,
      canRunAllocation: false,
    },
    {
      accountingPeriodId: 'ap-2026-05',
      fiscalYear: 2026,
      periodNo: 2,
      periodLabel: '5月',
      closeStatus: 'HARD_CLOSED',
      closedAt: '2026-06-08T15:30:00Z',
      operatedBy: '山田太郎',
      canHardClose: false,
      canReopen: false,
      checkResults: [],
      inputLocked: true,
      inputLockedAt: '2026-06-07T10:00:00Z',
      inputLockedBy: '山田太郎',
      canUnlockInput: false,
      hasAllocationResult: true,
      canRunAllocation: false,
    },
    {
      accountingPeriodId: 'ap-2026-06',
      fiscalYear: 2026,
      periodNo: 3,
      periodLabel: '6月',
      closeStatus: 'HARD_CLOSED',
      closedAt: '2026-07-09T14:00:00Z',
      operatedBy: '山田太郎',
      canHardClose: false,
      canReopen: false,
      checkResults: [],
      inputLocked: true,
      inputLockedAt: '2026-07-08T11:00:00Z',
      inputLockedBy: '山田太郎',
      canUnlockInput: false,
      hasAllocationResult: true,
      canRunAllocation: false,
    },
    {
      accountingPeriodId: 'ap-2026-07',
      fiscalYear: 2026,
      periodNo: 4,
      periodLabel: '7月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: true, // 配賦済み & 前月本締め済み
      canReopen: false,
      checkResults: [],
      inputLocked: true,
      inputLockedAt: '2026-08-06T09:30:00Z',
      inputLockedBy: '山田太郎',
      canUnlockInput: true,
      hasAllocationResult: true,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-08',
      fiscalYear: 2026,
      periodNo: 5,
      periodLabel: '8月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: true,
      inputLockedAt: '2026-09-05T10:00:00Z',
      inputLockedBy: '鈴木花子',
      canUnlockInput: true,
      hasAllocationResult: true,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-09',
      fiscalYear: 2026,
      periodNo: 6,
      periodLabel: '9月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-10',
      fiscalYear: 2026,
      periodNo: 7,
      periodLabel: '10月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-11',
      fiscalYear: 2026,
      periodNo: 8,
      periodLabel: '11月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-12',
      fiscalYear: 2026,
      periodNo: 9,
      periodLabel: '12月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-01',
      fiscalYear: 2026,
      periodNo: 10,
      periodLabel: '1月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-02',
      fiscalYear: 2026,
      periodNo: 11,
      periodLabel: '2月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
    {
      accountingPeriodId: 'ap-2026-03',
      fiscalYear: 2026,
      periodNo: 12,
      periodLabel: '3月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
      inputLocked: false,
      inputLockedAt: null,
      inputLockedBy: null,
      canUnlockInput: false,
      hasAllocationResult: false,
      canRunAllocation: true,
    },
  ],
}

// Helper to update checkResults and canHardClose based on previous month status
function updateCheckResults(periods: BffPeriodCloseStatus[]): void {
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    if (period.closeStatus === 'OPEN') {
      const prevPeriod = i > 0 ? periods[i - 1] : null
      const isPrevHardClosed = prevPeriod?.closeStatus === 'HARD_CLOSED'

      period.checkResults = [
        {
          checkType: 'PREVIOUS_MONTH_CLOSED',
          passed: i === 0 || isPrevHardClosed,
          message: i === 0 || isPrevHardClosed ? '前月は本締め済みです' : '前月が本締めされていません',
        },
      ]
      // 本締め可能条件: 前月本締め済み & 配賦済み(input_locked)
      period.canHardClose = (i === 0 || isPrevHardClosed) && period.inputLocked
    }
  }
}

// 配賦結果生成ヘルパー
function generateMockAllocationResult(
  eventIds: string[],
  _accountingPeriodId: string
): BffAllocationExecution[] {
  return eventIds.map((eventId) => {
    const event = mockAllocationEvents.find((e) => e.id === eventId)
    if (!event) throw new Error(`Event not found: ${eventId}`)

    return {
      executionId: `exec-${eventId}-${Date.now()}`,
      eventId,
      eventName: event.eventName,
      executedAt: new Date().toISOString(),
      executedBy: '山田太郎',
      status: 'SUCCESS' as const,
      steps: [
        {
          stepId: `step-${eventId}-1`,
          stepNo: 1,
          stepName: '本社費→事業部',
          fromSubjectCode: 'HQ-COMMON',
          fromSubjectName: '本社共通費',
          fromDepartmentCode: 'HQ',
          fromDepartmentName: '本社',
          sourceAmount: 10000000,
          details: [
            {
              detailId: `detail-${eventId}-1-1`,
              targetType: 'DEPARTMENT' as const,
              targetCode: 'SALES',
              targetName: '営業部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 25,
              ratio: 0.4,
              allocatedAmount: 4000000,
            },
            {
              detailId: `detail-${eventId}-1-2`,
              targetType: 'DEPARTMENT' as const,
              targetCode: 'MFG',
              targetName: '製造部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 20,
              ratio: 0.35,
              allocatedAmount: 3500000,
            },
            {
              detailId: `detail-${eventId}-1-3`,
              targetType: 'DEPARTMENT' as const,
              targetCode: 'ADMIN',
              targetName: '管理部',
              toSubjectCode: 'HQ-COMMON',
              toSubjectName: '本社共通費',
              driverType: 'HEADCOUNT',
              driverValue: 15,
              ratio: 0.25,
              allocatedAmount: 2500000,
            },
          ],
        },
      ],
    }
  })
}

export const mockBffClient: BffClient = {
  async listPeriodCloseStatus(req: BffListPeriodCloseStatusRequest): Promise<BffListPeriodCloseStatusResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const companyId = req.companyId || 'company-001'
    let periods = mockPeriodStatuses[companyId]

    if (!periods) {
      // Generate default periods for unknown company
      periods = Array.from({ length: 12 }, (_, i) => ({
        accountingPeriodId: `ap-${req.fiscalYear}-${String(i + 1).padStart(2, '0')}`,
        fiscalYear: req.fiscalYear,
        periodNo: i + 1,
        periodLabel: `${((i + 3) % 12) + 1}月`,
        closeStatus: 'OPEN' as CloseStatus,
        closedAt: null,
        operatedBy: null,
        canHardClose: false,
        canReopen: false,
        checkResults: [
          {
            checkType: 'PREVIOUS_MONTH_CLOSED' as const,
            passed: i === 0,
            message: i === 0 ? '期首月です' : '前月が本締めされていません',
          },
        ],
        inputLocked: false,
        inputLockedAt: null,
        inputLockedBy: null,
        canUnlockInput: false,
        hasAllocationResult: false,
        canRunAllocation: true,
      }))
      mockPeriodStatuses[companyId] = periods
    }

    // Filter by fiscal year
    const filtered = periods.filter((p) => p.fiscalYear === req.fiscalYear)

    return {
      companyId,
      companyName: 'EPMホールディングス株式会社',
      fiscalYear: req.fiscalYear,
      periods: filtered,
    }
  },

  async getFiscalYears(_companyId: string): Promise<BffFiscalYearListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      fiscalYears: [
        { fiscalYear: 2027, label: '2027年度' },
        { fiscalYear: 2026, label: '2026年度' },
        { fiscalYear: 2025, label: '2025年度' },
      ],
      currentFiscalYear: 2026,
    }
  },

  async hardClose(req: BffHardCloseRequest): Promise<BffCloseOperationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        // 本締め条件: OPEN状態 & 配賦済み(input_locked) & 前月本締め済み
        if (period.closeStatus !== 'OPEN') {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '既に本締めされています',
          }
        }

        if (!period.inputLocked) {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '配賦処理が完了していません',
          }
        }

        period.closeStatus = 'HARD_CLOSED'
        period.closedAt = new Date().toISOString()
        period.operatedBy = '山田太郎'
        period.canHardClose = false
        period.canReopen = true // 権限者は差し戻し可能
        period.canUnlockInput = false
        period.checkResults = []

        // Update next period's check results
        updateCheckResults(companyPeriods)

        return {
          success: true,
          accountingPeriodId: req.accountingPeriodId,
          newStatus: 'HARD_CLOSED',
          operatedAt: period.closedAt,
        }
      }
    }

    return {
      success: false,
      accountingPeriodId: req.accountingPeriodId,
      newStatus: 'OPEN',
      operatedAt: new Date().toISOString(),
      errorMessage: '期間が見つかりません',
    }
  },

  async reopen(req: BffReopenRequest): Promise<BffCloseOperationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        // 差し戻し条件: HARD_CLOSED状態 & 翌月以降が未締め
        if (period.closeStatus !== 'HARD_CLOSED') {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '本締め状態でないため戻せません',
          }
        }

        period.closeStatus = 'OPEN'
        period.closedAt = null
        period.operatedBy = null
        period.canHardClose = period.inputLocked
        period.canReopen = false
        period.canUnlockInput = period.inputLocked

        // Update check results
        updateCheckResults(companyPeriods)

        return {
          success: true,
          accountingPeriodId: req.accountingPeriodId,
          newStatus: 'OPEN',
          operatedAt: new Date().toISOString(),
        }
      }
    }

    return {
      success: false,
      accountingPeriodId: req.accountingPeriodId,
      newStatus: 'OPEN',
      operatedAt: new Date().toISOString(),
      errorMessage: '期間が見つかりません',
    }
  },

  async runAllocation(req: BffRunAllocationRequest): Promise<BffRunAllocationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // レガシーAPI（将来削除予定）
    const mockResults = [
      {
        allocationRuleId: 'alloc-001',
        allocationRuleName: '本社経費 → 事業部配賦',
        sourceAmount: 5000000,
        allocatedAmount: 5000000,
        targetCount: 5,
      },
      {
        allocationRuleId: 'alloc-002',
        allocationRuleName: 'IT費用 → 部門配賦',
        sourceAmount: 3000000,
        allocatedAmount: 3000000,
        targetCount: 8,
      },
    ]

    const totalSourceAmount = mockResults.reduce((sum, r) => sum + r.sourceAmount, 0)
    const totalAllocatedAmount = mockResults.reduce((sum, r) => sum + r.allocatedAmount, 0)

    return {
      success: true,
      accountingPeriodId: req.accountingPeriodId,
      executedAt: new Date().toISOString(),
      isDryRun: req.dryRun ?? false,
      results: mockResults,
      totalSourceAmount,
      totalAllocatedAmount,
    }
  },

  // ============================================================================
  // 配賦処理API
  // ============================================================================

  async listAllocationEvents(req: BffListAllocationEventsRequest): Promise<BffListAllocationEventsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    let events = [...mockAllocationEvents]
    if (req.scenarioType) {
      events = events.filter((e) => e.scenarioType === req.scenarioType)
    }
    events.sort((a, b) => a.executionOrder - b.executionOrder)

    return { events }
  },

  async executeAllocation(req: BffExecuteAllocationRequest): Promise<BffExecuteAllocationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (req.eventIds.length === 0) {
      return {
        success: false,
        executionIds: [],
        results: [],
        errorMessage: '配賦イベントが選択されていません',
      }
    }

    // 配賦結果を生成
    const executions = generateMockAllocationResult(req.eventIds, req.accountingPeriodId)
    mockAllocationResults[req.accountingPeriodId] = executions

    // 期間の input_locked を更新
    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        period.inputLocked = true
        period.inputLockedAt = new Date().toISOString()
        period.inputLockedBy = '山田太郎'
        period.canUnlockInput = period.closeStatus === 'OPEN'
        period.hasAllocationResult = true
        updateCheckResults(companyPeriods)
      }
    }

    return {
      success: true,
      executionIds: executions.map((e) => e.executionId),
      results: req.eventIds.map((eventId) => {
        const event = mockAllocationEvents.find((e) => e.id === eventId)!
        return {
          eventId,
          eventName: event.eventName,
          status: 'SUCCESS' as const,
          stepCount: event.stepCount,
          detailCount: 3,
          totalAllocatedAmount: 10000000,
        }
      }),
    }
  },

  async getAllocationResult(req: BffGetAllocationResultRequest): Promise<BffAllocationResultResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const executions = mockAllocationResults[req.accountingPeriodId] || []

    // 期間ラベル取得
    let periodLabel = ''
    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        periodLabel = period.periodLabel
        break
      }
    }

    return {
      companyId: req.companyId,
      accountingPeriodId: req.accountingPeriodId,
      periodLabel,
      executions,
    }
  },

  async unlockInput(req: BffUnlockInputRequest): Promise<BffUnlockInputResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 配賦結果を削除
    const deletedCount = mockAllocationResults[req.accountingPeriodId]?.length || 0
    delete mockAllocationResults[req.accountingPeriodId]

    // 期間の input_locked を更新
    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        if (period.closeStatus !== 'OPEN') {
          return {
            success: false,
            newInputLocked: true,
            deletedExecutionCount: 0,
            errorMessage: '締め状態のため入力ロックを解除できません',
          }
        }

        period.inputLocked = false
        period.inputLockedAt = null
        period.inputLockedBy = null
        period.canUnlockInput = false
        period.hasAllocationResult = false
        period.canHardClose = false
        updateCheckResults(companyPeriods)

        return {
          success: true,
          newInputLocked: false,
          deletedExecutionCount: deletedCount,
        }
      }
    }

    return {
      success: false,
      newInputLocked: true,
      deletedExecutionCount: 0,
      errorMessage: '期間が見つかりません',
    }
  },
}

// Export as default bffClient for current phase
export const bffClient = mockBffClient

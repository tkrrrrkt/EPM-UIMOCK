/**
 * MockBffClient for Period Close Status
 *
 * UI-MOCK Phase: モックデータで画面を動作させる
 * UI-BFF Phase: HttpBffClient に差し替え
 */

import type {
  BffListPeriodCloseStatusRequest,
  BffListPeriodCloseStatusResponse,
  BffSoftCloseRequest,
  BffHardCloseRequest,
  BffReopenRequest,
  BffCloseOperationResponse,
  BffFiscalYearListResponse,
  BffPeriodCloseStatus,
  CloseStatus,
  BffRunAllocationRequest,
  BffRunAllocationResponse,
} from '@epm/contracts/bff/period-close-status'
import type { BffClient } from './BffClient'

// Mock data - 月次締め状況
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
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [],
    },
    {
      accountingPeriodId: 'ap-2026-05',
      fiscalYear: 2026,
      periodNo: 2,
      periodLabel: '5月',
      closeStatus: 'HARD_CLOSED',
      closedAt: '2026-06-08T15:30:00Z',
      operatedBy: '山田太郎',
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [],
    },
    {
      accountingPeriodId: 'ap-2026-06',
      fiscalYear: 2026,
      periodNo: 3,
      periodLabel: '6月',
      closeStatus: 'HARD_CLOSED',
      closedAt: '2026-07-09T14:00:00Z',
      operatedBy: '山田太郎',
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [],
    },
    {
      accountingPeriodId: 'ap-2026-07',
      fiscalYear: 2026,
      periodNo: 4,
      periodLabel: '7月',
      closeStatus: 'SOFT_CLOSED',
      closedAt: '2026-08-07T11:20:00Z',
      operatedBy: '山田太郎',
      canSoftClose: false,
      canHardClose: true,
      canReopen: true,
      checkResults: [],
    },
    {
      accountingPeriodId: 'ap-2026-08',
      fiscalYear: 2026,
      periodNo: 5,
      periodLabel: '8月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: true,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: true, message: '前月は本締め済みです' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-09',
      fiscalYear: 2026,
      periodNo: 6,
      periodLabel: '9月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-10',
      fiscalYear: 2026,
      periodNo: 7,
      periodLabel: '10月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-11',
      fiscalYear: 2026,
      periodNo: 8,
      periodLabel: '11月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-12',
      fiscalYear: 2026,
      periodNo: 9,
      periodLabel: '12月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-01',
      fiscalYear: 2026,
      periodNo: 10,
      periodLabel: '1月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-02',
      fiscalYear: 2026,
      periodNo: 11,
      periodLabel: '2月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
    {
      accountingPeriodId: 'ap-2026-03',
      fiscalYear: 2026,
      periodNo: 12,
      periodLabel: '3月',
      closeStatus: 'OPEN',
      closedAt: null,
      operatedBy: null,
      canSoftClose: false,
      canHardClose: false,
      canReopen: false,
      checkResults: [
        { checkType: 'PREVIOUS_MONTH_CLOSED', passed: false, message: '前月が本締めされていません' },
      ],
    },
  ],
}

// Helper to update checkResults based on previous month status
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
      period.canSoftClose = i === 0 || isPrevHardClosed
    }
  }
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
        canSoftClose: i === 0,
        canHardClose: false,
        canReopen: false,
        checkResults: [
          {
            checkType: 'PREVIOUS_MONTH_CLOSED' as const,
            passed: i === 0,
            message: i === 0 ? '期首月です' : '前月が本締めされていません',
          },
        ],
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

  async getFiscalYears(companyId: string): Promise<BffFiscalYearListResponse> {
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

  async softClose(req: BffSoftCloseRequest): Promise<BffCloseOperationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find and update the period
    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        if (period.closeStatus !== 'OPEN') {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '既に締め処理が実行されています',
          }
        }

        period.closeStatus = 'SOFT_CLOSED'
        period.closedAt = new Date().toISOString()
        period.operatedBy = '山田太郎'
        period.canSoftClose = false
        period.canHardClose = true
        period.canReopen = true
        period.checkResults = []

        // Update next period's check results
        updateCheckResults(companyPeriods)

        return {
          success: true,
          accountingPeriodId: req.accountingPeriodId,
          newStatus: 'SOFT_CLOSED',
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

  async hardClose(req: BffHardCloseRequest): Promise<BffCloseOperationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (const companyPeriods of Object.values(mockPeriodStatuses)) {
      const period = companyPeriods.find((p) => p.accountingPeriodId === req.accountingPeriodId)
      if (period) {
        if (period.closeStatus !== 'SOFT_CLOSED') {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '仮締め状態でないため本締めできません',
          }
        }

        period.closeStatus = 'HARD_CLOSED'
        period.closedAt = new Date().toISOString()
        period.operatedBy = '山田太郎'
        period.canSoftClose = false
        period.canHardClose = false
        period.canReopen = false
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
        if (period.closeStatus !== 'SOFT_CLOSED') {
          return {
            success: false,
            accountingPeriodId: req.accountingPeriodId,
            newStatus: period.closeStatus,
            operatedAt: new Date().toISOString(),
            errorMessage: '仮締め状態でないため戻せません',
          }
        }

        period.closeStatus = 'OPEN'
        period.closedAt = null
        period.operatedBy = null
        period.canSoftClose = true
        period.canHardClose = false
        period.canReopen = false

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

    // モック: 配賦ルールに基づく配賦結果を返す
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
      {
        allocationRuleId: 'alloc-003',
        allocationRuleName: '共通費 → プロジェクト配賦',
        sourceAmount: 2000000,
        allocatedAmount: 2000000,
        targetCount: 12,
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
}

// Export as default bffClient for current phase
export const bffClient = mockBffClient

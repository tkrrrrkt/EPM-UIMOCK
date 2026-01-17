/**
 * MockBffClient: project-profitability (PJ採算照会)
 *
 * 開発・テスト用のモック実装
 */

import type { BffClient } from './BffClient'
import type {
  BffProjectListRequest,
  BffProjectListResponse,
  BffProjectDetailResponse,
  BffProjectFiltersResponse,
  BffProjectMonthlyTrendResponse,
  BffProjectSummary,
  ProjectStatus,
} from '@epm/contracts/bff/project-profitability'

// ============================================================================
// Mock Data
// ============================================================================

const mockProjects: BffProjectSummary[] = [
  {
    id: 'pj-001',
    projectCode: 'PJ-2026-001',
    projectName: '基幹システム刷新プロジェクト',
    departmentStableId: 'dept-dev1',
    departmentName: 'システム開発1課',
    status: 'ACTIVE',
    revenueBudget: 150000000,
    revenueProjection: 142000000,
    grossProfitRate: 28.5,
    isWarning: false,
  },
  {
    id: 'pj-002',
    projectCode: 'PJ-2026-002',
    projectName: 'ECサイトリニューアル',
    departmentStableId: 'dept-dev2',
    departmentName: 'システム開発2課',
    status: 'ACTIVE',
    revenueBudget: 80000000,
    revenueProjection: 75000000,
    grossProfitRate: -5.2,
    isWarning: true,
  },
  {
    id: 'pj-003',
    projectCode: 'PJ-2026-003',
    projectName: 'モバイルアプリ開発',
    departmentStableId: 'dept-dev1',
    departmentName: 'システム開発1課',
    status: 'ACTIVE',
    revenueBudget: 45000000,
    revenueProjection: 48000000,
    grossProfitRate: 32.1,
    isWarning: false,
  },
  {
    id: 'pj-004',
    projectCode: 'PJ-2026-004',
    projectName: 'データ分析基盤構築',
    departmentStableId: 'dept-analytics',
    departmentName: 'データ分析課',
    status: 'PLANNED',
    revenueBudget: 60000000,
    revenueProjection: 60000000,
    grossProfitRate: 25.0,
    isWarning: false,
  },
  {
    id: 'pj-005',
    projectCode: 'PJ-2025-012',
    projectName: 'レガシー移行プロジェクト',
    departmentStableId: 'dept-dev2',
    departmentName: 'システム開発2課',
    status: 'ON_HOLD',
    revenueBudget: 120000000,
    revenueProjection: 95000000,
    grossProfitRate: -12.3,
    isWarning: true,
  },
  {
    id: 'pj-006',
    projectCode: 'PJ-2025-008',
    projectName: 'セキュリティ強化対応',
    departmentStableId: 'dept-infra',
    departmentName: 'インフラ課',
    status: 'CLOSED',
    revenueBudget: 35000000,
    revenueProjection: 33500000,
    grossProfitRate: 18.5,
    isWarning: false,
  },
]

const mockDetail: BffProjectDetailResponse = {
  id: 'pj-001',
  projectCode: 'PJ-2026-001',
  projectName: '基幹システム刷新プロジェクト',
  projectNameShort: '基幹刷新PJ',
  departmentStableId: 'dept-dev1',
  departmentName: 'システム開発1課',
  ownerEmployeeId: 'emp-100',
  ownerEmployeeName: '山田 太郎',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  status: 'ACTIVE',
  metrics: {
    revenueBudget: 150000000,
    revenueActual: 85000000,
    revenueForecast: 57000000,
    revenueProjection: 142000000,
    revenueVariance: -8000000,
    cogsBudget: 105000000,
    cogsActual: 62000000,
    cogsForecast: 39500000,
    cogsProjection: 101500000,
    cogsVariance: -3500000,
    grossProfitBudget: 45000000,
    grossProfitActual: 23000000,
    grossProfitForecast: 17500000,
    grossProfitProjection: 40500000,
    grossProfitVariance: -4500000,
    operatingProfitBudget: 38000000,
    operatingProfitActual: 18000000,
    operatingProfitForecast: 14000000,
    operatingProfitProjection: 32000000,
    operatingProfitVariance: -6000000,
  },
  directCostingMetrics: {
    variableCostBudget: 75000000,
    variableCostActual: 45000000,
    variableCostProjection: 72000000,
    marginalProfitBudget: 75000000,
    marginalProfitActual: 40000000,
    marginalProfitProjection: 70000000,
    fixedCostBudget: 30000000,
    fixedCostActual: 17000000,
    fixedCostProjection: 29500000,
    contributionProfitBudget: 45000000,
    contributionProfitActual: 23000000,
    contributionProfitProjection: 40500000,
  },
  kpis: {
    revenueProgressRate: 56.7,
    costConsumptionRate: 59.0,
    grossProfitRate: 28.5,
    marginalProfitRate: 49.3,
  },
  isWarning: false,
  isProjectionNegative: false,
}

const mockMonthlyTrend: BffProjectMonthlyTrendResponse = {
  months: ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'],
  revenue: {
    budget: [12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000, 12500000],
    actual: [11800000, 12200000, 13500000, 14200000, 15800000, 17500000, 0, 0, 0, 0, 0, 0],
    forecast: [0, 0, 0, 0, 0, 0, 10000000, 9500000, 9000000, 9500000, 9500000, 9500000],
  },
  cogs: {
    budget: [8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000, 8750000],
    actual: [8500000, 8800000, 9200000, 10500000, 11200000, 13800000, 0, 0, 0, 0, 0, 0],
    forecast: [0, 0, 0, 0, 0, 0, 7000000, 6500000, 6200000, 6600000, 6600000, 6600000],
  },
  grossProfit: {
    budget: [3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000, 3750000],
    actual: [3300000, 3400000, 4300000, 3700000, 4600000, 3700000, 0, 0, 0, 0, 0, 0],
    forecast: [0, 0, 0, 0, 0, 0, 3000000, 3000000, 2800000, 2900000, 2900000, 2900000],
  },
  operatingProfit: {
    budget: [3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000, 3200000],
    actual: [2800000, 2900000, 3600000, 3100000, 3800000, 2800000, 0, 0, 0, 0, 0, 0],
    forecast: [0, 0, 0, 0, 0, 0, 2500000, 2400000, 2300000, 2400000, 2400000, 2400000],
  },
}

const mockFilters: BffProjectFiltersResponse = {
  departments: [
    { stableId: 'dept-dev1', name: 'システム開発1課' },
    { stableId: 'dept-dev2', name: 'システム開発2課' },
    { stableId: 'dept-analytics', name: 'データ分析課' },
    { stableId: 'dept-infra', name: 'インフラ課' },
  ],
  statuses: [
    { value: 'PLANNED', label: '計画中' },
    { value: 'ACTIVE', label: '進行中' },
    { value: 'ON_HOLD', label: '保留中' },
    { value: 'CLOSED', label: '完了' },
  ],
}

// ============================================================================
// MockBffClient Implementation
// ============================================================================

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async listProjects(request: BffProjectListRequest): Promise<BffProjectListResponse> {
    await this.delay()

    let filtered = [...mockProjects]

    // keyword フィルタ
    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.projectCode.toLowerCase().includes(kw) ||
          p.projectName.toLowerCase().includes(kw)
      )
    }

    // departmentStableId フィルタ
    if (request.departmentStableId) {
      filtered = filtered.filter((p) => p.departmentStableId === request.departmentStableId)
    }

    // status フィルタ
    if (request.status) {
      filtered = filtered.filter((p) => p.status === request.status)
    }

    // ソート
    const sortBy = request.sortBy || 'projectName'
    const sortOrder = request.sortOrder || 'asc'
    filtered.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'projectName') {
        cmp = a.projectName.localeCompare(b.projectName)
      } else if (sortBy === 'departmentName') {
        cmp = a.departmentName.localeCompare(b.departmentName)
      } else if (sortBy === 'revenueBudget') {
        cmp = a.revenueBudget - b.revenueBudget
      } else if (sortBy === 'revenueProjection') {
        cmp = a.revenueProjection - b.revenueProjection
      } else if (sortBy === 'grossProfitRate') {
        cmp = a.grossProfitRate - b.grossProfitRate
      }
      return sortOrder === 'desc' ? -cmp : cmp
    })

    // ページング
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 20, 100)
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return {
      items: paged,
      page,
      pageSize,
      totalCount: filtered.length,
    }
  }

  async getProjectDetail(id: string): Promise<BffProjectDetailResponse> {
    await this.delay()

    const project = mockProjects.find((p) => p.id === id)
    if (!project) {
      throw {
        code: 'PROJECT_NOT_FOUND',
        message: '指定されたプロジェクトが見つかりません',
      }
    }

    // モックでは選択されたプロジェクトの基本情報を反映
    return {
      ...mockDetail,
      id: project.id,
      projectCode: project.projectCode,
      projectName: project.projectName,
      departmentStableId: project.departmentStableId,
      departmentName: project.departmentName,
      status: project.status,
      kpis: {
        ...mockDetail.kpis,
        grossProfitRate: project.grossProfitRate,
      },
      isWarning: project.isWarning,
      isProjectionNegative: project.grossProfitRate < 0,
      // 粗利マイナスの場合は直接原価計算指標も調整
      directCostingMetrics: project.isWarning ? null : mockDetail.directCostingMetrics,
    }
  }

  async getFilters(): Promise<BffProjectFiltersResponse> {
    await this.delay(100)
    return mockFilters
  }

  async getMonthlyTrend(id: string): Promise<BffProjectMonthlyTrendResponse> {
    await this.delay()
    return mockMonthlyTrend
  }
}

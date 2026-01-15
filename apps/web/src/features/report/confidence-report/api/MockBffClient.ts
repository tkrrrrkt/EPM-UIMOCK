import type { BffClient } from "./BffClient"
import type {
  BffConfidenceReportFilters,
  BffConfidenceReportSummaryResponse,
  BffConfidenceStackViewResponse,
  BffConfidenceTrendResponse,
  BffConfidenceOrgComparisonResponse,
  BffConfidenceProjectListRequest,
  BffConfidenceProjectListResponse,
  BffConfidenceOrgTreeResponse,
  BffConfidenceLevelInfo,
} from "@epm/contracts/bff/confidence-report"

const CONFIDENCE_LEVELS: BffConfidenceLevelInfo[] = [
  { code: "S", name: "受注確定", nameShort: "S", probabilityRate: 1.0, colorCode: "hsl(var(--confidence-s))", sortOrder: 1 },
  { code: "A", name: "80%見込", nameShort: "A", probabilityRate: 0.8, colorCode: "hsl(var(--confidence-a))", sortOrder: 2 },
  { code: "B", name: "50%見込", nameShort: "B", probabilityRate: 0.5, colorCode: "hsl(var(--confidence-b))", sortOrder: 3 },
  { code: "C", name: "20%見込", nameShort: "C", probabilityRate: 0.2, colorCode: "hsl(var(--confidence-c))", sortOrder: 4 },
  { code: "D", name: "案件化中", nameShort: "D", probabilityRate: 0.0, colorCode: "hsl(var(--confidence-d))", sortOrder: 5 },
  { code: "Z", name: "目安なし", nameShort: "Z", probabilityRate: 0.0, colorCode: "hsl(var(--confidence-z))", sortOrder: 6 },
]

/**
 * 確度別売上見込レポート Mock BFF Client
 * BFF実装前の開発・テスト用
 */
export class MockBffClient implements BffClient {
  async getSummary(
    _filters: BffConfidenceReportFilters,
    _organizationId?: string
  ): Promise<BffConfidenceReportSummaryResponse> {
    await this.delay()
    return {
      summary: {
        totalForecast: 750000000,
        expectedValue: 468000000,
        highConfidence: 360000000,
        projectCount: 70,
        budget: 500000000,
        previousExpectedValue: 445000000,
      },
      confidenceLevels: CONFIDENCE_LEVELS,
    }
  }

  async getStackView(
    _filters: BffConfidenceReportFilters,
    _organizationId?: string
  ): Promise<BffConfidenceStackViewResponse> {
    await this.delay()
    return {
      stacks: [
        { levelCode: "S", levelName: "受注確定", colorCode: "hsl(var(--confidence-s))", amount: 120000000, count: 12, percentage: 16 },
        { levelCode: "A", levelName: "80%見込", colorCode: "hsl(var(--confidence-a))", amount: 240000000, count: 15, percentage: 32 },
        { levelCode: "B", levelName: "50%見込", colorCode: "hsl(var(--confidence-b))", amount: 180000000, count: 20, percentage: 24 },
        { levelCode: "C", levelName: "20%見込", colorCode: "hsl(var(--confidence-c))", amount: 90000000, count: 10, percentage: 12 },
        { levelCode: "D", levelName: "案件化中", colorCode: "hsl(var(--confidence-d))", amount: 60000000, count: 8, percentage: 8 },
        { levelCode: "Z", levelName: "目安なし", colorCode: "hsl(var(--confidence-z))", amount: 60000000, count: 5, percentage: 8 },
      ],
      totalAmount: 750000000,
      expectedValue: 468000000,
    }
  }

  async getTrend(
    _filters: BffConfidenceReportFilters,
    _organizationId?: string
  ): Promise<BffConfidenceTrendResponse> {
    await this.delay()
    return {
      months: [
        { month: "4月", monthNo: 4, S: 0, A: 50, B: 80, C: 100, D: 120, Z: 400, total: 750, expectedValue: 130 },
        { month: "5月", monthNo: 5, S: 20, A: 80, B: 100, C: 120, D: 100, Z: 350, total: 770, expectedValue: 180 },
        { month: "6月", monthNo: 6, S: 50, A: 100, B: 120, C: 100, D: 80, Z: 300, total: 750, expectedValue: 230 },
        { month: "7月", monthNo: 7, S: 80, A: 120, B: 130, C: 90, D: 70, Z: 250, total: 740, expectedValue: 288 },
        { month: "8月", monthNo: 8, S: 100, A: 150, B: 140, C: 80, D: 60, Z: 200, total: 730, expectedValue: 345 },
        { month: "9月", monthNo: 9, S: 120, A: 180, B: 150, C: 70, D: 50, Z: 150, total: 720, expectedValue: 409 },
        { month: "10月", monthNo: 10, S: 120, A: 240, B: 180, C: 90, D: 60, Z: 60, total: 750, expectedValue: 468 },
      ],
      confidenceLevels: CONFIDENCE_LEVELS,
    }
  }

  async getOrgComparison(
    _filters: BffConfidenceReportFilters,
    _organizationId: string
  ): Promise<BffConfidenceOrgComparisonResponse> {
    await this.delay()
    return {
      organizations: [
        {
          organizationId: "org-1",
          organizationName: "営業本部 合計",
          isSummary: true,
          confidence: {
            S: { amount: 120, count: 12, percentage: 16 },
            A: { amount: 240, count: 15, percentage: 32 },
            B: { amount: 180, count: 20, percentage: 24 },
            C: { amount: 90, count: 10, percentage: 12 },
            D: { amount: 60, count: 8, percentage: 8 },
            Z: { amount: 60, count: 5, percentage: 8 },
          },
          total: 750,
          expectedValue: 468,
          achievementRate: 62.4,
        },
        {
          organizationId: "org-2",
          organizationName: "第一営業部",
          isSummary: false,
          confidence: {
            S: { amount: 80, count: 8, percentage: 20 },
            A: { amount: 160, count: 10, percentage: 40 },
            B: { amount: 80, count: 10, percentage: 20 },
            C: { amount: 40, count: 5, percentage: 10 },
            D: { amount: 20, count: 3, percentage: 5 },
            Z: { amount: 20, count: 2, percentage: 5 },
          },
          total: 400,
          expectedValue: 288,
          achievementRate: 72.0,
        },
        {
          organizationId: "org-3",
          organizationName: "第二営業部",
          isSummary: false,
          confidence: {
            S: { amount: 40, count: 4, percentage: 11 },
            A: { amount: 80, count: 5, percentage: 23 },
            B: { amount: 100, count: 10, percentage: 29 },
            C: { amount: 50, count: 5, percentage: 14 },
            D: { amount: 40, count: 5, percentage: 11 },
            Z: { amount: 40, count: 3, percentage: 11 },
          },
          total: 350,
          expectedValue: 180,
          achievementRate: 51.4,
        },
      ],
      confidenceLevels: CONFIDENCE_LEVELS,
    }
  }

  async getProjectList(request: BffConfidenceProjectListRequest): Promise<BffConfidenceProjectListResponse> {
    await this.delay()
    const page = request.page ?? 1
    const pageSize = request.pageSize ?? 10

    const allProjects = [
      { projectId: "p1", projectCode: "PRJ-001", projectName: "大手製造業向けERP導入", organizationName: "第一営業部", ownerName: "田中太郎", confidenceLevelCode: "S", confidenceLevelName: "受注確定", amount: 50000000, expectedAmount: 50000000, colorCode: "hsl(var(--confidence-s))" },
      { projectId: "p2", projectCode: "PRJ-002", projectName: "金融系基盤刷新プロジェクト", organizationName: "第一営業部", ownerName: "鈴木花子", confidenceLevelCode: "A", confidenceLevelName: "80%見込", amount: 80000000, expectedAmount: 64000000, colorCode: "hsl(var(--confidence-a))" },
      { projectId: "p3", projectCode: "PRJ-003", projectName: "小売業DX推進支援", organizationName: "第二営業部", ownerName: "佐藤一郎", confidenceLevelCode: "B", confidenceLevelName: "50%見込", amount: 30000000, expectedAmount: 15000000, colorCode: "hsl(var(--confidence-b))" },
      { projectId: "p4", projectCode: "PRJ-004", projectName: "物流システム最適化", organizationName: "第一営業部", ownerName: "田中太郎", confidenceLevelCode: "A", confidenceLevelName: "80%見込", amount: 45000000, expectedAmount: 36000000, colorCode: "hsl(var(--confidence-a))" },
      { projectId: "p5", projectCode: "PRJ-005", projectName: "医療機関向けクラウド移行", organizationName: "第二営業部", ownerName: "鈴木花子", confidenceLevelCode: "C", confidenceLevelName: "20%見込", amount: 60000000, expectedAmount: 12000000, colorCode: "hsl(var(--confidence-c))" },
    ]

    return {
      projects: allProjects.slice((page - 1) * pageSize, page * pageSize),
      totalCount: allProjects.length,
      page,
      pageSize,
    }
  }

  async getOrgTree(): Promise<BffConfidenceOrgTreeResponse> {
    await this.delay()
    return {
      nodes: [
        {
          id: "all",
          name: "全社",
          level: 0,
          hasChildren: true,
          children: [
            {
              id: "sales",
              name: "営業本部",
              level: 1,
              hasChildren: true,
              children: [
                { id: "sales-1", name: "第一営業部", level: 2, hasChildren: false },
                { id: "sales-2", name: "第二営業部", level: 2, hasChildren: false },
              ],
            },
            {
              id: "dev",
              name: "開発本部",
              level: 1,
              hasChildren: true,
              children: [
                { id: "dev-1", name: "開発一部", level: 2, hasChildren: false },
                { id: "dev-2", name: "開発二部", level: 2, hasChildren: false },
              ],
            },
          ],
        },
      ],
    }
  }

  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

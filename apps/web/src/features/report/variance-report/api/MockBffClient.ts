import type { BffClient } from "./BffClient"
import type {
  BffVarianceReportFilters,
  BffVarianceWaterfallResponse,
  BffVarianceAccountDetailResponse,
  BffVarianceOrganizationDetailResponse,
  BffVarianceOrgTreeResponse,
  BffVarianceReportSummaryResponse,
  BffVarianceWaterfallItem,
  BffVarianceAccountRow,
  BffVarianceOrganizationRow,
  BffVarianceOrgNode,
} from "@epm/contracts/bff/variance-report"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockAccountWaterfall: BffVarianceWaterfallItem[] = [
  { subjectId: "1", subjectCode: "1000", subjectName: "売上差異", variance: 500, profitImpact: 500, isPositive: true, hasChildren: false, sortOrder: 1, indentLevel: 0 },
  { subjectId: "2", subjectCode: "2000", subjectName: "売上原価差異", variance: -300, profitImpact: -300, isPositive: false, hasChildren: false, sortOrder: 2, indentLevel: 0 },
  { subjectId: "3", subjectCode: "3000", subjectName: "販売費差異", variance: -150, profitImpact: -150, isPositive: false, hasChildren: false, sortOrder: 3, indentLevel: 0 },
  { subjectId: "4", subjectCode: "4000", subjectName: "一般管理費差異", variance: -100, profitImpact: -100, isPositive: false, hasChildren: false, sortOrder: 4, indentLevel: 0 },
  { subjectId: "5", subjectCode: "5000", subjectName: "営業外収益差異", variance: 80, profitImpact: 80, isPositive: true, hasChildren: false, sortOrder: 5, indentLevel: 0 },
  { subjectId: "6", subjectCode: "6000", subjectName: "営業外費用差異", variance: -30, profitImpact: -30, isPositive: false, hasChildren: false, sortOrder: 6, indentLevel: 0 },
]

const mockAccountDetails: BffVarianceAccountRow[] = [
  { subjectId: "1", subjectCode: "1000", subjectName: "売上", indentLevel: 0, budget: 15000, actual: 15500, variance: 500, varianceRate: 3.3, isPositive: true },
  { subjectId: "2", subjectCode: "2000", subjectName: "売上原価", indentLevel: 0, budget: -8000, actual: -8300, variance: -300, varianceRate: 3.8, isPositive: false },
  { subjectId: "3", subjectCode: "3000", subjectName: "売上総利益", indentLevel: 0, budget: 7000, actual: 7200, variance: 200, varianceRate: 2.9, isPositive: true },
  { subjectId: "4", subjectCode: "4000", subjectName: "販売費", indentLevel: 0, budget: -3500, actual: -3650, variance: -150, varianceRate: 4.3, isPositive: false },
  { subjectId: "5", subjectCode: "5000", subjectName: "一般管理費", indentLevel: 0, budget: -2000, actual: -2100, variance: -100, varianceRate: 5.0, isPositive: false },
  { subjectId: "6", subjectCode: "6000", subjectName: "営業利益", indentLevel: 0, budget: 1500, actual: 1450, variance: -50, varianceRate: -3.3, isPositive: false },
  { subjectId: "7", subjectCode: "7000", subjectName: "営業外収益", indentLevel: 0, budget: 200, actual: 280, variance: 80, varianceRate: 40.0, isPositive: true },
  { subjectId: "8", subjectCode: "8000", subjectName: "営業外費用", indentLevel: 0, budget: -100, actual: -130, variance: -30, varianceRate: 30.0, isPositive: false },
  { subjectId: "9", subjectCode: "9000", subjectName: "経常利益", indentLevel: 0, budget: 1600, actual: 1600, variance: 0, varianceRate: 0.0, isPositive: true },
]

const mockOrgDetails: BffVarianceOrganizationRow[] = [
  { organizationId: "1", organizationCode: "SALES", organizationName: "営業本部", indentLevel: 0, budget: 8000, actual: 8350, variance: 350, varianceRate: 4.4, isPositive: true },
  { organizationId: "1-1", organizationCode: "SALES1", organizationName: "第一営業部", indentLevel: 1, budget: 4500, actual: 4700, variance: 200, varianceRate: 4.4, isPositive: true },
  { organizationId: "1-2", organizationCode: "SALES2", organizationName: "第二営業部", indentLevel: 1, budget: 3500, actual: 3650, variance: 150, varianceRate: 4.3, isPositive: true },
  { organizationId: "2", organizationCode: "DEV", organizationName: "開発本部", indentLevel: 0, budget: 2500, actual: 2300, variance: -200, varianceRate: -8.0, isPositive: false },
  { organizationId: "2-1", organizationCode: "DEV1", organizationName: "開発一部", indentLevel: 1, budget: 1500, actual: 1350, variance: -150, varianceRate: -10.0, isPositive: false },
  { organizationId: "2-2", organizationCode: "DEV2", organizationName: "開発二部", indentLevel: 1, budget: 1000, actual: 950, variance: -50, varianceRate: -5.0, isPositive: false },
  { organizationId: "3", organizationCode: "ADMIN", organizationName: "管理本部", indentLevel: 0, budget: 1500, actual: 1400, variance: -100, varianceRate: -6.7, isPositive: false },
  { organizationId: "4", organizationCode: "OTHER", organizationName: "その他", indentLevel: 0, budget: 0, actual: -50, variance: -50, varianceRate: 0, isPositive: false },
]

const mockOrgTree: BffVarianceOrgNode[] = [
  {
    id: "corp",
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
      { id: "admin", name: "管理本部", level: 1, hasChildren: false },
    ],
  },
]

export class MockBffClient implements BffClient {
  async getSummary(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceReportSummaryResponse> {
    await delay(300)
    return {
      summary: {
        budget: 12000,
        actual: 12000,
        variance: 0,
        varianceRate: 0,
        isPositive: true,
      },
      targetSubjectName: "営業利益",
    }
  }

  async getWaterfallData(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceWaterfallResponse> {
    await delay(500)
    return {
      startValue: 12000,
      endValue: 12000,
      items: mockAccountWaterfall,
      totalVariance: 0,
      breadcrumbs: [],
    }
  }

  async getAccountDetail(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceAccountDetailResponse> {
    await delay(400)
    return { rows: mockAccountDetails }
  }

  async getOrganizationDetail(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceOrganizationDetailResponse> {
    await delay(400)
    return { rows: mockOrgDetails }
  }

  async getOrgTree(): Promise<BffVarianceOrgTreeResponse> {
    await delay(300)
    return { nodes: mockOrgTree }
  }
}

import type { BffClient } from "./BffClient"
import type {
  BffScenarioReportFilters,
  BffScenarioReportSummaryResponse,
  BffScenarioComparisonResponse,
  BffScenarioDetailTableResponse,
  BffScenarioOrgTreeResponse,
  BffScenarioDetailRow,
  BffScenarioOrgNode,
  BffScenarioComparisonMonth,
} from "@epm/contracts/bff/scenario-report"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockOrgTree: BffScenarioOrgNode[] = [
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

const mockDetailRows: BffScenarioDetailRow[] = [
  { periodNo: 4, periodLabel: "4月", worst: 850, normal: 900, best: 950, budget: 900, isWnbEnabled: true, worstVsNormal: -50, bestVsNormal: 50 },
  { periodNo: 5, periodLabel: "5月", worst: 900, normal: 950, best: 1000, budget: 950, isWnbEnabled: true, worstVsNormal: -50, bestVsNormal: 50 },
  { periodNo: 6, periodLabel: "6月", worst: 880, normal: 980, best: 1050, budget: 1000, isWnbEnabled: true, worstVsNormal: -100, bestVsNormal: 70 },
  { periodNo: 7, periodLabel: "7月", worst: 920, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true, worstVsNormal: -80, bestVsNormal: 100 },
  { periodNo: 8, periodLabel: "8月", worst: 870, normal: 950, best: 1020, budget: 950, isWnbEnabled: true, worstVsNormal: -80, bestVsNormal: 70 },
  { periodNo: 9, periodLabel: "9月", worst: 890, normal: 980, best: 1080, budget: 1000, isWnbEnabled: true, worstVsNormal: -90, bestVsNormal: 100 },
  { periodNo: 10, periodLabel: "10月", worst: 910, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true, worstVsNormal: -90, bestVsNormal: 100 },
  { periodNo: 11, periodLabel: "11月", worst: 880, normal: 950, best: 1020, budget: 1000, isWnbEnabled: true, worstVsNormal: -70, bestVsNormal: 70 },
  { periodNo: 12, periodLabel: "12月", worst: 920, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true, worstVsNormal: -80, bestVsNormal: 100 },
  { periodNo: 1, periodLabel: "1月", worst: 900, normal: 980, best: 1080, budget: 1000, isWnbEnabled: true, worstVsNormal: -80, bestVsNormal: 100 },
  { periodNo: 2, periodLabel: "2月", worst: 890, normal: 950, best: 1000, budget: 950, isWnbEnabled: true, worstVsNormal: -60, bestVsNormal: 50 },
  { periodNo: 3, periodLabel: "3月", worst: 880, normal: 920, best: 980, budget: 950, isWnbEnabled: true, worstVsNormal: -40, bestVsNormal: 60 },
]

const mockComparisonMonths: BffScenarioComparisonMonth[] = [
  { month: "4月", monthNo: 4, worst: 850, normal: 900, best: 950, budget: 900, isWnbEnabled: true },
  { month: "5月", monthNo: 5, worst: 900, normal: 950, best: 1000, budget: 950, isWnbEnabled: true },
  { month: "6月", monthNo: 6, worst: 880, normal: 980, best: 1050, budget: 1000, isWnbEnabled: true },
  { month: "7月", monthNo: 7, worst: 920, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true },
  { month: "8月", monthNo: 8, worst: 870, normal: 950, best: 1020, budget: 950, isWnbEnabled: true },
  { month: "9月", monthNo: 9, worst: 890, normal: 980, best: 1080, budget: 1000, isWnbEnabled: true },
  { month: "10月", monthNo: 10, worst: 910, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true },
  { month: "11月", monthNo: 11, worst: 880, normal: 950, best: 1020, budget: 1000, isWnbEnabled: true },
  { month: "12月", monthNo: 12, worst: 920, normal: 1000, best: 1100, budget: 1000, isWnbEnabled: true },
  { month: "1月", monthNo: 1, worst: 900, normal: 980, best: 1080, budget: 1000, isWnbEnabled: true },
  { month: "2月", monthNo: 2, worst: 890, normal: 950, best: 1000, budget: 950, isWnbEnabled: true },
  { month: "3月", monthNo: 3, worst: 880, normal: 920, best: 980, budget: 950, isWnbEnabled: true },
]

export class MockBffClient implements BffClient {
  async getSummary(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioReportSummaryResponse> {
    await delay(400)
    return {
      summary: {
        worst: 10800,
        normal: 12000,
        best: 13200,
        budget: 12000,
        range: 2400,
        rangeRate: 20.0,
      },
      targetSubjectName: "営業利益",
      worstVsBudgetRate: 90.0,
      normalVsBudgetRate: 100.0,
      bestVsBudgetRate: 110.0,
    }
  }

  async getComparison(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioComparisonResponse> {
    await delay(500)
    return {
      months: mockComparisonMonths,
      annualSummary: {
        worst: 10800,
        normal: 12000,
        best: 13200,
        budget: 12000,
      },
      wnbStartMonth: 4,
    }
  }

  async getDetail(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioDetailTableResponse> {
    await delay(400)
    return {
      rows: mockDetailRows,
      annualSummary: {
        worst: 10800,
        normal: 12000,
        best: 13200,
        budget: 12000,
      },
    }
  }

  async getOrgTree(): Promise<BffScenarioOrgTreeResponse> {
    await delay(300)
    return { nodes: mockOrgTree }
  }
}

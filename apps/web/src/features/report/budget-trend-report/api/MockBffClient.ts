import type { BffClient } from "./BffClient"
import type {
  BffBudgetTrendFilters,
  BffBudgetTrendSummaryResponse,
  BffBudgetConsumptionChartResponse,
  BffBudgetYearComparisonResponse,
  BffBudgetLandingForecastResponse,
  BffBudgetOrgBreakdownResponse,
  BffBudgetTrendOrgTreeResponse,
} from "@epm/contracts/bff/budget-trend-report"

/**
 * 予算消化推移レポート Mock BFF Client
 */
export class MockBffClient implements BffClient {
  async getSummary(
    _filters: BffBudgetTrendFilters,
    _organizationId?: string
  ): Promise<BffBudgetTrendSummaryResponse> {
    await this.delay()
    return {
      summary: {
        annualBudget: 12000,
        ytdActual: 6850,
        ytdBudget: 6667,
        consumptionRate: 68.5,
        planConsumptionRate: 66.7,
        variance: 183,
        varianceRate: 2.7,
        landingForecast: 11800,
        landingVariance: -200,
        priorYearActual: 11500,
        priorYearVariance: 300,
        priorYearVarianceRate: 2.6,
      },
      currentMonth: 11,
      closedMonths: [4, 5, 6, 7, 8, 9, 10],
    }
  }

  async getConsumptionChart(
    _filters: BffBudgetTrendFilters,
    _organizationId?: string
  ): Promise<BffBudgetConsumptionChartResponse> {
    await this.delay()
    return {
      months: [
        { month: "4月", monthNo: 4, budget: 1000, actual: 820, consumed: 820, actualRate: 8.2, planRate: 8.3, varianceRate: -0.1 },
        { month: "5月", monthNo: 5, budget: 2000, actual: 1650, consumed: 1650, actualRate: 16.5, planRate: 16.7, varianceRate: -0.2 },
        { month: "6月", monthNo: 6, budget: 3000, actual: 2580, consumed: 2580, actualRate: 25.8, planRate: 25.0, varianceRate: 0.8 },
        { month: "7月", monthNo: 7, budget: 4000, actual: 3420, consumed: 3420, actualRate: 34.2, planRate: 33.3, varianceRate: 0.9 },
        { month: "8月", monthNo: 8, budget: 5000, actual: 4350, consumed: 4350, actualRate: 43.5, planRate: 41.7, varianceRate: 1.8 },
        { month: "9月", monthNo: 9, budget: 6000, actual: 5280, consumed: 5280, actualRate: 52.8, planRate: 50.0, varianceRate: 2.8 },
        { month: "10月", monthNo: 10, budget: 7000, actual: 6150, consumed: 6150, actualRate: 61.5, planRate: 58.3, varianceRate: 3.2 },
        { month: "11月", monthNo: 11, budget: 8000, actual: 6850, consumed: 6850, actualRate: 68.5, planRate: 66.7, varianceRate: 1.8 },
        { month: "12月", monthNo: 12, budget: 9000, actual: null, consumed: null, actualRate: null, planRate: 75.0, varianceRate: null },
        { month: "1月", monthNo: 1, budget: 10000, actual: null, consumed: null, actualRate: null, planRate: 83.3, varianceRate: null },
        { month: "2月", monthNo: 2, budget: 11000, actual: null, consumed: null, actualRate: null, planRate: 91.7, varianceRate: null },
        { month: "3月", monthNo: 3, budget: 12000, actual: null, consumed: null, actualRate: null, planRate: 100.0, varianceRate: null },
      ],
      annualBudget: 12000,
    }
  }

  async getYearComparison(
    _filters: BffBudgetTrendFilters,
    _organizationId?: string
  ): Promise<BffBudgetYearComparisonResponse> {
    await this.delay()
    return {
      months: [
        { month: "4月", monthNo: 4, currentYear: 820, priorYear: 750, variance: 70, varianceRate: 9.3 },
        { month: "5月", monthNo: 5, currentYear: 830, priorYear: 780, variance: 50, varianceRate: 6.4 },
        { month: "6月", monthNo: 6, currentYear: 930, priorYear: 850, variance: 80, varianceRate: 9.4 },
        { month: "7月", monthNo: 7, currentYear: 840, priorYear: 900, variance: -60, varianceRate: -6.7 },
        { month: "8月", monthNo: 8, currentYear: 930, priorYear: 880, variance: 50, varianceRate: 5.7 },
        { month: "9月", monthNo: 9, currentYear: 930, priorYear: 920, variance: 10, varianceRate: 1.1 },
        { month: "10月", monthNo: 10, currentYear: 870, priorYear: 950, variance: -80, varianceRate: -8.4 },
        { month: "11月", monthNo: 11, currentYear: 700, priorYear: 850, variance: -150, varianceRate: -17.6 },
        { month: "12月", monthNo: 12, currentYear: null, priorYear: 920, variance: null, varianceRate: null },
        { month: "1月", monthNo: 1, currentYear: null, priorYear: 980, variance: null, varianceRate: null },
        { month: "2月", monthNo: 2, currentYear: null, priorYear: 900, variance: null, varianceRate: null },
        { month: "3月", monthNo: 3, currentYear: null, priorYear: 820, variance: null, varianceRate: null },
      ],
      ytdCurrentYear: 6850,
      ytdPriorYear: 6880,
      ytdVariance: -30,
      ytdVarianceRate: -0.4,
    }
  }

  async getLandingForecast(
    _filters: BffBudgetTrendFilters,
    _organizationId?: string
  ): Promise<BffBudgetLandingForecastResponse> {
    await this.delay()
    return {
      forecast: {
        annualBudget: 12000,
        ytdActual: 6850,
        remainingForecast: 4950,
        landingForecast: 11800,
        achievementRate: 98.3,
        priorYearActual: 11500,
        priorYearVariance: 300,
        priorYearVarianceRate: 2.6,
      },
    }
  }

  async getOrgBreakdown(
    _filters: BffBudgetTrendFilters,
    _organizationId: string
  ): Promise<BffBudgetOrgBreakdownResponse> {
    await this.delay()
    return {
      organizations: [
        { organizationId: "all", organizationName: "全社 合計", isSummary: true, budget: 12000, actual: 6850, consumptionRate: 57.1, variance: 183, varianceRate: 2.7, priorYearActual: 6880, priorYearVariance: -30 },
        { organizationId: "sales", organizationName: "営業本部", isSummary: false, budget: 8000, actual: 4800, consumptionRate: 60.0, variance: 300, varianceRate: 6.7, priorYearActual: 4500, priorYearVariance: 300 },
        { organizationId: "dev", organizationName: "開発本部", isSummary: false, budget: 2500, actual: 1400, consumptionRate: 56.0, variance: -100, varianceRate: -6.7, priorYearActual: 1600, priorYearVariance: -200 },
        { organizationId: "admin", organizationName: "管理本部", isSummary: false, budget: 1500, actual: 650, consumptionRate: 43.3, variance: -17, varianceRate: -2.5, priorYearActual: 780, priorYearVariance: -130 },
      ],
    }
  }

  async getOrgTree(): Promise<BffBudgetTrendOrgTreeResponse> {
    await this.delay()
    return {
      nodes: [
        {
          id: "all",
          name: "全社",
          level: 0,
          hasChildren: true,
          children: [
            { id: "sales", name: "営業本部", level: 1, hasChildren: false },
            { id: "dev", name: "開発本部", level: 1, hasChildren: false },
            { id: "admin", name: "管理本部", level: 1, hasChildren: false },
          ],
        },
      ],
    }
  }

  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

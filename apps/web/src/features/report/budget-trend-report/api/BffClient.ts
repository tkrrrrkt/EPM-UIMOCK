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
 * 予算消化推移レポート BFF Client Interface
 */
export interface BffClient {
  /** サマリー取得 */
  getSummary(
    filters: BffBudgetTrendFilters,
    organizationId?: string
  ): Promise<BffBudgetTrendSummaryResponse>

  /** 消化率推移チャート取得 */
  getConsumptionChart(
    filters: BffBudgetTrendFilters,
    organizationId?: string
  ): Promise<BffBudgetConsumptionChartResponse>

  /** 前年比較取得 */
  getYearComparison(
    filters: BffBudgetTrendFilters,
    organizationId?: string
  ): Promise<BffBudgetYearComparisonResponse>

  /** 着地予測取得 */
  getLandingForecast(
    filters: BffBudgetTrendFilters,
    organizationId?: string
  ): Promise<BffBudgetLandingForecastResponse>

  /** 組織別内訳取得 */
  getOrgBreakdown(
    filters: BffBudgetTrendFilters,
    organizationId: string
  ): Promise<BffBudgetOrgBreakdownResponse>

  /** 組織ツリー取得 */
  getOrgTree(): Promise<BffBudgetTrendOrgTreeResponse>
}

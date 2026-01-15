import type {
  BffScenarioReportFilters,
  BffScenarioReportSummaryResponse,
  BffScenarioComparisonResponse,
  BffScenarioDetailTableResponse,
  BffScenarioOrgTreeResponse,
} from "@epm/contracts/bff/scenario-report"

/**
 * シナリオ分析レポート BFF Client Interface
 */
export interface BffClient {
  /** サマリー取得 */
  getSummary(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioReportSummaryResponse>

  /** 3シナリオ比較チャートデータ取得 */
  getComparison(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioComparisonResponse>

  /** 詳細テーブルデータ取得 */
  getDetail(
    filters: BffScenarioReportFilters,
    organizationId?: string
  ): Promise<BffScenarioDetailTableResponse>

  /** 組織ツリー取得 */
  getOrgTree(): Promise<BffScenarioOrgTreeResponse>
}

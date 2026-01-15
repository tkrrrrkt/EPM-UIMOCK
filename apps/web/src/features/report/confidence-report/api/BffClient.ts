import type {
  BffConfidenceReportFilters,
  BffConfidenceReportSummaryResponse,
  BffConfidenceStackViewResponse,
  BffConfidenceTrendResponse,
  BffConfidenceOrgComparisonResponse,
  BffConfidenceProjectListRequest,
  BffConfidenceProjectListResponse,
  BffConfidenceOrgTreeResponse,
} from "@epm/contracts/bff/confidence-report"

/**
 * 確度別売上見込レポート BFF Client Interface
 */
export interface BffClient {
  /** サマリー取得 */
  getSummary(
    filters: BffConfidenceReportFilters,
    organizationId?: string
  ): Promise<BffConfidenceReportSummaryResponse>

  /** 確度別積み上げビュー取得 */
  getStackView(
    filters: BffConfidenceReportFilters,
    organizationId?: string
  ): Promise<BffConfidenceStackViewResponse>

  /** 推移グラフ取得 */
  getTrend(
    filters: BffConfidenceReportFilters,
    organizationId?: string
  ): Promise<BffConfidenceTrendResponse>

  /** 組織別比較取得 */
  getOrgComparison(
    filters: BffConfidenceReportFilters,
    organizationId: string
  ): Promise<BffConfidenceOrgComparisonResponse>

  /** 案件一覧取得 */
  getProjectList(request: BffConfidenceProjectListRequest): Promise<BffConfidenceProjectListResponse>

  /** 組織ツリー取得 */
  getOrgTree(): Promise<BffConfidenceOrgTreeResponse>
}

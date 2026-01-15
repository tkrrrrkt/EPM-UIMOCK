import type {
  BffVarianceReportFilters,
  BffVarianceWaterfallResponse,
  BffVarianceAccountDetailResponse,
  BffVarianceOrganizationDetailResponse,
  BffVarianceOrgTreeResponse,
  BffVarianceReportSummaryResponse,
  VarianceBreakdownType,
} from "@epm/contracts/bff/variance-report"

/**
 * 差異分析レポート BFF Client Interface
 */
export interface BffClient {
  /** サマリー取得 */
  getSummary(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceReportSummaryResponse>

  /** ウォーターフォールチャートデータ取得 */
  getWaterfallData(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceWaterfallResponse>

  /** 科目別詳細テーブルデータ取得 */
  getAccountDetail(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceAccountDetailResponse>

  /** 組織別詳細テーブルデータ取得 */
  getOrganizationDetail(
    filters: BffVarianceReportFilters,
    organizationId?: string
  ): Promise<BffVarianceOrganizationDetailResponse>

  /** 組織ツリー取得 */
  getOrgTree(): Promise<BffVarianceOrgTreeResponse>
}

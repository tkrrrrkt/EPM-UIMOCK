// ============================================================
// BffClient Interface - Abstract interface for BFF communication
// ============================================================

import type {
  BffSelectorOptionsRequest,
  BffSelectorOptionsResponse,
  BffIndicatorReportDataRequest,
  BffIndicatorReportDataResponse,
  BffIndicatorReportLayoutResponse,
} from "@epm/contracts/bff/indicator-report"

export interface BffClient {
  /**
   * レイアウト情報を取得
   */
  getLayout(): Promise<BffIndicatorReportLayoutResponse | null>

  /**
   * 選択肢（年度、イベント、バージョン、部門）を取得
   */
  getSelectorOptions(
    request: BffSelectorOptionsRequest
  ): Promise<BffSelectorOptionsResponse>

  /**
   * レポートデータを取得
   */
  getReportData(
    request: BffIndicatorReportDataRequest
  ): Promise<BffIndicatorReportDataResponse>
}

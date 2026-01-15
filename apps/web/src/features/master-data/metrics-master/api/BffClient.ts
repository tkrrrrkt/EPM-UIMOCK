import type {
  BffListMetricsRequest,
  BffListMetricsResponse,
  BffMetricDetailResponse,
  BffCreateMetricRequest,
  BffUpdateMetricRequest,
} from "@epm/contracts/bff/metrics-master"

/**
 * 指標マスタ BFF Client Interface
 * SSoT: .kiro/specs/master-data/metrics-master/design.md
 */
export interface BffClient {
  /**
   * 指標一覧取得
   * design.md: GET /api/bff/metrics
   */
  listMetrics(request: BffListMetricsRequest): Promise<BffListMetricsResponse>

  /**
   * 指標詳細取得
   * design.md: GET /api/bff/metrics/:id
   */
  getMetricById(metricId: string): Promise<BffMetricDetailResponse | null>

  /**
   * 指標新規登録
   * design.md: POST /api/bff/metrics
   */
  createMetric(data: BffCreateMetricRequest): Promise<BffMetricDetailResponse>

  /**
   * 指標更新
   * design.md: PATCH /api/bff/metrics/:id
   */
  updateMetric(metricId: string, data: BffUpdateMetricRequest): Promise<BffMetricDetailResponse>

  /**
   * 指標無効化
   * design.md: POST /api/bff/metrics/:id/deactivate
   */
  deactivateMetric(metricId: string): Promise<BffMetricDetailResponse>

  /**
   * 指標再有効化
   * design.md: POST /api/bff/metrics/:id/reactivate
   */
  reactivateMetric(metricId: string): Promise<BffMetricDetailResponse>
}

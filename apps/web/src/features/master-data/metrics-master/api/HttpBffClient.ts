import type { BffClient } from "./BffClient"
import type {
  BffListMetricsRequest,
  BffListMetricsResponse,
  BffMetricDetailResponse,
  BffCreateMetricRequest,
  BffUpdateMetricRequest,
} from "@epm/contracts/bff/metrics-master"

/**
 * 指標マスタ HTTP BFF Client
 * SSoT: .kiro/specs/master-data/metrics-master/design.md
 */
export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/metrics") {
    this.baseUrl = baseUrl
  }

  /**
   * 指標一覧取得
   * design.md: GET /api/bff/metrics
   */
  async listMetrics(request: BffListMetricsRequest): Promise<BffListMetricsResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.append("keyword", request.keyword)
    if (request.metricType) params.append("metricType", request.metricType)
    if (request.isActive !== undefined) params.append("isActive", String(request.isActive))
    if (request.page) params.append("page", String(request.page))
    if (request.pageSize) params.append("pageSize", String(request.pageSize))
    if (request.sortBy) params.append("sortBy", request.sortBy)
    if (request.sortOrder) params.append("sortOrder", request.sortOrder)

    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の検索に失敗しました")
    }
    return response.json()
  }

  /**
   * 指標詳細取得
   * design.md: GET /api/bff/metrics/:id
   */
  async getMetricById(metricId: string): Promise<BffMetricDetailResponse | null> {
    const response = await fetch(`${this.baseUrl}/${metricId}`)
    if (response.status === 404) return null
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の取得に失敗しました")
    }
    return response.json()
  }

  /**
   * 指標新規登録
   * design.md: POST /api/bff/metrics
   */
  async createMetric(data: BffCreateMetricRequest): Promise<BffMetricDetailResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の登録に失敗しました")
    }
    return response.json()
  }

  /**
   * 指標更新
   * design.md: PATCH /api/bff/metrics/:id
   */
  async updateMetric(metricId: string, data: BffUpdateMetricRequest): Promise<BffMetricDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${metricId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の更新に失敗しました")
    }
    return response.json()
  }

  /**
   * 指標無効化
   * design.md: POST /api/bff/metrics/:id/deactivate
   */
  async deactivateMetric(metricId: string): Promise<BffMetricDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${metricId}/deactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の無効化に失敗しました")
    }
    return response.json()
  }

  /**
   * 指標再有効化
   * design.md: POST /api/bff/metrics/:id/reactivate
   */
  async reactivateMetric(metricId: string): Promise<BffMetricDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${metricId}/reactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "指標の再有効化に失敗しました")
    }
    return response.json()
  }
}

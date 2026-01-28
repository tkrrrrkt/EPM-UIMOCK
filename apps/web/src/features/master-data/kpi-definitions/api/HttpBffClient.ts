import type { BffClient } from "./BffClient"
import type {
  BffListKpiDefinitionsRequest,
  BffListKpiDefinitionsResponse,
  BffKpiDefinitionDetailResponse,
  BffCreateKpiDefinitionRequest,
  BffUpdateKpiDefinitionRequest,
} from "@epm/contracts/bff/kpi-definitions"

/**
 * KPI定義マスタ HTTP BFF Client
 * SSoT: .kiro/specs/master-data/kpi-definitions/design.md
 */
export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/master-data/kpi-definitions") {
    this.baseUrl = baseUrl
  }

  /**
   * KPI定義一覧取得
   * design.md: GET /api/bff/master-data/kpi-definitions
   */
  async listKpiDefinitions(request: BffListKpiDefinitionsRequest): Promise<BffListKpiDefinitionsResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.append("keyword", request.keyword)
    if (request.aggregationMethod) params.append("aggregationMethod", request.aggregationMethod)
    if (request.isActive !== undefined) params.append("isActive", String(request.isActive))
    if (request.page) params.append("page", String(request.page))
    if (request.pageSize) params.append("pageSize", String(request.pageSize))
    if (request.sortBy) params.append("sortBy", request.sortBy)
    if (request.sortOrder) params.append("sortOrder", request.sortOrder)

    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の検索に失敗しました")
    }
    return response.json()
  }

  /**
   * KPI定義詳細取得
   * design.md: GET /api/bff/master-data/kpi-definitions/:id
   */
  async getKpiDefinitionById(id: string): Promise<BffKpiDefinitionDetailResponse | null> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (response.status === 404) return null
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の取得に失敗しました")
    }
    return response.json()
  }

  /**
   * KPI定義新規登録
   * design.md: POST /api/bff/master-data/kpi-definitions
   */
  async createKpiDefinition(data: BffCreateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の登録に失敗しました")
    }
    return response.json()
  }

  /**
   * KPI定義更新
   * design.md: PATCH /api/bff/master-data/kpi-definitions/:id
   */
  async updateKpiDefinition(id: string, data: BffUpdateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の更新に失敗しました")
    }
    return response.json()
  }

  /**
   * KPI定義無効化
   * design.md: POST /api/bff/master-data/kpi-definitions/:id/deactivate
   */
  async deactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の無効化に失敗しました")
    }
    return response.json()
  }

  /**
   * KPI定義再有効化
   * design.md: POST /api/bff/master-data/kpi-definitions/:id/reactivate
   */
  async reactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/reactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "KPI定義の再有効化に失敗しました")
    }
    return response.json()
  }
}

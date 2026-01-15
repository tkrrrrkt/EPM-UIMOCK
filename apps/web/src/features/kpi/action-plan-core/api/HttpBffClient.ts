import type {
  BffClient,
  BffListPlansRequest,
  BffListPlansResponse,
  BffPlanDetailResponse,
  BffCreatePlanRequest,
  BffUpdatePlanRequest,
  BffKpiSubjectsResponse,
} from "@epm/contracts/bff/action-plan-core"

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/action-plan") {
    this.baseUrl = baseUrl
  }

  async listPlans(request: BffListPlansRequest): Promise<BffListPlansResponse> {
    const params = new URLSearchParams()
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))
    if (request.sortBy) params.set("sortBy", request.sortBy)
    if (request.sortOrder) params.set("sortOrder", request.sortOrder)
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.status) params.set("status", request.status)
    if (request.priority) params.set("priority", request.priority)

    const response = await fetch(`${this.baseUrl}/plans?${params}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async getPlanDetail(id: string): Promise<BffPlanDetailResponse> {
    const response = await fetch(`${this.baseUrl}/plans/${id}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async createPlan(request: BffCreatePlanRequest): Promise<BffPlanDetailResponse> {
    const response = await fetch(`${this.baseUrl}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async updatePlan(id: string, request: BffUpdatePlanRequest): Promise<BffPlanDetailResponse> {
    const response = await fetch(`${this.baseUrl}/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async deletePlan(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/plans/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async getKpiSubjects(): Promise<BffKpiSubjectsResponse> {
    const response = await fetch(`${this.baseUrl}/kpi-subjects`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }
}

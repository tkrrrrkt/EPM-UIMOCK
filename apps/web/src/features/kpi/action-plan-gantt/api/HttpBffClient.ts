import type {
  BffClient,
  BffGanttData,
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  BffWbsResponse,
  BffNextWbsCodeResponse,
} from "@epm/contracts/bff/action-plan-gantt"

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/action-plan/gantt") {
    this.baseUrl = baseUrl
  }

  async getGanttData(planId: string): Promise<BffGanttData> {
    const response = await fetch(`${this.baseUrl}/${planId}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async createWbs(request: BffCreateWbsRequest): Promise<BffWbsResponse> {
    const response = await fetch(`${this.baseUrl}/wbs`, {
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

  async updateWbs(id: string, request: BffUpdateWbsRequest): Promise<BffWbsResponse> {
    const response = await fetch(`${this.baseUrl}/wbs/${id}`, {
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

  async updateWbsSchedule(id: string, request: BffUpdateWbsScheduleRequest): Promise<BffWbsResponse> {
    const response = await fetch(`${this.baseUrl}/wbs/${id}/schedule`, {
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

  async updateWbsProgress(id: string, request: BffUpdateWbsProgressRequest): Promise<BffWbsResponse> {
    const response = await fetch(`${this.baseUrl}/wbs/${id}/progress`, {
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

  async updateWbsDependency(id: string, request: BffUpdateWbsDependencyRequest): Promise<BffWbsResponse> {
    const response = await fetch(`${this.baseUrl}/wbs/${id}/dependency`, {
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

  async deleteWbs(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/wbs/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async getNextWbsCode(planId: string, parentWbsId?: string): Promise<BffNextWbsCodeResponse> {
    const params = new URLSearchParams()
    if (parentWbsId) params.set("parentWbsId", parentWbsId)

    const response = await fetch(`${this.baseUrl}/${planId}/next-wbs-code?${params}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }
}

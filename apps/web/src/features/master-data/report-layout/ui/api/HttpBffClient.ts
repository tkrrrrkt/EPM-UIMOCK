import type {
  BffLayoutListRequest,
  BffLayoutListResponse,
  BffCreateLayoutRequest,
  BffUpdateLayoutRequest,
  BffCopyLayoutRequest,
  BffLayoutDetailResponse,
  BffLineListResponse,
  BffCreateLineRequest,
  BffUpdateLineRequest,
  BffMoveLineRequest,
  BffLineDetailResponse,
  BffSubjectSearchRequest,
  BffSubjectSearchResponse,
} from "@epm/contracts/bff/report-layout"
import type { BffClient } from "./BffClient"

export class HttpBffClient implements BffClient {
  private baseUrl = "/api/bff/master-data/report-layout"

  async getLayouts(request: BffLayoutListRequest): Promise<BffLayoutListResponse> {
    const params = new URLSearchParams()
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))
    if (request.sortBy) params.set("sortBy", request.sortBy)
    if (request.sortOrder) params.set("sortOrder", request.sortOrder)
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.layoutType) params.set("layoutType", request.layoutType)
    if (request.isActive !== undefined) params.set("isActive", String(request.isActive))

    const response = await fetch(`${this.baseUrl}/layouts?${params}`)
    return this.handleResponse(response)
  }

  async getLayoutDetail(id: string): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${id}`)
    return this.handleResponse(response)
  }

  async createLayout(request: BffCreateLayoutRequest): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateLayout(id: string, request: BffUpdateLayoutRequest): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deactivateLayout(id: string): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${id}/deactivate`, {
      method: "POST",
    })
    return this.handleResponse(response)
  }

  async reactivateLayout(id: string): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${id}/reactivate`, {
      method: "POST",
    })
    return this.handleResponse(response)
  }

  async copyLayout(id: string, request: BffCopyLayoutRequest): Promise<BffLayoutDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${id}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async getLines(layoutId: string): Promise<BffLineListResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${layoutId}/lines`)
    return this.handleResponse(response)
  }

  async getLineDetail(id: string): Promise<BffLineDetailResponse> {
    const response = await fetch(`${this.baseUrl}/lines/${id}`)
    return this.handleResponse(response)
  }

  async createLine(layoutId: string, request: BffCreateLineRequest): Promise<BffLineDetailResponse> {
    const response = await fetch(`${this.baseUrl}/layouts/${layoutId}/lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateLine(id: string, request: BffUpdateLineRequest): Promise<BffLineDetailResponse> {
    const response = await fetch(`${this.baseUrl}/lines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deleteLine(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/lines/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(await response.text())
    }
  }

  async moveLine(id: string, request: BffMoveLineRequest): Promise<BffLineListResponse> {
    const response = await fetch(`${this.baseUrl}/lines/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async searchSubjects(request: BffSubjectSearchRequest): Promise<BffSubjectSearchResponse> {
    const params = new URLSearchParams()
    params.set("layoutType", request.layoutType)
    params.set("companyId", request.companyId)
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))

    const response = await fetch(`${this.baseUrl}/subjects?${params}`)
    return this.handleResponse(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }
    return response.json()
  }
}

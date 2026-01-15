import type { BffClient } from "./BffClient"
import type {
  BffGroupLayoutListRequest,
  BffGroupLayoutListResponse,
  BffGroupLayoutDetailResponse,
  BffCreateGroupLayoutRequest,
  BffUpdateGroupLayoutRequest,
  BffCopyGroupLayoutRequest,
  BffGroupLineListResponse,
  BffGroupLineDetailResponse,
  BffCreateGroupLineRequest,
  BffUpdateGroupLineRequest,
  BffMoveGroupLineRequest,
  BffGroupSubjectSearchRequest,
  BffGroupSubjectSearchResponse,
  BffGroupLayoutContextResponse,
} from "@epm/contracts/bff/group-report-layout"

const BASE_URL = "/api/bff/master-data/group-report-layout"

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.code || "UNKNOWN_ERROR")
  }
  return response.json()
}

export class HttpBffClient implements BffClient {
  async getContext(): Promise<BffGroupLayoutContextResponse> {
    const response = await fetch(`${BASE_URL}/context`)
    return handleResponse(response)
  }

  async getLayouts(request: BffGroupLayoutListRequest): Promise<BffGroupLayoutListResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.layoutType) params.set("layoutType", request.layoutType)
    if (request.isActive !== undefined) params.set("isActive", String(request.isActive))
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))
    if (request.sortBy) params.set("sortBy", request.sortBy)
    if (request.sortOrder) params.set("sortOrder", request.sortOrder)

    const response = await fetch(`${BASE_URL}/layouts?${params.toString()}`)
    return handleResponse(response)
  }

  async getLayoutDetail(id: string): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}`)
    return handleResponse(response)
  }

  async createLayout(request: BffCreateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async updateLayout(id: string, request: BffUpdateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async deactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}/deactivate`, {
      method: "POST",
    })
    return handleResponse(response)
  }

  async reactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}/reactivate`, {
      method: "POST",
    })
    return handleResponse(response)
  }

  async setDefaultLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}/set-default`, {
      method: "POST",
    })
    return handleResponse(response)
  }

  async copyLayout(id: string, request: BffCopyGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${id}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async getLines(layoutId: string): Promise<BffGroupLineListResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${layoutId}/lines`)
    return handleResponse(response)
  }

  async getLineDetail(id: string): Promise<BffGroupLineDetailResponse> {
    const response = await fetch(`${BASE_URL}/lines/${id}`)
    return handleResponse(response)
  }

  async createLine(layoutId: string, request: BffCreateGroupLineRequest): Promise<BffGroupLineDetailResponse> {
    const response = await fetch(`${BASE_URL}/layouts/${layoutId}/lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async updateLine(id: string, request: BffUpdateGroupLineRequest): Promise<BffGroupLineDetailResponse> {
    const response = await fetch(`${BASE_URL}/lines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async deleteLine(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/lines/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.code || "UNKNOWN_ERROR")
    }
  }

  async moveLine(id: string, request: BffMoveGroupLineRequest): Promise<BffGroupLineListResponse> {
    const response = await fetch(`${BASE_URL}/lines/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return handleResponse(response)
  }

  async searchGroupSubjects(request: BffGroupSubjectSearchRequest): Promise<BffGroupSubjectSearchResponse> {
    const params = new URLSearchParams()
    params.set("layoutType", request.layoutType)
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.page) params.set("page", String(request.page))
    if (request.pageSize) params.set("pageSize", String(request.pageSize))

    const response = await fetch(`${BASE_URL}/group-subjects?${params.toString()}`)
    return handleResponse(response)
  }
}

import type { BffClient } from "./BffClient"
import type {
  BffListProjectsRequest,
  BffListProjectsResponse,
  BffProjectDetailResponse,
  BffCreateProjectRequest,
  BffUpdateProjectRequest,
} from "@epm/contracts/bff/project-master"

export class HttpBffClient implements BffClient {
  // TODO: Set actual BFF endpoint after migration
  private baseUrl = ""

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw error
    }

    return response.json()
  }

  async listProjects(request: BffListProjectsRequest): Promise<BffListProjectsResponse> {
    const params = new URLSearchParams()
    if (request.page) params.append("page", request.page.toString())
    if (request.pageSize) params.append("pageSize", request.pageSize.toString())
    if (request.sortBy) params.append("sortBy", request.sortBy)
    if (request.sortOrder) params.append("sortOrder", request.sortOrder)
    if (request.keyword) params.append("keyword", request.keyword)
    if (request.projectStatus) params.append("projectStatus", request.projectStatus)
    if (request.isActive !== undefined) params.append("isActive", request.isActive.toString())

    return this.request(`?${params.toString()}`)
  }

  async getProjectDetail(id: string): Promise<BffProjectDetailResponse> {
    return this.request(`/${id}`)
  }

  async createProject(request: BffCreateProjectRequest): Promise<BffProjectDetailResponse> {
    return this.request("", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async updateProject(id: string, request: BffUpdateProjectRequest): Promise<BffProjectDetailResponse> {
    return this.request(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    })
  }

  async deactivateProject(id: string): Promise<BffProjectDetailResponse> {
    return this.request(`/${id}/deactivate`, {
      method: "POST",
    })
  }

  async reactivateProject(id: string): Promise<BffProjectDetailResponse> {
    return this.request(`/${id}/reactivate`, {
      method: "POST",
    })
  }
}

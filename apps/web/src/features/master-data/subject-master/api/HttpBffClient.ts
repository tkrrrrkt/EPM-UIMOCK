import type { BffClient } from "./BffClient"
import type {
  BffSubjectTreeRequest,
  BffSubjectTreeResponse,
  BffSubjectDetailResponse,
  BffCreateSubjectRequest,
  BffUpdateSubjectRequest,
  BffAddRollupRequest,
  BffUpdateRollupRequest,
  BffMoveSubjectRequest,
} from "@contracts/bff/subject-master"

export class HttpBffClient implements BffClient {
  constructor(private baseUrl = "/api/bff") {}

  async getSubjectTree(request: BffSubjectTreeRequest): Promise<BffSubjectTreeResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.subjectType) params.set("subjectType", request.subjectType)
    if (request.subjectClass) params.set("subjectClass", request.subjectClass)
    if (request.isActive !== undefined) params.set("isActive", String(request.isActive))

    const queryString = params.toString()
    const url = `${this.baseUrl}/master-data/subject-master/tree${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async getSubjectDetail(id: string): Promise<BffSubjectDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${id}`)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async createSubject(request: BffCreateSubjectRequest): Promise<BffSubjectDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async updateSubject(id: string, request: BffUpdateSubjectRequest): Promise<BffSubjectDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async deactivateSubject(id: string): Promise<BffSubjectDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${id}/deactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async reactivateSubject(id: string): Promise<BffSubjectDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${id}/reactivate`, {
      method: "POST",
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async addRollup(parentId: string, request: BffAddRollupRequest): Promise<BffSubjectTreeResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${parentId}/rollup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async updateRollup(
    parentId: string,
    componentId: string,
    request: BffUpdateRollupRequest,
  ): Promise<BffSubjectTreeResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${parentId}/rollup/${componentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async deleteRollup(parentId: string, componentId: string): Promise<BffSubjectTreeResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/${parentId}/rollup/${componentId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async moveSubject(request: BffMoveSubjectRequest): Promise<BffSubjectTreeResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/subject-master/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  private async handleError(response: Response): Promise<Error> {
    try {
      const error = await response.json()
      return new Error(error.code || "UNKNOWN_ERROR")
    } catch {
      return new Error("NETWORK_ERROR")
    }
  }
}

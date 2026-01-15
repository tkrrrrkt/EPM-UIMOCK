import type { BffClient } from "./BffClient"
import type {
  BffGroupSubjectTreeRequest,
  BffGroupSubjectTreeResponse,
  BffGroupSubjectDetailResponse,
  BffCreateGroupSubjectRequest,
  BffUpdateGroupSubjectRequest,
  BffAddGroupRollupRequest,
  BffUpdateGroupRollupRequest,
  BffMoveGroupSubjectRequest,
} from "@epm/contracts/bff/group-subject-master"

const BASE_URL = "/api/bff/master-data/group-subject-master"

export class HttpBffClient implements BffClient {
  async getTree(request: BffGroupSubjectTreeRequest): Promise<BffGroupSubjectTreeResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.set("keyword", request.keyword)
    if (request.subjectType) params.set("subjectType", request.subjectType)
    if (request.subjectClass) params.set("subjectClass", request.subjectClass)
    if (request.isActive !== undefined) params.set("isActive", String(request.isActive))

    const response = await fetch(`${BASE_URL}/tree?${params}`)
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async getDetail(id: string): Promise<BffGroupSubjectDetailResponse> {
    const response = await fetch(`${BASE_URL}/${id}`)
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async create(request: BffCreateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async update(id: string, request: BffUpdateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async deactivate(id: string): Promise<BffGroupSubjectDetailResponse> {
    const response = await fetch(`${BASE_URL}/${id}/deactivate`, {
      method: "POST",
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async reactivate(id: string): Promise<BffGroupSubjectDetailResponse> {
    const response = await fetch(`${BASE_URL}/${id}/reactivate`, {
      method: "POST",
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async addRollup(parentId: string, request: BffAddGroupRollupRequest): Promise<BffGroupSubjectTreeResponse> {
    const response = await fetch(`${BASE_URL}/${parentId}/rollup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async updateRollup(
    parentId: string,
    componentId: string,
    request: BffUpdateGroupRollupRequest,
  ): Promise<BffGroupSubjectTreeResponse> {
    const response = await fetch(`${BASE_URL}/${parentId}/rollup/${componentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async deleteRollup(parentId: string, componentId: string): Promise<BffGroupSubjectTreeResponse> {
    const response = await fetch(`${BASE_URL}/${parentId}/rollup/${componentId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async move(request: BffMoveGroupSubjectRequest): Promise<BffGroupSubjectTreeResponse> {
    const response = await fetch(`${BASE_URL}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }
}

import type { BffClient } from './BffClient'
import type {
  BffVersionListRequest,
  BffVersionListResponse,
  BffVersionDetailResponse,
  BffCreateVersionRequest,
  BffCopyVersionRequest,
  BffUpdateVersionRequest,
  BffDepartmentTreeRequest,
  BffDepartmentTreeResponse,
  BffDepartmentDetailResponse,
  BffCreateDepartmentRequest,
  BffUpdateDepartmentRequest,
  BffMoveDepartmentRequest,
} from '@epm/contracts/bff/organization-master'

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = '/api/bff/master-data/organization-master') {
    this.baseUrl = baseUrl
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ code: 'UNKNOWN_ERROR' }))
      throw new Error(error.code || 'UNKNOWN_ERROR')
    }

    return response.json()
  }

  async getVersionList(request: BffVersionListRequest): Promise<BffVersionListResponse> {
    const params = new URLSearchParams()
    if (request.sortBy) params.append('sortBy', request.sortBy)
    if (request.sortOrder) params.append('sortOrder', request.sortOrder)

    return this.request(`${this.baseUrl}/versions?${params}`)
  }

  async getVersionDetail(id: string): Promise<BffVersionDetailResponse> {
    return this.request(`${this.baseUrl}/versions/${id}`)
  }

  async createVersion(request: BffCreateVersionRequest): Promise<BffVersionDetailResponse> {
    return this.request(`${this.baseUrl}/versions`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async copyVersion(id: string, request: BffCopyVersionRequest): Promise<BffVersionDetailResponse> {
    return this.request(`${this.baseUrl}/versions/${id}/copy`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async updateVersion(id: string, request: BffUpdateVersionRequest): Promise<BffVersionDetailResponse> {
    return this.request(`${this.baseUrl}/versions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })
  }

  async getVersionAsOf(id: string, asOfDate: string): Promise<BffVersionDetailResponse> {
    return this.request(`${this.baseUrl}/versions/${id}/as-of?asOfDate=${asOfDate}`)
  }

  async getDepartmentTree(versionId: string, request: BffDepartmentTreeRequest): Promise<BffDepartmentTreeResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.append('keyword', request.keyword)
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive))
    if (request.orgUnitType) params.append('orgUnitType', request.orgUnitType)

    return this.request(`${this.baseUrl}/versions/${versionId}/departments/tree?${params}`)
  }

  async getDepartmentDetail(id: string): Promise<BffDepartmentDetailResponse> {
    return this.request(`${this.baseUrl}/departments/${id}`)
  }

  async createDepartment(versionId: string, request: BffCreateDepartmentRequest): Promise<BffDepartmentDetailResponse> {
    return this.request(`${this.baseUrl}/versions/${versionId}/departments`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async updateDepartment(id: string, request: BffUpdateDepartmentRequest): Promise<BffDepartmentDetailResponse> {
    return this.request(`${this.baseUrl}/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })
  }

  async moveDepartment(id: string, request: BffMoveDepartmentRequest): Promise<BffDepartmentTreeResponse> {
    return this.request(`${this.baseUrl}/departments/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async deactivateDepartment(id: string): Promise<BffDepartmentDetailResponse> {
    return this.request(`${this.baseUrl}/departments/${id}/deactivate`, {
      method: 'POST',
    })
  }

  async reactivateDepartment(id: string): Promise<BffDepartmentDetailResponse> {
    return this.request(`${this.baseUrl}/departments/${id}/reactivate`, {
      method: 'POST',
    })
  }
}

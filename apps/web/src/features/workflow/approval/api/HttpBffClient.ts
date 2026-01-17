/**
 * HttpBffClient: approval (承認ワークフロー)
 *
 * 本番用HTTP実装（BFF接続時に有効化）
 */

import type { BffClient } from './BffClient'
import type {
  BffApprovalListRequest,
  BffApprovalListResponse,
  BffApprovalDetailResponse,
  BffApprovalCountResponse,
  BffApprovalActionRequest,
  BffApprovalActionResponse,
  BffApprovalHistoryResponse,
} from '@epm/contracts/bff/approval'

export class HttpBffClient implements BffClient {
  private baseUrl = '/api/bff/workflow/approvals'

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      }))
      throw error
    }

    return response.json()
  }

  async listApprovals(request: BffApprovalListRequest): Promise<BffApprovalListResponse> {
    const params = new URLSearchParams()
    if (request.page) params.set('page', String(request.page))
    if (request.pageSize) params.set('pageSize', String(request.pageSize))
    if (request.sortBy) params.set('sortBy', request.sortBy)
    if (request.sortOrder) params.set('sortOrder', request.sortOrder)
    if (request.keyword) params.set('keyword', request.keyword)
    if (request.scenarioType) params.set('scenarioType', request.scenarioType)

    const query = params.toString()
    return this.request<BffApprovalListResponse>(query ? `?${query}` : '')
  }

  async getApprovalDetail(id: string): Promise<BffApprovalDetailResponse> {
    return this.request<BffApprovalDetailResponse>(`/${id}`)
  }

  async getApprovalCount(): Promise<BffApprovalCountResponse> {
    return this.request<BffApprovalCountResponse>('/count')
  }

  async submitApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    return this.request<BffApprovalActionResponse>(`/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async approveApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    return this.request<BffApprovalActionResponse>(`/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async rejectApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    return this.request<BffApprovalActionResponse>(`/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async withdrawApproval(
    id: string,
    request: BffApprovalActionRequest
  ): Promise<BffApprovalActionResponse> {
    return this.request<BffApprovalActionResponse>(`/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getApprovalHistory(statusId: string): Promise<BffApprovalHistoryResponse> {
    return this.request<BffApprovalHistoryResponse>(`/history/${statusId}`)
  }
}

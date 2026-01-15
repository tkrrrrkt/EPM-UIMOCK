/**
 * HttpBffClient for Company Master
 *
 * UI-BFF Phase: 実際の BFF エンドポイントに接続
 * 現在は未使用（MockBffClient を使用中）
 */

import type {
  BffListCompaniesRequest,
  BffListCompaniesResponse,
  BffCompanyDetailResponse,
  BffCreateCompanyRequest,
  BffUpdateCompanyRequest,
  BffCompanyTreeResponse,
} from '@epm/contracts/bff/company-master'
import type { BffClient } from './BffClient'

const BASE_URL = '/api/bff/master-data/company-master'

async function fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ code: 'UNKNOWN_ERROR', message: 'Unknown error' }))
    throw new Error(error.code || 'UNKNOWN_ERROR')
  }

  return response.json()
}

export const httpBffClient: BffClient = {
  async listCompanies(req: BffListCompaniesRequest): Promise<BffListCompaniesResponse> {
    const params = new URLSearchParams()
    if (req.page) params.set('page', req.page.toString())
    if (req.pageSize) params.set('pageSize', req.pageSize.toString())
    if (req.sortBy) params.set('sortBy', req.sortBy)
    if (req.sortOrder) params.set('sortOrder', req.sortOrder)
    if (req.keyword) params.set('keyword', req.keyword)
    if (req.isActive !== undefined) params.set('isActive', req.isActive.toString())
    if (req.consolidationType) params.set('consolidationType', req.consolidationType)

    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL
    return fetchWithError<BffListCompaniesResponse>(url)
  },

  async getCompanyTree(): Promise<BffCompanyTreeResponse> {
    return fetchWithError<BffCompanyTreeResponse>(`${BASE_URL}/tree`)
  },

  async getCompanyDetail(id: string): Promise<BffCompanyDetailResponse> {
    return fetchWithError<BffCompanyDetailResponse>(`${BASE_URL}/${id}`)
  },

  async createCompany(req: BffCreateCompanyRequest): Promise<BffCompanyDetailResponse> {
    return fetchWithError<BffCompanyDetailResponse>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(req),
    })
  },

  async updateCompany(id: string, req: BffUpdateCompanyRequest): Promise<BffCompanyDetailResponse> {
    return fetchWithError<BffCompanyDetailResponse>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    })
  },

  async deactivateCompany(id: string): Promise<BffCompanyDetailResponse> {
    return fetchWithError<BffCompanyDetailResponse>(`${BASE_URL}/${id}/deactivate`, {
      method: 'POST',
    })
  },

  async reactivateCompany(id: string): Promise<BffCompanyDetailResponse> {
    return fetchWithError<BffCompanyDetailResponse>(`${BASE_URL}/${id}/reactivate`, {
      method: 'POST',
    })
  },
}

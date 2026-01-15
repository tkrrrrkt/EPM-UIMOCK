/**
 * HTTP BFF Client for Production
 *
 * Wraps fetch calls to BFF endpoints
 * Currently unused - switch from MockBffClient when BFF is ready
 */

import type { BffClient } from "./BffClient"
import { BffClientError } from "./BffClient"
import type {
  BffListLaborCostRatesRequest,
  BffListLaborCostRatesResponse,
  BffCreateLaborCostRateRequest,
  BffUpdateLaborCostRateRequest,
  BffLaborCostRateDetailResponse,
  BffListSubjectsResponse,
  BffError,
} from "../types/bff-contracts"

export class HttpBffClient implements BffClient {
  constructor(private readonly baseUrl: string = "/api/bff") {}

  async listLaborCostRates(request: BffListLaborCostRatesRequest): Promise<BffListLaborCostRatesResponse> {
    const params = new URLSearchParams()
    if (request.page) params.append("page", String(request.page))
    if (request.pageSize) params.append("pageSize", String(request.pageSize))
    if (request.sortBy) params.append("sortBy", request.sortBy)
    if (request.sortOrder) params.append("sortOrder", request.sortOrder)
    if (request.keyword) params.append("keyword", request.keyword)
    if (request.resourceType) params.append("resourceType", request.resourceType)
    if (request.grade) params.append("grade", request.grade)
    if (request.employmentType) params.append("employmentType", request.employmentType)
    if (request.rateType) params.append("rateType", request.rateType)
    if (request.isActive !== undefined) params.append("isActive", String(request.isActive))
    if (request.asOfDate) params.append("asOfDate", request.asOfDate)

    return this.fetch<BffListLaborCostRatesResponse>(`${this.baseUrl}/master-data/labor-cost-rate?${params.toString()}`)
  }

  async getLaborCostRateDetail(id: string): Promise<BffLaborCostRateDetailResponse> {
    return this.fetch<BffLaborCostRateDetailResponse>(`${this.baseUrl}/master-data/labor-cost-rate/${id}`)
  }

  async createLaborCostRate(request: BffCreateLaborCostRateRequest): Promise<BffLaborCostRateDetailResponse> {
    return this.fetch<BffLaborCostRateDetailResponse>(`${this.baseUrl}/master-data/labor-cost-rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
  }

  async updateLaborCostRate(
    id: string,
    request: BffUpdateLaborCostRateRequest,
  ): Promise<BffLaborCostRateDetailResponse> {
    return this.fetch<BffLaborCostRateDetailResponse>(`${this.baseUrl}/master-data/labor-cost-rate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
  }

  async deactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse> {
    return this.fetch<BffLaborCostRateDetailResponse>(`${this.baseUrl}/master-data/labor-cost-rate/${id}/deactivate`, {
      method: "POST",
    })
  }

  async reactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse> {
    return this.fetch<BffLaborCostRateDetailResponse>(`${this.baseUrl}/master-data/labor-cost-rate/${id}/reactivate`, {
      method: "POST",
    })
  }

  async listSubjects(): Promise<BffListSubjectsResponse> {
    return this.fetch<BffListSubjectsResponse>(`${this.baseUrl}/master-data/labor-cost-rate/subjects`)
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        // Auth token will be attached here when authentication is implemented
      },
    })

    if (!response.ok) {
      const error: BffError = await response.json()
      throw new BffClientError(error)
    }

    return response.json()
  }
}

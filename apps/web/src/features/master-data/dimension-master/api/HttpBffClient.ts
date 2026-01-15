import type { BffClient } from './BffClient'
import type {
  BffListDimensionsRequest,
  BffListDimensionsResponse,
  BffDimensionDetailResponse,
  BffCreateDimensionRequest,
  BffUpdateDimensionRequest,
  BffListDimensionValuesRequest,
  BffListDimensionValuesResponse,
  BffDimensionValueDetailResponse,
  BffCreateDimensionValueRequest,
  BffUpdateDimensionValueRequest,
} from '@epm/contracts/bff/dimension-master'

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = '/api/bff') {
    this.baseUrl = baseUrl
  }

  // Dimension methods
  async listDimensions(req: BffListDimensionsRequest): Promise<BffListDimensionsResponse> {
    const params = new URLSearchParams()
    if (req.page) params.set('page', String(req.page))
    if (req.pageSize) params.set('pageSize', String(req.pageSize))
    if (req.sortBy) params.set('sortBy', req.sortBy)
    if (req.sortOrder) params.set('sortOrder', req.sortOrder)
    if (req.keyword) params.set('keyword', req.keyword)
    if (req.dimensionType) params.set('dimensionType', req.dimensionType)
    if (req.isActive !== undefined) params.set('isActive', String(req.isActive))

    const response = await fetch(`${this.baseUrl}/master-data/dimensions?${params}`)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async getDimensionDetail(id: string): Promise<BffDimensionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${id}`)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async createDimension(req: BffCreateDimensionRequest): Promise<BffDimensionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async updateDimension(id: string, req: BffUpdateDimensionRequest): Promise<BffDimensionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async deactivateDimension(id: string): Promise<BffDimensionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${id}/deactivate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async reactivateDimension(id: string): Promise<BffDimensionDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${id}/reactivate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  // Dimension Value methods
  async listDimensionValues(
    dimensionId: string,
    req: BffListDimensionValuesRequest,
  ): Promise<BffListDimensionValuesResponse> {
    const params = new URLSearchParams()
    if (req.page) params.set('page', String(req.page))
    if (req.pageSize) params.set('pageSize', String(req.pageSize))
    if (req.sortBy) params.set('sortBy', req.sortBy)
    if (req.sortOrder) params.set('sortOrder', req.sortOrder)
    if (req.keyword) params.set('keyword', req.keyword)
    if (req.scopeType) params.set('scopeType', req.scopeType)
    if (req.scopeCompanyId) params.set('scopeCompanyId', req.scopeCompanyId)
    if (req.isActive !== undefined) params.set('isActive', String(req.isActive))

    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values?${params}`)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async getDimensionValueDetail(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values/${valueId}`)
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async createDimensionValue(
    dimensionId: string,
    req: BffCreateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async updateDimensionValue(
    dimensionId: string,
    valueId: string,
    req: BffUpdateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values/${valueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async deactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values/${valueId}/deactivate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  async reactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    const response = await fetch(`${this.baseUrl}/master-data/dimensions/${dimensionId}/values/${valueId}/reactivate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw await this.handleError(response)
    }
    return response.json()
  }

  // Error handling
  private async handleError(response: Response): Promise<Error> {
    try {
      const error = await response.json()
      return new Error(error.code || 'UNKNOWN_ERROR')
    } catch {
      return new Error('NETWORK_ERROR')
    }
  }
}

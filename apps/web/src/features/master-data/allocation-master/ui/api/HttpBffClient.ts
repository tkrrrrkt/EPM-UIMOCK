import type { BffClient } from './BffClient'
import type {
  BffAllocationEventListRequest,
  BffAllocationEventListResponse,
  BffAllocationEventResponse,
  BffAllocationEventDetailResponse,
  BffCreateAllocationEventRequest,
  BffUpdateAllocationEventRequest,
  BffCopyAllocationEventRequest,
  BffCreateAllocationStepRequest,
  BffUpdateAllocationStepRequest,
  BffReorderStepsRequest,
  BffAllocationStepResponse,
  BffCreateAllocationTargetRequest,
  BffUpdateAllocationTargetRequest,
  BffAllocationTargetResponse,
  BffAllocationDriverListRequest,
  BffAllocationDriverListResponse,
  BffAllocationDriverResponse,
  BffCreateAllocationDriverRequest,
  BffUpdateAllocationDriverRequest,
} from '@epm/contracts/bff/allocation-master'

/**
 * HTTP BFF Client Implementation
 * 本番環境用のHTTPクライアント実装
 * MockBffClientから切り替えて使用
 */
export class HttpBffClient implements BffClient {
  constructor(private baseUrl = '/api/bff') {}

  async listEvents(request: BffAllocationEventListRequest): Promise<BffAllocationEventListResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.append('keyword', request.keyword)
    if (request.scenarioType) params.append('scenarioType', request.scenarioType)
    if (request.isActive !== undefined) params.append('isActive', String(request.isActive))
    if (request.page) params.append('page', String(request.page))
    if (request.pageSize) params.append('pageSize', String(request.pageSize))
    if (request.sortBy) params.append('sortBy', request.sortBy)
    if (request.sortOrder) params.append('sortOrder', request.sortOrder)

    const res = await fetch(`${this.baseUrl}/master-data/allocation-events?${params}`)
    if (!res.ok) throw new Error('Failed to fetch events')
    return res.json()
  }

  async createEvent(request: BffCreateAllocationEventRequest): Promise<BffAllocationEventResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to create event')
    return res.json()
  }

  async getEventDetail(id: string): Promise<BffAllocationEventDetailResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${id}`)
    if (!res.ok) throw new Error('Failed to fetch event detail')
    return res.json()
  }

  async updateEvent(id: string, request: BffUpdateAllocationEventRequest): Promise<BffAllocationEventResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to update event')
    return res.json()
  }

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete event')
  }

  async copyEvent(id: string, request: BffCopyAllocationEventRequest): Promise<BffAllocationEventResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${id}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to copy event')
    return res.json()
  }

  async createStep(eventId: string, request: BffCreateAllocationStepRequest): Promise<BffAllocationStepResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${eventId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to create step')
    return res.json()
  }

  async updateStep(
    eventId: string,
    stepId: string,
    request: BffUpdateAllocationStepRequest,
  ): Promise<BffAllocationStepResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${eventId}/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to update step')
    return res.json()
  }

  async deleteStep(eventId: string, stepId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${eventId}/steps/${stepId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete step')
  }

  async reorderSteps(eventId: string, request: BffReorderStepsRequest): Promise<BffAllocationStepResponse[]> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${eventId}/steps/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to reorder steps')
    return res.json()
  }

  async createTarget(
    eventId: string,
    stepId: string,
    request: BffCreateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-events/${eventId}/steps/${stepId}/targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to create target')
    return res.json()
  }

  async updateTarget(
    eventId: string,
    stepId: string,
    targetId: string,
    request: BffUpdateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse> {
    const res = await fetch(
      `${this.baseUrl}/master-data/allocation-events/${eventId}/steps/${stepId}/targets/${targetId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    )
    if (!res.ok) throw new Error('Failed to update target')
    return res.json()
  }

  async deleteTarget(eventId: string, stepId: string, targetId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/master-data/allocation-events/${eventId}/steps/${stepId}/targets/${targetId}`,
      {
        method: 'DELETE',
      },
    )
    if (!res.ok) throw new Error('Failed to delete target')
  }

  async listDrivers(request: BffAllocationDriverListRequest): Promise<BffAllocationDriverListResponse> {
    const params = new URLSearchParams()
    if (request.keyword) params.append('keyword', request.keyword)
    if (request.driverType) params.append('driverType', request.driverType)
    if (request.page) params.append('page', String(request.page))
    if (request.pageSize) params.append('pageSize', String(request.pageSize))
    if (request.sortBy) params.append('sortBy', request.sortBy)
    if (request.sortOrder) params.append('sortOrder', request.sortOrder)

    const res = await fetch(`${this.baseUrl}/master-data/allocation-drivers?${params}`)
    if (!res.ok) throw new Error('Failed to fetch drivers')
    return res.json()
  }

  async createDriver(request: BffCreateAllocationDriverRequest): Promise<BffAllocationDriverResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to create driver')
    return res.json()
  }

  async getDriver(id: string): Promise<BffAllocationDriverResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-drivers/${id}`)
    if (!res.ok) throw new Error('Failed to fetch driver')
    return res.json()
  }

  async updateDriver(id: string, request: BffUpdateAllocationDriverRequest): Promise<BffAllocationDriverResponse> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-drivers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!res.ok) throw new Error('Failed to update driver')
    return res.json()
  }

  async deleteDriver(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/master-data/allocation-drivers/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete driver')
  }
}

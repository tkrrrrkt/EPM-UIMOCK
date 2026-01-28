import type { BffClient } from './BffClient'
import type {
  BffKpiListResponse,
  BffKpiDetail,
  BffKpiEvent,
  BffKpiItem,
  BffSelectOption,
  BffDepartment,
  BffEmployee,
  BffCreateKpiEventRequest,
  BffCreateKpiItemRequest,
  BffCreateActionPlanRequest,
} from '../lib/types'

/**
 * HttpBffClient - 本番用HTTPクライアント
 *
 * v0-workflow.md準拠:
 * - Phase UI-BFF: MockBffClientをHttpBffClientに差し替え
 * - エンドポイント/DTO/エラーはdesign.mdのBFF仕様に完全準拠
 */
export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api/bff/kpi-master') {
    this.baseUrl = baseUrl
  }

  async getEvents(): Promise<BffKpiEvent[]> {
    const response = await fetch(`${this.baseUrl}/events`)
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    return data.items
  }

  async createEvent(request: BffCreateKpiEventRequest): Promise<BffKpiEvent> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to create event')
    return response.json()
  }

  async getKpiList(eventId: string, departmentStableIds?: string[]): Promise<BffKpiListResponse> {
    const params = new URLSearchParams({ eventId })
    if (departmentStableIds?.length) {
      departmentStableIds.forEach(id => params.append('departmentStableIds', id))
    }
    const response = await fetch(`${this.baseUrl}/items?${params}`)
    if (!response.ok) throw new Error('Failed to fetch KPI list')
    return response.json()
  }

  async getKpiDetail(kpiItemId: string): Promise<BffKpiDetail> {
    const response = await fetch(`${this.baseUrl}/items/${kpiItemId}`)
    if (!response.ok) throw new Error('Failed to fetch KPI detail')
    return response.json()
  }

  async getKpiItems(eventId: string): Promise<BffKpiItem[]> {
    const response = await fetch(`${this.baseUrl}/items?eventId=${eventId}`)
    if (!response.ok) throw new Error('Failed to fetch KPI items')
    const data = await response.json()
    return data.items ?? data
  }

  async createKpiItem(request: BffCreateKpiItemRequest): Promise<BffKpiItem> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to create KPI item')
    return response.json()
  }

  async updateKpiItem(id: string, request: Partial<BffCreateKpiItemRequest>): Promise<BffKpiItem> {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to update KPI item')
    return response.json()
  }

  async deleteKpiItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete KPI item')
  }

  async updateFactAmount(factId: string, targetValue?: number, actualValue?: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fact-amounts/${factId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetValue, actualValue }),
    })
    if (!response.ok) throw new Error('Failed to update fact amount')
  }

  async createPeriod(kpiItemId: string, periodCode: string, targetValue?: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fact-amounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpiMasterItemId: kpiItemId, periodCode, targetValue }),
    })
    if (!response.ok) throw new Error('Failed to create period')
  }

  async createActionPlan(request: BffCreateActionPlanRequest): Promise<void> {
    const response = await fetch('/api/bff/action-plan-core/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to create action plan')
  }

  async getSelectableSubjects(): Promise<BffSelectOption[]> {
    const response = await fetch(`${this.baseUrl}/selectable-subjects`)
    if (!response.ok) throw new Error('Failed to fetch subjects')
    return response.json()
  }

  async getSelectableKpiDefinitions(): Promise<BffSelectOption[]> {
    const response = await fetch(`${this.baseUrl}/kpi-definitions`)
    if (!response.ok) throw new Error('Failed to fetch KPI definitions')
    const data = await response.json()
    return data.items ?? data
  }

  async getSelectableMetrics(): Promise<BffSelectOption[]> {
    const response = await fetch(`${this.baseUrl}/selectable-metrics`)
    if (!response.ok) throw new Error('Failed to fetch metrics')
    return response.json()
  }

  async getDepartments(): Promise<BffDepartment[]> {
    // Use shared departments endpoint
    const response = await fetch('/api/bff/master-data/departments')
    if (!response.ok) throw new Error('Failed to fetch departments')
    const data = await response.json()
    return data.items ?? data
  }

  async getEmployees(): Promise<BffEmployee[]> {
    // Use shared employees endpoint
    const response = await fetch('/api/bff/master-data/employees')
    if (!response.ok) throw new Error('Failed to fetch employees')
    const data = await response.json()
    return data.items ?? data
  }
}

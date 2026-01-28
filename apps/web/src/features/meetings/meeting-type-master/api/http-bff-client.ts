// HttpBffClient Implementation (Template)

import type {
  BffClient,
  MeetingTypeDto,
  MeetingTypeListDto,
  CreateMeetingTypeDto,
  UpdateMeetingTypeDto,
  GetMeetingTypesQueryDto,
  DepartmentOptionDto,
} from './bff-client'

export class HttpBffClient implements BffClient {
  private baseUrl = '/api/bff/meetings/types'

  async getMeetingTypes(query: GetMeetingTypesQueryDto): Promise<MeetingTypeListDto> {
    const params = new URLSearchParams()
    if (query.scope) params.set('scope', query.scope)
    if (query.isActive !== undefined) params.set('isActive', String(query.isActive))
    if (query.search) params.set('search', query.search)

    const res = await fetch(`${this.baseUrl}?${params}`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }

  async getMeetingTypeById(id: string): Promise<MeetingTypeDto> {
    const res = await fetch(`${this.baseUrl}/${id}`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }

  async createMeetingType(data: CreateMeetingTypeDto): Promise<MeetingTypeDto> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async updateMeetingType(id: string, data: UpdateMeetingTypeDto): Promise<MeetingTypeDto> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async deleteMeetingType(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
  }

  async getDepartmentOptions(): Promise<DepartmentOptionDto[]> {
    const res = await fetch('/api/bff/departments/options')
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }
}

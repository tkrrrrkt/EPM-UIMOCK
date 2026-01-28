import type { BffClient, OrgNodeWithSubmission } from './bff-client'
import type {
  MeetingEventDto,
  MeetingEventListDto,
  CreateMeetingEventDto,
  UpdateMeetingEventDto,
  UpdateMeetingEventStatusDto,
  GetMeetingEventsQueryDto,
  SubmissionStatusSummaryDto,
  MeetingSubmissionDto,
  SaveSubmissionDto,
  KpiCardListDto,
  // Phase 2
  SubmissionTrackingDto,
  RemindSubmissionDto,
  CloseEventDto,
  CloseEventResultDto,
  MeetingMinutesDto,
  SaveMeetingMinutesDto,
} from '@epm/contracts/bff/meetings'

/**
 * HttpBffClient for Management Meeting Report
 *
 * Purpose:
 * - Actual HTTP implementation for BFF API calls
 * - Used in production after UI-MOCK phase
 *
 * TODO: Implement when connecting to real BFF
 */
export class HttpBffClient implements BffClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = '/api/bff/meetings') {
    this.baseUrl = baseUrl
  }

  // ========== Meeting Events ==========

  async getEvents(query: GetMeetingEventsQueryDto): Promise<MeetingEventListDto> {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    if (query.keyword) params.set('keyword', query.keyword)
    if (query.meetingTypeId) params.set('meetingTypeId', query.meetingTypeId)
    if (query.status) params.set('status', query.status)
    if (query.fiscalYear) params.set('fiscalYear', String(query.fiscalYear))
    if (query.sortBy) params.set('sortBy', query.sortBy)
    if (query.sortOrder) params.set('sortOrder', query.sortOrder)

    const res = await fetch(`${this.baseUrl}/events?${params.toString()}`)
    if (!res.ok) throw new Error(`Failed to get events: ${res.status}`)
    return res.json()
  }

  async getEventById(id: string): Promise<MeetingEventDto> {
    const res = await fetch(`${this.baseUrl}/events/${id}`)
    if (!res.ok) throw new Error(`Failed to get event: ${res.status}`)
    return res.json()
  }

  async createEvent(data: CreateMeetingEventDto): Promise<MeetingEventDto> {
    const res = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to create event: ${res.status}`)
    return res.json()
  }

  async updateEvent(id: string, data: UpdateMeetingEventDto): Promise<MeetingEventDto> {
    const res = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to update event: ${res.status}`)
    return res.json()
  }

  async updateEventStatus(
    id: string,
    data: UpdateMeetingEventStatusDto,
  ): Promise<MeetingEventDto> {
    const res = await fetch(`${this.baseUrl}/events/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to update event status: ${res.status}`)
    return res.json()
  }

  // ========== Submission Status ==========

  async getSubmissionStatus(eventId: string): Promise<SubmissionStatusSummaryDto> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/submission-status`)
    if (!res.ok) throw new Error(`Failed to get submission status: ${res.status}`)
    return res.json()
  }

  // ========== Submissions ==========

  async getSubmission(
    eventId: string,
    departmentStableId: string,
  ): Promise<MeetingSubmissionDto> {
    const res = await fetch(`${this.baseUrl}/submissions/${eventId}/${departmentStableId}`)
    if (!res.ok) throw new Error(`Failed to get submission: ${res.status}`)
    return res.json()
  }

  async saveSubmission(data: SaveSubmissionDto): Promise<MeetingSubmissionDto> {
    const res = await fetch(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to save submission: ${res.status}`)
    return res.json()
  }

  async submitSubmission(id: string): Promise<MeetingSubmissionDto> {
    const res = await fetch(`${this.baseUrl}/submissions/${id}/submit`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error(`Failed to submit submission: ${res.status}`)
    return res.json()
  }

  // ========== KPI Cards ==========

  async getKpiCards(
    eventId: string,
    departmentStableId?: string,
  ): Promise<KpiCardListDto> {
    const params = new URLSearchParams()
    if (departmentStableId) params.set('departmentStableId', departmentStableId)

    const url = `${this.baseUrl}/events/${eventId}/kpi-cards${params.toString() ? `?${params.toString()}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to get KPI cards: ${res.status}`)
    return res.json()
  }

  // ========== Phase 2: B3 登録状況管理 ==========

  async getSubmissionTracking(eventId: string): Promise<SubmissionTrackingDto> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/submission-tracking`)
    if (!res.ok) throw new Error(`Failed to get submission tracking: ${res.status}`)
    return res.json()
  }

  async remindSubmission(eventId: string, data: RemindSubmissionDto): Promise<void> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to send reminder: ${res.status}`)
  }

  // ========== Phase 2: B4 会議クローズ ==========

  async closeEvent(eventId: string, data: CloseEventDto): Promise<CloseEventResultDto> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to close event: ${res.status}`)
    return res.json()
  }

  // ========== Phase 2: B5 議事録 ==========

  async getMinutes(eventId: string): Promise<MeetingMinutesDto> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/minutes`)
    if (!res.ok) throw new Error(`Failed to get minutes: ${res.status}`)
    return res.json()
  }

  async saveMinutes(eventId: string, data: SaveMeetingMinutesDto): Promise<MeetingMinutesDto> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/minutes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to save minutes: ${res.status}`)
    return res.json()
  }

  // ========== D4: 部門報告閲覧 ==========

  async getOrgTreeWithSubmission(eventId: string): Promise<OrgNodeWithSubmission[]> {
    const res = await fetch(`${this.baseUrl}/events/${eventId}/org-tree-submission`)
    if (!res.ok) throw new Error(`Failed to get org tree: ${res.status}`)
    return res.json()
  }
}

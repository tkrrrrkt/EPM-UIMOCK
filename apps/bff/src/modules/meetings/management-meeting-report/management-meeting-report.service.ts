import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
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
  MeetingEventStatus,
  // Phase 2 DTOs
  SubmissionTrackingDto,
  RemindSubmissionDto,
  CloseEventDto,
  CloseEventResultDto,
  MeetingMinutesDto,
  SaveMeetingMinutesDto,
} from '@epm/contracts/bff/meetings'
import {
  MOCK_MEETING_EVENTS,
  MOCK_MEETING_TYPES,
  MOCK_SUBMISSION_STATUS,
  MOCK_SUBMISSIONS,
  MOCK_KPI_CARDS,
  MOCK_FORM_FIELDS,
  // Phase 2 Mock Data
  MOCK_SUBMISSION_TRACKING,
  MOCK_MEETING_MINUTES,
} from './mock-data'

@Injectable()
export class ManagementMeetingReportService {
  // In-memory storage for mock data (mutable copy)
  private events: MeetingEventDto[] = [...MOCK_MEETING_EVENTS]

  /**
   * 会議イベント一覧取得
   */
  async getEvents(
    tenantId: string,
    query: GetMeetingEventsQueryDto,
  ): Promise<MeetingEventListDto> {
    let events = [...this.events]

    // フィルタ: キーワード
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase()
      events = events.filter(
        (e) =>
          e.eventName.toLowerCase().includes(keyword) ||
          e.eventCode.toLowerCase().includes(keyword),
      )
    }

    // フィルタ: 会議種別
    if (query.meetingTypeId) {
      events = events.filter((e) => e.meetingTypeId === query.meetingTypeId)
    }

    // フィルタ: ステータス
    if (query.status) {
      events = events.filter((e) => e.status === query.status)
    }

    // フィルタ: 年度
    if (query.fiscalYear) {
      events = events.filter((e) => e.targetFiscalYear === query.fiscalYear)
    }

    // ソート
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    events.sort((a, b) => {
      const aVal = a[sortBy as keyof MeetingEventDto] ?? ''
      const bVal = b[sortBy as keyof MeetingEventDto] ?? ''
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // ページング
    const page = query.page || 1
    const pageSize = Math.min(query.pageSize || 20, 100)
    const start = (page - 1) * pageSize
    const paged = events.slice(start, start + pageSize)

    return {
      items: paged,
      page,
      pageSize,
      totalCount: events.length,
    }
  }

  /**
   * 会議イベント詳細取得
   */
  async getEventById(tenantId: string, id: string): Promise<MeetingEventDto | null> {
    return this.events.find((e) => e.id === id) ?? null
  }

  /**
   * 会議イベント作成
   */
  async createEvent(
    tenantId: string,
    userId: string,
    data: CreateMeetingEventDto,
  ): Promise<MeetingEventDto> {
    const meetingType = MOCK_MEETING_TYPES.find((t) => t.id === data.meetingTypeId)
    const now = new Date().toISOString()

    const newEvent: MeetingEventDto = {
      id: randomUUID(),
      eventCode: this.generateEventCode(data.meetingTypeId, data.targetFiscalYear),
      eventName: data.eventName,
      meetingTypeId: data.meetingTypeId,
      meetingTypeName: meetingType?.typeName || '不明',
      targetPeriodId: data.targetPeriodId,
      targetPeriodName: data.targetPeriodId
        ? `${data.targetFiscalYear}年${this.extractMonth(data.targetPeriodId)}月度`
        : undefined,
      targetFiscalYear: data.targetFiscalYear,
      status: 'DRAFT',
      submissionDeadline: data.submissionDeadline,
      distributionDate: data.distributionDate,
      meetingDate: data.meetingDate,
      reportLayoutId: data.reportLayoutId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }

    this.events.push(newEvent)
    return newEvent
  }

  /**
   * 会議イベント更新
   */
  async updateEvent(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateMeetingEventDto,
  ): Promise<MeetingEventDto | null> {
    const index = this.events.findIndex((e) => e.id === id)
    if (index === -1) return null

    const updated: MeetingEventDto = {
      ...this.events[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    this.events[index] = updated
    return updated
  }

  /**
   * 会議イベントステータス更新
   */
  async updateEventStatus(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateMeetingEventStatusDto,
  ): Promise<MeetingEventDto | null> {
    const index = this.events.findIndex((e) => e.id === id)
    if (index === -1) return null

    const updated: MeetingEventDto = {
      ...this.events[index],
      status: data.status,
      updatedAt: new Date().toISOString(),
    }

    this.events[index] = updated
    return updated
  }

  /**
   * 提出状況一覧取得
   */
  async getSubmissionStatus(
    tenantId: string,
    eventId: string,
  ): Promise<SubmissionStatusSummaryDto> {
    const items = MOCK_SUBMISSION_STATUS[eventId] || []

    const summary = {
      total: items.length,
      notStarted: items.filter((i) => i.status === 'NOT_STARTED').length,
      draft: items.filter((i) => i.status === 'DRAFT').length,
      submitted: items.filter((i) => i.status === 'SUBMITTED').length,
      submissionRate: items.length > 0
        ? Math.round((items.filter((i) => i.status === 'SUBMITTED').length / items.length) * 100)
        : 0,
    }

    return { items, summary }
  }

  /**
   * 部門報告取得
   */
  async getSubmission(
    tenantId: string,
    eventId: string,
    departmentStableId: string,
  ): Promise<MeetingSubmissionDto | null> {
    const key = `${eventId}_${departmentStableId}`
    const existing = MOCK_SUBMISSIONS[key]

    if (existing) {
      return existing
    }

    // 新規（未着手）の場合は空のフォームを返す
    return {
      id: '',
      meetingEventId: eventId,
      submissionLevel: 'DEPARTMENT',
      departmentStableId,
      departmentName: this.getDepartmentName(departmentStableId),
      status: 'NOT_STARTED',
      values: MOCK_FORM_FIELDS.map((f) => ({
        ...f,
        id: '',
        valueText: undefined,
        valueNumber: undefined,
        valueDate: undefined,
        valueJson: undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * 報告保存
   */
  async saveSubmission(
    tenantId: string,
    userId: string,
    data: SaveSubmissionDto,
  ): Promise<MeetingSubmissionDto> {
    const now = new Date().toISOString()

    const submission: MeetingSubmissionDto = {
      id: randomUUID(),
      meetingEventId: data.meetingEventId,
      submissionLevel: data.submissionLevel,
      departmentStableId: data.departmentStableId,
      departmentName: this.getDepartmentName(data.departmentStableId || ''),
      status: 'DRAFT',
      values: data.values.map((v) => ({
        id: randomUUID(),
        fieldId: v.fieldId,
        fieldCode: '',
        fieldName: '',
        fieldType: 'TEXT',
        sectionCode: '',
        sectionName: '',
        isRequired: false,
        valueText: v.valueText,
        valueNumber: v.valueNumber,
        valueDate: v.valueDate,
        valueJson: v.valueJson,
        quoteRefsJson: v.quoteRefsJson as any,
      })),
      createdAt: now,
      updatedAt: now,
    }

    return submission
  }

  /**
   * 報告提出
   */
  async submitSubmission(
    tenantId: string,
    userId: string,
    submissionId: string,
  ): Promise<MeetingSubmissionDto | null> {
    // Mock: 提出済みに変更
    return {
      id: submissionId,
      meetingEventId: '',
      submissionLevel: 'DEPARTMENT',
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      submittedBy: userId,
      values: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * KPIカード一覧取得
   */
  async getKpiCards(
    tenantId: string,
    eventId: string,
    departmentStableId?: string,
  ): Promise<KpiCardListDto> {
    // Mock: 全イベント共通のKPIカードを返す
    return {
      items: MOCK_KPI_CARDS,
    }
  }

  // ==================== Phase 2: B3 登録状況管理 ====================

  /**
   * 登録状況詳細取得（B3）
   */
  async getSubmissionTracking(
    tenantId: string,
    eventId: string,
  ): Promise<SubmissionTrackingDto> {
    const event = this.events.find((e) => e.id === eventId)
    const items = MOCK_SUBMISSION_TRACKING[eventId] || []

    const deadline = event?.submissionDeadline ? new Date(event.submissionDeadline) : null
    const now = new Date()

    // 締切超過フラグを動的に計算
    const itemsWithOverdue = items.map((item) => ({
      ...item,
      isOverdue: Boolean(deadline && now > deadline && item.status !== 'SUBMITTED'),
    }))

    return {
      eventId,
      items: itemsWithOverdue,
      summary: {
        total: itemsWithOverdue.length,
        submitted: itemsWithOverdue.filter((i) => i.status === 'SUBMITTED').length,
        draft: itemsWithOverdue.filter((i) => i.status === 'DRAFT').length,
        notStarted: itemsWithOverdue.filter((i) => i.status === 'NOT_STARTED').length,
        overdue: itemsWithOverdue.filter((i) => i.isOverdue).length,
      },
    }
  }

  /**
   * 催促メール送信（B3）
   */
  async remindSubmission(
    tenantId: string,
    userId: string,
    eventId: string,
    data: RemindSubmissionDto,
  ): Promise<void> {
    // Mock: 催促メール送信をログ出力
    console.log(`[Mock] Remind submission: eventId=${eventId}, departments=${data.departmentStableIds.join(',')}`)

    // 実際の実装では:
    // 1. 対象部門の担当者メールアドレスを取得
    // 2. メール送信
    // 3. lastRemindedAt を更新
  }

  // ==================== Phase 2: B4 会議クローズ ====================

  /**
   * 会議クローズ（B4）
   */
  async closeEvent(
    tenantId: string,
    userId: string,
    eventId: string,
    data: CloseEventDto,
  ): Promise<CloseEventResultDto> {
    const index = this.events.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error(`Event not found: ${eventId}`)
    }

    const now = new Date().toISOString()

    // ステータスをCLOSEDに更新
    this.events[index] = {
      ...this.events[index],
      status: 'CLOSED',
      updatedAt: now,
    }

    // スナップショットID（Mock）
    const snapshotIds = data.includeSnapshot && data.snapshotTypes
      ? data.snapshotTypes.map((type) => `snapshot-${eventId}-${type}-${Date.now()}`)
      : undefined

    return {
      eventId,
      status: 'CLOSED',
      closedAt: now,
      snapshotIds,
    }
  }

  // ==================== Phase 2: B5 議事録 ====================

  // In-memory storage for meeting minutes
  private minutes: Map<string, MeetingMinutesDto> = new Map()

  /**
   * 議事録取得（B5）
   */
  async getMinutes(
    tenantId: string,
    eventId: string,
  ): Promise<MeetingMinutesDto | null> {
    // まずメモリから取得
    if (this.minutes.has(eventId)) {
      return this.minutes.get(eventId)!
    }

    // Mock データから取得
    const mockMinutes = MOCK_MEETING_MINUTES[eventId]
    if (mockMinutes) {
      return mockMinutes
    }

    // 存在しない場合は空の議事録を返す（新規作成用）
    return {
      id: '',
      eventId,
      content: '',
      decisions: [],
      attendees: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '',
      updatedBy: '',
    }
  }

  /**
   * 議事録保存（B5）
   */
  async saveMinutes(
    tenantId: string,
    userId: string,
    eventId: string,
    data: SaveMeetingMinutesDto,
  ): Promise<MeetingMinutesDto> {
    const now = new Date().toISOString()
    const existing = this.minutes.get(eventId)

    const minutes: MeetingMinutesDto = {
      id: existing?.id || randomUUID(),
      eventId,
      content: data.content,
      decisions: data.decisions,
      attendees: data.attendees,
      attachments: existing?.attachments || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      createdBy: existing?.createdBy || userId,
      updatedBy: userId,
    }

    this.minutes.set(eventId, minutes)
    return minutes
  }

  // ---- Helper Methods ----

  private generateEventCode(meetingTypeId: string, fiscalYear: number): string {
    const type = MOCK_MEETING_TYPES.find((t) => t.id === meetingTypeId)
    const prefix = type?.typeCode === 'MONTHLY_MGMT' ? 'MTG' : type?.typeCode || 'EVT'
    const month = new Date().getMonth() + 1
    return `${prefix}_${fiscalYear}${month.toString().padStart(2, '0')}`
  }

  private extractMonth(periodId: string): string {
    // p-202606 → 6
    const match = periodId.match(/\d{4}(\d{2})$/)
    return match ? parseInt(match[1], 10).toString() : ''
  }

  private getDepartmentName(stableId: string): string {
    const deptMap: Record<string, string> = {
      'dept-sales': '営業部',
      'dept-dev': '開発部',
      'dept-admin': '管理部',
      'bu-x': 'X事業部',
      'bu-y': 'Y事業部',
    }
    return deptMap[stableId] || stableId
  }
}

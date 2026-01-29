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
  MeetingEventStatus,
  SubmissionStatus,
  KpiCardStatus,
  SubmissionLevel,
  FormFieldType,
  // Phase 2
  SubmissionTrackingDto,
  SubmissionTrackingItemDto,
  RemindSubmissionDto,
  CloseEventDto,
  CloseEventResultDto,
  MeetingMinutesDto,
  SaveMeetingMinutesDto,
} from '@epm/contracts/bff/meetings'

// ========== Mock Data ==========

const mockMeetingTypes = [
  { id: 'mt-1', typeCode: 'MONTHLY_MGMT', typeName: '月次経営会議' },
  { id: 'mt-2', typeCode: 'QUARTERLY_MGMT', typeName: '四半期経営会議' },
  { id: 'mt-3', typeCode: 'BOARD_MEETING', typeName: '取締役会' },
]

// 階層組織ツリー（報告対象フラグ付き）
const mockOrgTreeWithSubmission: OrgNodeWithSubmission[] = [
  {
    id: 'corp',
    name: '株式会社サンプル',
    isReportingTarget: false, // 会社全体は報告対象外
    children: [
      {
        id: 'bu-x',
        name: 'X事業部',
        isReportingTarget: true,
        submissionLevel: 'BU' as SubmissionLevel,
        submissionStatus: 'SUBMITTED' as SubmissionStatus,
        submittedAt: '2026-06-08T16:00:00+09:00',
        submittedByName: '鈴木花子',
        children: [
          {
            id: 'dept-sales',
            name: '営業部',
            isReportingTarget: true,
            submissionLevel: 'DEPARTMENT' as SubmissionLevel,
            submissionStatus: 'SUBMITTED' as SubmissionStatus,
            submittedAt: '2026-06-10T14:00:00+09:00',
            submittedByName: '山田太郎',
          },
          {
            id: 'dept-dev',
            name: '開発部',
            isReportingTarget: true,
            submissionLevel: 'DEPARTMENT' as SubmissionLevel,
            submissionStatus: 'DRAFT' as SubmissionStatus,
          },
          {
            id: 'dept-support',
            name: 'サポート部',
            isReportingTarget: false, // 報告対象外
          },
        ],
      },
      {
        id: 'bu-y',
        name: 'Y事業部',
        isReportingTarget: true,
        submissionLevel: 'BU' as SubmissionLevel,
        submissionStatus: 'DRAFT' as SubmissionStatus,
        children: [
          {
            id: 'dept-product',
            name: 'プロダクト部',
            isReportingTarget: true,
            submissionLevel: 'DEPARTMENT' as SubmissionLevel,
            submissionStatus: 'NOT_STARTED' as SubmissionStatus,
          },
          {
            id: 'dept-marketing',
            name: 'マーケティング部',
            isReportingTarget: true,
            submissionLevel: 'DEPARTMENT' as SubmissionLevel,
            submissionStatus: 'DRAFT' as SubmissionStatus,
          },
        ],
      },
      {
        id: 'admin-div',
        name: '管理本部',
        isReportingTarget: false, // 本部は報告対象外
        children: [
          {
            id: 'dept-admin',
            name: '管理部',
            isReportingTarget: true,
            submissionLevel: 'DEPARTMENT' as SubmissionLevel,
            submissionStatus: 'NOT_STARTED' as SubmissionStatus,
          },
          {
            id: 'dept-hr',
            name: '人事部',
            isReportingTarget: false, // 報告対象外
          },
          {
            id: 'dept-finance',
            name: '経理部',
            isReportingTarget: false, // 報告対象外
          },
        ],
      },
    ],
  },
]

const mockEvents: MeetingEventDto[] = [
  {
    id: 'evt-001',
    eventCode: 'MTG_202606',
    eventName: '6月度経営会議',
    meetingTypeId: 'mt-1',
    meetingTypeName: '月次経営会議',
    reportLayoutId: 'layout-1',
    targetPeriodId: 'p-202606',
    targetPeriodName: '2026年6月度',
    targetFiscalYear: 2026,
    status: 'COLLECTING' as MeetingEventStatus,
    submissionDeadline: '2026-06-15T17:00:00+09:00',
    distributionDate: '2026-06-18T09:00:00+09:00',
    meetingDate: '2026-06-25T14:00:00+09:00',
    createdAt: '2026-06-01T10:00:00+09:00',
    updatedAt: '2026-06-10T15:30:00+09:00',
  },
  {
    id: 'evt-002',
    eventCode: 'MTG_202605',
    eventName: '5月度経営会議',
    meetingTypeId: 'mt-1',
    meetingTypeName: '月次経営会議',
    reportLayoutId: 'layout-1',
    targetPeriodId: 'p-202605',
    targetPeriodName: '2026年5月度',
    targetFiscalYear: 2026,
    status: 'CLOSED' as MeetingEventStatus,
    submissionDeadline: '2026-05-15T17:00:00+09:00',
    distributionDate: '2026-05-18T09:00:00+09:00',
    meetingDate: '2026-05-25T14:00:00+09:00',
    createdAt: '2026-05-01T10:00:00+09:00',
    updatedAt: '2026-05-26T10:00:00+09:00',
  },
  {
    id: 'evt-003',
    eventCode: 'MTG_2026Q1',
    eventName: '2026年度第1四半期経営会議',
    meetingTypeId: 'mt-2',
    meetingTypeName: '四半期経営会議',
    reportLayoutId: 'layout-3',
    targetPeriodId: 'p-2026Q1',
    targetPeriodName: '2026年度Q1',
    targetFiscalYear: 2026,
    status: 'DISTRIBUTED' as MeetingEventStatus,
    submissionDeadline: '2026-04-10T17:00:00+09:00',
    distributionDate: '2026-04-15T09:00:00+09:00',
    meetingDate: '2026-04-20T10:00:00+09:00',
    createdAt: '2026-04-01T10:00:00+09:00',
    updatedAt: '2026-04-16T14:00:00+09:00',
  },
  {
    id: 'evt-004',
    eventCode: 'MTG_202607',
    eventName: '7月度経営会議',
    meetingTypeId: 'mt-1',
    meetingTypeName: '月次経営会議',
    reportLayoutId: 'layout-1',
    targetPeriodId: 'p-202607',
    targetPeriodName: '2026年7月度',
    targetFiscalYear: 2026,
    status: 'DRAFT' as MeetingEventStatus,
    submissionDeadline: '2026-07-15T17:00:00+09:00',
    meetingDate: '2026-07-25T14:00:00+09:00',
    createdAt: '2026-06-20T10:00:00+09:00',
    updatedAt: '2026-06-20T10:00:00+09:00',
  },
  {
    id: 'evt-005',
    eventCode: 'MTG_202604',
    eventName: '4月度経営会議',
    meetingTypeId: 'mt-1',
    meetingTypeName: '月次経営会議',
    reportLayoutId: 'layout-1',
    targetPeriodId: 'p-202604',
    targetPeriodName: '2026年4月度',
    targetFiscalYear: 2026,
    status: 'ARCHIVED' as MeetingEventStatus,
    submissionDeadline: '2026-04-15T17:00:00+09:00',
    meetingDate: '2026-04-25T14:00:00+09:00',
    createdAt: '2026-04-01T10:00:00+09:00',
    updatedAt: '2026-05-01T10:00:00+09:00',
  },
]

const mockSubmissionStatus: Record<string, SubmissionStatusSummaryDto> = {
  'evt-001': {
    items: [
      {
        departmentStableId: 'dept-sales',
        departmentName: '営業部',
        submissionLevel: 'DEPARTMENT',
        status: 'SUBMITTED' as SubmissionStatus,
        submittedAt: '2026-06-10T14:00:00+09:00',
        submittedByName: '山田太郎',
        lastUpdatedAt: '2026-06-10T14:00:00+09:00',
      },
      {
        departmentStableId: 'dept-dev',
        departmentName: '開発部',
        submissionLevel: 'DEPARTMENT',
        status: 'DRAFT' as SubmissionStatus,
        lastUpdatedAt: '2026-06-12T10:00:00+09:00',
      },
      {
        departmentStableId: 'dept-admin',
        departmentName: '管理部',
        submissionLevel: 'DEPARTMENT',
        status: 'NOT_STARTED' as SubmissionStatus,
        lastUpdatedAt: '2026-06-01T10:00:00+09:00',
      },
      {
        departmentStableId: 'bu-x',
        departmentName: 'X事業部',
        submissionLevel: 'BU',
        status: 'SUBMITTED' as SubmissionStatus,
        submittedAt: '2026-06-08T16:00:00+09:00',
        submittedByName: '鈴木花子',
        lastUpdatedAt: '2026-06-08T16:00:00+09:00',
      },
      {
        departmentStableId: 'bu-y',
        departmentName: 'Y事業部',
        submissionLevel: 'BU',
        status: 'DRAFT' as SubmissionStatus,
        lastUpdatedAt: '2026-06-11T09:00:00+09:00',
      },
    ],
    summary: {
      total: 5,
      notStarted: 1,
      draft: 2,
      submitted: 2,
      submissionRate: 40,
    },
  },
}

const mockKpiCards: KpiCardListDto = {
  items: [
    {
      subjectId: 'subj-001',
      subjectName: '売上高',
      budget: 500000000,
      actual: 320000000,
      forecast: 180000000,
      achievementRate: 100,
      status: 'SUCCESS' as KpiCardStatus,
      variance: 0,
      varianceRate: 0,
      unit: '円',
      formatType: 'currency',
    },
    {
      subjectId: 'subj-002',
      subjectName: '売上総利益',
      budget: 200000000,
      actual: 125000000,
      forecast: 65000000,
      achievementRate: 95,
      status: 'WARNING' as KpiCardStatus,
      variance: -10000000,
      varianceRate: -5,
      unit: '円',
      formatType: 'currency',
    },
    {
      subjectId: 'subj-003',
      subjectName: '営業利益',
      budget: 80000000,
      actual: 40000000,
      forecast: 32000000,
      achievementRate: 90,
      status: 'ERROR' as KpiCardStatus,
      variance: -8000000,
      varianceRate: -10,
      unit: '円',
      formatType: 'currency',
    },
    {
      subjectId: 'subj-004',
      subjectName: '新規顧客数',
      budget: 100,
      actual: 65,
      forecast: 40,
      achievementRate: 105,
      status: 'SUCCESS' as KpiCardStatus,
      variance: 5,
      varianceRate: 5,
      unit: '件',
      formatType: 'number',
    },
  ],
}

// Form field mappings for each meeting type (mt-1, mt-2, mt-3)
const mockFormFieldsByMeetingType: Record<string, Array<{ fieldId: string; fieldCode: string; fieldName: string; fieldType: string; sectionCode: string; sectionName: string; isRequired: boolean }>> = {
  'mt-1': [ // 月次経営会議
    { fieldId: 'f-1-1', fieldCode: 'SALES_OUTLOOK', fieldName: '売上見通し', fieldType: 'SELECT', sectionCode: 'SEC1', sectionName: '業績サマリー', isRequired: true },
    { fieldId: 'f-1-2', fieldCode: 'PROFIT_OUTLOOK', fieldName: '利益見通し', fieldType: 'SELECT', sectionCode: 'SEC1', sectionName: '業績サマリー', isRequired: true },
    { fieldId: 'f-1-3', fieldCode: 'SUMMARY_COMMENT', fieldName: 'サマリーコメント', fieldType: 'TEXTAREA', sectionCode: 'SEC1', sectionName: '業績サマリー', isRequired: true },
    { fieldId: 'f-1-4', fieldCode: 'SALES_VARIANCE', fieldName: '売上差異の主要因', fieldType: 'TEXTAREA', sectionCode: 'SEC2', sectionName: '差異要因', isRequired: true },
    { fieldId: 'f-1-5', fieldCode: 'GROSS_PROFIT_VARIANCE', fieldName: '粗利差異の主要因', fieldType: 'TEXTAREA', sectionCode: 'SEC2', sectionName: '差異要因', isRequired: true },
    { fieldId: 'f-1-6', fieldCode: 'RISK_ITEMS', fieldName: 'リスク項目', fieldType: 'TEXTAREA', sectionCode: 'SEC3', sectionName: 'リスク・課題', isRequired: false },
    { fieldId: 'f-1-7', fieldCode: 'ACTION_ITEMS', fieldName: 'アクション項目', fieldType: 'TEXTAREA', sectionCode: 'SEC4', sectionName: 'アクション', isRequired: true },
  ],
  'mt-2': [ // 四半期経営会議
    { fieldId: 'f-2-1', fieldCode: 'QUARTERLY_SUMMARY', fieldName: '四半期サマリー', fieldType: 'TEXTAREA', sectionCode: 'SEC1', sectionName: 'サマリー', isRequired: true },
    { fieldId: 'f-2-2', fieldCode: 'STRATEGIC_ANALYSIS', fieldName: '戦略分析', fieldType: 'TEXTAREA', sectionCode: 'SEC1', sectionName: 'サマリー', isRequired: true },
    { fieldId: 'f-2-3', fieldCode: 'BUDGET_VARIANCE_DETAIL', fieldName: '予算差異詳細', fieldType: 'TEXTAREA', sectionCode: 'SEC2', sectionName: '差異分析', isRequired: true },
    { fieldId: 'f-2-4', fieldCode: 'STRATEGIC_RISKS', fieldName: '戦略的リスク', fieldType: 'TEXTAREA', sectionCode: 'SEC3', sectionName: '戦略課題', isRequired: false },
    { fieldId: 'f-2-5', fieldCode: 'STRATEGIC_ACTIONS', fieldName: '戦略アクション', fieldType: 'TEXTAREA', sectionCode: 'SEC4', sectionName: 'アクション', isRequired: true },
  ],
  'mt-3': [ // 取締役会
    { fieldId: 'f-3-1', fieldCode: 'BOARD_SUMMARY', fieldName: 'エグゼクティブサマリー', fieldType: 'TEXTAREA', sectionCode: 'SEC1', sectionName: 'サマリー', isRequired: true },
    { fieldId: 'f-3-2', fieldCode: 'KEY_DECISIONS', fieldName: '主要決定事項', fieldType: 'TEXTAREA', sectionCode: 'SEC2', sectionName: '決定事項', isRequired: true },
    { fieldId: 'f-3-3', fieldCode: 'BOARD_RISKS', fieldName: 'ガバナンスリスク', fieldType: 'TEXTAREA', sectionCode: 'SEC3', sectionName: 'リスク', isRequired: false },
  ],
}

// ========== MockBffClient Implementation ==========

export class MockBffClient implements BffClient {
  // ========== Meeting Events ==========

  async getEvents(query: GetMeetingEventsQueryDto): Promise<MeetingEventListDto> {
    await this.delay(300)

    let filtered = [...mockEvents]

    // Filter by keyword
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.eventName.toLowerCase().includes(keyword) ||
          e.eventCode.toLowerCase().includes(keyword),
      )
    }

    // Filter by meetingTypeId
    if (query.meetingTypeId) {
      filtered = filtered.filter((e) => e.meetingTypeId === query.meetingTypeId)
    }

    // Filter by status
    if (query.status) {
      filtered = filtered.filter((e) => e.status === query.status)
    }

    // Filter by fiscalYear
    if (query.fiscalYear) {
      filtered = filtered.filter((e) => e.targetFiscalYear === query.fiscalYear)
    }

    // Sort
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof MeetingEventDto] ?? ''
      const bVal = b[sortBy as keyof MeetingEventDto] ?? ''
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Pagination
    const page = query.page || 1
    const pageSize = Math.min(query.pageSize || 20, 100)
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return {
      items: paged,
      page,
      pageSize,
      totalCount: filtered.length,
    }
  }

  async getEventById(id: string): Promise<MeetingEventDto> {
    await this.delay(200)

    const event = mockEvents.find((e) => e.id === id)
    if (!event) {
      throw new Error(`Meeting event not found: ${id}`)
    }
    return event
  }

  async createEvent(data: CreateMeetingEventDto): Promise<MeetingEventDto> {
    await this.delay(500)

    const meetingType = mockMeetingTypes.find((t) => t.id === data.meetingTypeId)
    const now = new Date().toISOString()

    const newEvent: MeetingEventDto = {
      id: `evt-${Date.now()}`,
      eventCode: `MTG_${data.targetFiscalYear}${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      eventName: data.eventName,
      meetingTypeId: data.meetingTypeId,
      meetingTypeName: meetingType?.typeName || '不明',
      targetPeriodId: data.targetPeriodId,
      targetPeriodName: data.targetPeriodId
        ? `${data.targetFiscalYear}年${this.extractMonth(data.targetPeriodId)}月度`
        : undefined,
      targetFiscalYear: data.targetFiscalYear,
      status: 'DRAFT' as MeetingEventStatus,
      submissionDeadline: data.submissionDeadline,
      distributionDate: data.distributionDate,
      meetingDate: data.meetingDate,
      reportLayoutId: data.reportLayoutId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }

    mockEvents.unshift(newEvent)
    return newEvent
  }

  async updateEvent(id: string, data: UpdateMeetingEventDto): Promise<MeetingEventDto> {
    await this.delay(400)

    const event = mockEvents.find((e) => e.id === id)
    if (!event) {
      throw new Error(`Meeting event not found: ${id}`)
    }

    Object.assign(event, {
      ...data,
      updatedAt: new Date().toISOString(),
    })

    return event
  }

  async updateEventStatus(
    id: string,
    data: UpdateMeetingEventStatusDto,
  ): Promise<MeetingEventDto> {
    await this.delay(400)

    const event = mockEvents.find((e) => e.id === id)
    if (!event) {
      throw new Error(`Meeting event not found: ${id}`)
    }

    event.status = data.status
    event.updatedAt = new Date().toISOString()

    return event
  }

  // ========== Submission Status ==========

  async getSubmissionStatus(eventId: string): Promise<SubmissionStatusSummaryDto> {
    await this.delay(300)

    // 特定イベント用のデータがあれば返す
    const status = mockSubmissionStatus[eventId]
    if (status) {
      return status
    }

    // デフォルトの提出状況（全イベント共通）
    return {
      items: [
        {
          departmentStableId: 'dept-sales',
          departmentName: '営業部',
          submissionLevel: 'DEPARTMENT',
          status: 'SUBMITTED' as SubmissionStatus,
          submittedAt: '2026-06-10T14:00:00+09:00',
          submittedByName: '山田太郎',
          lastUpdatedAt: '2026-06-10T14:00:00+09:00',
        },
        {
          departmentStableId: 'dept-dev',
          departmentName: '開発部',
          submissionLevel: 'DEPARTMENT',
          status: 'DRAFT' as SubmissionStatus,
          lastUpdatedAt: '2026-06-12T10:00:00+09:00',
        },
        {
          departmentStableId: 'dept-admin',
          departmentName: '管理部',
          submissionLevel: 'DEPARTMENT',
          status: 'NOT_STARTED' as SubmissionStatus,
          lastUpdatedAt: '2026-06-01T10:00:00+09:00',
        },
      ],
      summary: {
        total: 3,
        notStarted: 1,
        draft: 1,
        submitted: 1,
        submissionRate: 33,
      },
    }
  }

  // ========== Submissions ==========

  async getSubmission(
    eventId: string,
    departmentStableId: string,
  ): Promise<MeetingSubmissionDto> {
    await this.delay(300)

    // Get event to determine meeting type
    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error(`Meeting event not found: ${eventId}`)
    }

    // Get form fields for this meeting type
    const formFields = mockFormFieldsByMeetingType[event.meetingTypeId] || mockFormFieldsByMeetingType['mt-1']

    // Return empty form for new submission
    return {
      id: '',
      meetingEventId: eventId,
      submissionLevel: 'DEPARTMENT',
      departmentStableId,
      departmentName: this.getDepartmentName(departmentStableId),
      status: 'NOT_STARTED' as SubmissionStatus,
      values: formFields.map((f) => ({
        id: '',
        fieldId: f.fieldId,
        fieldCode: f.fieldCode,
        fieldName: f.fieldName,
        fieldType: f.fieldType as FormFieldType,
        sectionCode: f.sectionCode,
        sectionName: f.sectionName,
        isRequired: f.isRequired,
        valueText: undefined,
        valueNumber: undefined,
        valueDate: undefined,
        valueJson: undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async saveSubmission(data: SaveSubmissionDto): Promise<MeetingSubmissionDto> {
    await this.delay(500)

    const now = new Date().toISOString()

    return {
      id: `sub-${Date.now()}`,
      meetingEventId: data.meetingEventId,
      submissionLevel: data.submissionLevel,
      departmentStableId: data.departmentStableId,
      departmentName: this.getDepartmentName(data.departmentStableId || ''),
      status: 'DRAFT' as SubmissionStatus,
      values: data.values.map((v) => ({
        id: `val-${Date.now()}`,
        fieldId: v.fieldId,
        fieldCode: '',
        fieldName: '',
        fieldType: 'TEXT' as const,
        sectionCode: '',
        sectionName: '',
        isRequired: false,
        valueText: v.valueText,
        valueNumber: v.valueNumber,
        valueDate: v.valueDate,
        valueJson: v.valueJson,
      })),
      createdAt: now,
      updatedAt: now,
    }
  }

  async submitSubmission(id: string): Promise<MeetingSubmissionDto> {
    await this.delay(400)

    const now = new Date().toISOString()

    return {
      id,
      meetingEventId: '',
      submissionLevel: 'DEPARTMENT',
      status: 'SUBMITTED' as SubmissionStatus,
      submittedAt: now,
      submittedBy: 'current-user',
      values: [],
      createdAt: now,
      updatedAt: now,
    }
  }

  // ========== KPI Cards ==========

  async getKpiCards(
    _eventId: string,
    _departmentStableId?: string,
  ): Promise<KpiCardListDto> {
    await this.delay(300)
    return mockKpiCards
  }

  // ========== Organization Tree with Submission Status ==========

  async getOrgTreeWithSubmission(_eventId: string): Promise<OrgNodeWithSubmission[]> {
    await this.delay(300)
    return mockOrgTreeWithSubmission
  }

  // ========== Phase 2: B3 登録状況管理 ==========

  async getSubmissionTracking(eventId: string): Promise<SubmissionTrackingDto> {
    await this.delay(300)

    const mockTrackingItems: SubmissionTrackingItemDto[] = [
      {
        departmentStableId: 'dept-sales',
        departmentName: '営業部',
        level: 'DEPARTMENT' as SubmissionLevel,
        status: 'SUBMITTED' as SubmissionStatus,
        submittedAt: '2026-06-10T14:00:00+09:00',
        submittedBy: '田中太郎',
        isOverdue: false,
      },
      {
        departmentStableId: 'dept-dev',
        departmentName: '開発部',
        level: 'DEPARTMENT' as SubmissionLevel,
        status: 'DRAFT' as SubmissionStatus,
        isOverdue: false,
        lastRemindedAt: '2026-06-12T10:00:00+09:00',
      },
      {
        departmentStableId: 'dept-admin',
        departmentName: '管理部',
        level: 'DEPARTMENT' as SubmissionLevel,
        status: 'NOT_STARTED' as SubmissionStatus,
        isOverdue: true,
        lastRemindedAt: '2026-06-12T10:00:00+09:00',
      },
      {
        departmentStableId: 'bu-x',
        departmentName: 'X事業部',
        level: 'BU' as SubmissionLevel,
        status: 'SUBMITTED' as SubmissionStatus,
        submittedAt: '2026-06-09T16:00:00+09:00',
        submittedBy: '山田部長',
        isOverdue: false,
      },
      {
        departmentStableId: 'bu-y',
        departmentName: 'Y事業部',
        level: 'BU' as SubmissionLevel,
        status: 'DRAFT' as SubmissionStatus,
        isOverdue: false,
      },
    ]

    return {
      eventId,
      items: mockTrackingItems,
      summary: {
        total: 5,
        submitted: 2,
        draft: 2,
        notStarted: 1,
        overdue: 1,
      },
    }
  }

  async remindSubmission(
    eventId: string,
    data: RemindSubmissionDto,
  ): Promise<void> {
    await this.delay(500)
    console.log(`[Mock] Remind sent for event ${eventId} to departments:`, data.departmentStableIds)
  }

  // ========== Phase 2: B4 会議クローズ ==========

  async closeEvent(
    eventId: string,
    data: CloseEventDto,
  ): Promise<CloseEventResultDto> {
    await this.delay(500)

    const event = mockEvents.find((e) => e.id === eventId)
    if (event) {
      event.status = 'CLOSED'
      event.updatedAt = new Date().toISOString()
    }

    return {
      eventId,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      snapshotIds: data.includeSnapshot && data.snapshotTypes
        ? data.snapshotTypes.map((type) => `snapshot-${eventId}-${type}`)
        : undefined,
    }
  }

  // ========== Phase 2: B5 議事録 ==========

  private mockMinutes: Map<string, MeetingMinutesDto> = new Map()

  async getMinutes(eventId: string): Promise<MeetingMinutesDto> {
    await this.delay(300)

    if (this.mockMinutes.has(eventId)) {
      return this.mockMinutes.get(eventId)!
    }

    // デフォルトの空議事録を返す
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

  async saveMinutes(
    eventId: string,
    data: SaveMeetingMinutesDto,
  ): Promise<MeetingMinutesDto> {
    await this.delay(500)

    const now = new Date().toISOString()
    const existing = this.mockMinutes.get(eventId)

    const minutes: MeetingMinutesDto = {
      id: existing?.id || `min-${Date.now()}`,
      eventId,
      content: data.content,
      decisions: data.decisions,
      attendees: data.attendees,
      attachments: existing?.attachments || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      createdBy: existing?.createdBy || 'current-user',
      updatedBy: 'current-user',
    }

    this.mockMinutes.set(eventId, minutes)
    return minutes
  }

  // ========== Utility Methods ==========

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private extractMonth(periodId: string): string {
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

import type {
  MeetingEventDto,
  SubmissionStatusDto,
  MeetingSubmissionDto,
  MeetingSubmissionValueDto,
  KpiCardDto,
  // Phase 2 types
  SubmissionTrackingItemDto,
  MeetingMinutesDto,
} from '@epm/contracts/bff/meetings'

/**
 * モック会議種別
 */
export const MOCK_MEETING_TYPES = [
  { id: 'mt-001', typeCode: 'MONTHLY_MGMT', typeName: '月次経営会議' },
  { id: 'mt-002', typeCode: 'BOARD', typeName: '取締役会' },
  { id: 'mt-003', typeCode: 'BU_REVIEW', typeName: '事業部レビュー' },
]

/**
 * モック会議イベント
 */
export const MOCK_MEETING_EVENTS: MeetingEventDto[] = [
  {
    id: 'evt-001',
    eventCode: 'MTG_202606',
    eventName: '6月度経営会議',
    meetingTypeId: 'mt-001',
    meetingTypeName: '月次経営会議',
    targetPeriodId: 'p-202606',
    targetPeriodName: '2026年6月度',
    targetFiscalYear: 2026,
    status: 'OPEN',
    submissionDeadline: '2026-06-10',
    distributionDate: '2026-06-12',
    meetingDate: '2026-06-15',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'evt-002',
    eventCode: 'MTG_202605',
    eventName: '5月度経営会議',
    meetingTypeId: 'mt-001',
    meetingTypeName: '月次経営会議',
    targetPeriodId: 'p-202605',
    targetPeriodName: '2026年5月度',
    targetFiscalYear: 2026,
    status: 'CLOSED',
    submissionDeadline: '2026-05-10',
    distributionDate: '2026-05-12',
    meetingDate: '2026-05-15',
    minutesText: '# 5月度経営会議 議事録\n\n## 決定事項\n- 売上目標の上方修正\n- 新規プロジェクト承認',
    minutesRecordedAt: '2026-05-15T18:00:00Z',
    minutesRecordedBy: 'user-001',
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-05-15T18:00:00Z',
  },
  {
    id: 'evt-003',
    eventCode: 'MTG_202604',
    eventName: '4月度経営会議',
    meetingTypeId: 'mt-001',
    meetingTypeName: '月次経営会議',
    targetPeriodId: 'p-202604',
    targetPeriodName: '2026年4月度',
    targetFiscalYear: 2026,
    status: 'ARCHIVED',
    submissionDeadline: '2026-04-10',
    meetingDate: '2026-04-15',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 'evt-004',
    eventCode: 'MTG_202607',
    eventName: '7月度経営会議',
    meetingTypeId: 'mt-001',
    meetingTypeName: '月次経営会議',
    targetPeriodId: 'p-202607',
    targetPeriodName: '2026年7月度',
    targetFiscalYear: 2026,
    status: 'DRAFT',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'evt-005',
    eventCode: 'BOARD_2026Q2',
    eventName: '2026年度 Q2 取締役会',
    meetingTypeId: 'mt-002',
    meetingTypeName: '取締役会',
    targetFiscalYear: 2026,
    status: 'COLLECTING',
    submissionDeadline: '2026-06-20',
    meetingDate: '2026-06-25',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
]

/**
 * モック部門
 */
export const MOCK_DEPARTMENTS = [
  { stableId: 'dept-sales', name: '営業部', level: 'DEPARTMENT' },
  { stableId: 'dept-dev', name: '開発部', level: 'DEPARTMENT' },
  { stableId: 'dept-admin', name: '管理部', level: 'DEPARTMENT' },
  { stableId: 'bu-x', name: 'X事業部', level: 'BU' },
  { stableId: 'bu-y', name: 'Y事業部', level: 'BU' },
]

/**
 * モック提出状況
 */
export const MOCK_SUBMISSION_STATUS: Record<string, SubmissionStatusDto[]> = {
  'evt-001': [
    {
      departmentStableId: 'dept-sales',
      departmentName: '営業部',
      submissionLevel: 'DEPARTMENT',
      status: 'SUBMITTED',
      assigneeName: '田中太郎',
      submittedAt: '2026-06-08T14:30:00Z',
      submittedByName: '田中太郎',
      lastUpdatedAt: '2026-06-08T14:30:00Z',
    },
    {
      departmentStableId: 'dept-dev',
      departmentName: '開発部',
      submissionLevel: 'DEPARTMENT',
      status: 'DRAFT',
      assigneeName: '鈴木花子',
      lastUpdatedAt: '2026-06-07T10:00:00Z',
    },
    {
      departmentStableId: 'dept-admin',
      departmentName: '管理部',
      submissionLevel: 'DEPARTMENT',
      status: 'NOT_STARTED',
      assigneeName: '佐藤次郎',
    },
    {
      departmentStableId: 'bu-x',
      departmentName: 'X事業部',
      submissionLevel: 'BU',
      status: 'NOT_STARTED',
      assigneeName: '山田部長',
    },
    {
      departmentStableId: 'bu-y',
      departmentName: 'Y事業部',
      submissionLevel: 'BU',
      status: 'NOT_STARTED',
      assigneeName: '高橋部長',
    },
  ],
}

/**
 * モックフォーム項目
 */
export const MOCK_FORM_FIELDS: MeetingSubmissionValueDto[] = [
  {
    id: 'val-001',
    fieldId: 'field-001',
    fieldCode: 'sales_outlook',
    fieldName: '売上見通し',
    fieldType: 'SELECT',
    sectionCode: 'summary',
    sectionName: '業績サマリー',
    isRequired: true,
    valueText: 'ON_TRACK',
  },
  {
    id: 'val-002',
    fieldId: 'field-002',
    fieldCode: 'profit_outlook',
    fieldName: '利益見通し',
    fieldType: 'SELECT',
    sectionCode: 'summary',
    sectionName: '業績サマリー',
    isRequired: true,
    valueText: 'CONCERN',
  },
  {
    id: 'val-003',
    fieldId: 'field-003',
    fieldCode: 'summary_comment',
    fieldName: 'サマリーコメント',
    fieldType: 'TEXTAREA',
    sectionCode: 'summary',
    sectionName: '業績サマリー',
    isRequired: true,
    valueText: '売上は計画通りに推移していますが、原価高騰の影響で利益率が低下傾向にあります。',
  },
  {
    id: 'val-004',
    fieldId: 'field-004',
    fieldCode: 'sales_variance_reason',
    fieldName: '売上差異の主要因',
    fieldType: 'TEXTAREA',
    sectionCode: 'variance',
    sectionName: '差異要因',
    isRequired: true,
    valueText: '新規顧客の獲得が順調で、計画比+5%で推移。',
  },
  {
    id: 'val-005',
    fieldId: 'field-005',
    fieldCode: 'gross_profit_variance_reason',
    fieldName: '粗利差異の主要因',
    fieldType: 'TEXTAREA',
    sectionCode: 'variance',
    sectionName: '差異要因',
    isRequired: true,
    valueText: '原材料費の高騰により、計画比-3%。',
  },
  {
    id: 'val-006',
    fieldId: 'field-006',
    fieldCode: 'key_actions',
    fieldName: '今月の重点施策',
    fieldType: 'TEXTAREA',
    sectionCode: 'action',
    sectionName: 'アクション',
    isRequired: true,
    valueText: '1. 新規案件のクロージング強化\n2. コスト削減施策の検討',
  },
]

/**
 * モック部門報告
 */
export const MOCK_SUBMISSIONS: Record<string, MeetingSubmissionDto> = {
  'evt-001_dept-sales': {
    id: 'sub-001',
    meetingEventId: 'evt-001',
    submissionLevel: 'DEPARTMENT',
    departmentStableId: 'dept-sales',
    departmentName: '営業部',
    status: 'SUBMITTED',
    submittedAt: '2026-06-08T14:30:00Z',
    submittedBy: 'user-tanaka',
    submittedByName: '田中太郎',
    values: MOCK_FORM_FIELDS,
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-06-08T14:30:00Z',
  },
}

/**
 * モックKPIカード
 */
export const MOCK_KPI_CARDS: KpiCardDto[] = [
  {
    subjectId: 'subj-sales',
    subjectName: '売上高',
    budget: 120000000,
    actual: 58000000,
    forecast: 95000000,
    achievementRate: 127.5,
    status: 'SUCCESS',
    variance: 33000000,
    varianceRate: 27.5,
    unit: '円',
    formatType: 'currency',
  },
  {
    subjectId: 'subj-gross',
    subjectName: '粗利',
    budget: 40000000,
    actual: 18000000,
    forecast: 32000000,
    achievementRate: 125.0,
    status: 'SUCCESS',
    variance: 10000000,
    varianceRate: 25.0,
    unit: '円',
    formatType: 'currency',
  },
  {
    subjectId: 'subj-op',
    subjectName: '営業利益',
    budget: 15000000,
    actual: 6000000,
    forecast: 11000000,
    achievementRate: 113.3,
    status: 'WARNING',
    variance: 2000000,
    varianceRate: 13.3,
    unit: '円',
    formatType: 'currency',
  },
  {
    subjectId: 'subj-rate',
    subjectName: '見込達成率',
    budget: 100,
    actual: 85,
    forecast: 95,
    achievementRate: 95.0,
    status: 'WARNING',
    variance: -5,
    varianceRate: -5.0,
    unit: '%',
    formatType: 'percentage',
  },
]

// ==================== Phase 2 Mock Data ====================

/**
 * モック登録状況詳細（B3用）
 */
export const MOCK_SUBMISSION_TRACKING: Record<string, SubmissionTrackingItemDto[]> = {
  'evt-001': [
    {
      departmentStableId: 'dept-sales',
      departmentName: '営業部',
      level: 'DEPARTMENT',
      status: 'SUBMITTED',
      submittedAt: '2026-06-08T14:30:00Z',
      submittedBy: '田中太郎',
      isOverdue: false,
    },
    {
      departmentStableId: 'dept-dev',
      departmentName: '開発部',
      level: 'DEPARTMENT',
      status: 'DRAFT',
      isOverdue: false,
      lastRemindedAt: '2026-06-09T10:00:00Z',
    },
    {
      departmentStableId: 'dept-admin',
      departmentName: '管理部',
      level: 'DEPARTMENT',
      status: 'NOT_STARTED',
      isOverdue: true,
      lastRemindedAt: '2026-06-09T10:00:00Z',
    },
    {
      departmentStableId: 'bu-x',
      departmentName: 'X事業部',
      level: 'BU',
      status: 'SUBMITTED',
      submittedAt: '2026-06-09T09:00:00Z',
      submittedBy: '山田部長',
      isOverdue: false,
    },
    {
      departmentStableId: 'bu-y',
      departmentName: 'Y事業部',
      level: 'BU',
      status: 'DRAFT',
      isOverdue: false,
    },
  ],
  'evt-005': [
    {
      departmentStableId: 'dept-sales',
      departmentName: '営業部',
      level: 'DEPARTMENT',
      status: 'DRAFT',
      isOverdue: false,
    },
    {
      departmentStableId: 'dept-dev',
      departmentName: '開発部',
      level: 'DEPARTMENT',
      status: 'NOT_STARTED',
      isOverdue: false,
    },
    {
      departmentStableId: 'bu-x',
      departmentName: 'X事業部',
      level: 'BU',
      status: 'NOT_STARTED',
      isOverdue: false,
    },
  ],
}

/**
 * モック議事録（B5用）
 */
export const MOCK_MEETING_MINUTES: Record<string, MeetingMinutesDto> = {
  'evt-002': {
    id: 'min-001',
    eventId: 'evt-002',
    content: `
<h1>5月度経営会議 議事録</h1>

<h2>1. 業績報告</h2>
<p>各部門から5月度の業績報告がありました。売上は計画比105%と好調に推移しています。</p>

<h2>2. 課題と対策</h2>
<ul>
  <li>原材料費の高騰について、代替サプライヤーの検討を進める</li>
  <li>新規顧客獲得の強化施策を6月中に策定</li>
</ul>

<h2>3. 次月に向けて</h2>
<p>6月度は決算月となるため、各部門は着地見込みの精度向上に努める。</p>
    `.trim(),
    decisions: [
      '売上目標の上方修正を承認（年間計画比+3%）',
      '新規プロジェクトAの開始を承認',
      '原材料費高騰対策として代替サプライヤー調査を実施',
    ],
    attendees: [
      '山田社長',
      '鈴木副社長',
      '田中営業部長',
      '佐藤開発部長',
      '高橋管理部長',
    ],
    attachments: [
      {
        id: 'att-001',
        fileName: '5月度業績サマリー.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        url: '/api/files/att-001',
        uploadedAt: '2026-05-15T17:00:00Z',
        uploadedBy: '経営企画部',
      },
      {
        id: 'att-002',
        fileName: '新規プロジェクトA提案書.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: 2048000,
        url: '/api/files/att-002',
        uploadedAt: '2026-05-15T17:00:00Z',
        uploadedBy: '開発部',
      },
    ],
    createdAt: '2026-05-15T17:00:00Z',
    updatedAt: '2026-05-16T10:00:00Z',
    createdBy: '経営企画部 山本',
    updatedBy: '経営企画部 山本',
  },
}

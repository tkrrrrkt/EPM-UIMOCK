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

// Mock Data
const mockKpiListResponse: BffKpiListResponse = {
  summary: {
    totalKpis: 24,
    overallAchievementRate: 78,
    delayedActionPlans: 3,
    attentionRequired: 5,
  },
  kpiTree: [
    {
      id: 'kpi-001',
      kpiCode: 'KPI001',
      kpiName: '売上高',
      kpiType: 'FINANCIAL',
      hierarchyLevel: 1,
      departmentName: '全社',
      achievementRate: 95,
      unit: '百万円',
      children: [
        {
          id: 'kpi-002',
          kpiCode: 'KPI002',
          kpiName: '新規顧客売上',
          kpiType: 'NON_FINANCIAL',
          hierarchyLevel: 2,
          departmentName: '営業部',
          ownerEmployeeName: '山田部長',
          achievementRate: 88,
          unit: '件',
          children: [],
          actionPlans: [
            {
              id: 'ap-001',
              planName: '新規顧客開拓施策',
              departmentName: '営業1課',
              ownerEmployeeName: '佐藤',
              dueDate: '2026-09-30',
              progressRate: 40,
              isDelayed: false,
            },
          ],
        },
        {
          id: 'kpi-003',
          kpiCode: 'KPI003',
          kpiName: '既存顧客売上',
          kpiType: 'FINANCIAL',
          hierarchyLevel: 2,
          departmentName: '営業部',
          ownerEmployeeName: '鈴木課長',
          achievementRate: 102,
          unit: '百万円',
          children: [],
          actionPlans: [],
        },
      ],
      actionPlans: [],
    },
    {
      id: 'kpi-004',
      kpiCode: 'KPI004',
      kpiName: 'CO2削減率',
      kpiType: 'NON_FINANCIAL',
      hierarchyLevel: 1,
      departmentName: '全社',
      achievementRate: 85,
      unit: '%',
      children: [
        {
          id: 'kpi-005',
          kpiCode: 'KPI005',
          kpiName: '省エネ設備導入率',
          kpiType: 'NON_FINANCIAL',
          hierarchyLevel: 2,
          departmentName: '総務部',
          ownerEmployeeName: '田中部長',
          achievementRate: 80,
          unit: '%',
          children: [],
          actionPlans: [
            {
              id: 'ap-002',
              planName: '設備更新計画',
              departmentName: '総務部',
              ownerEmployeeName: '高橋',
              dueDate: '2026-12-31',
              progressRate: 25,
              isDelayed: true,
            },
          ],
        },
      ],
      actionPlans: [],
    },
    {
      id: 'kpi-006',
      kpiCode: 'KPI006',
      kpiName: '従業員満足度',
      kpiType: 'NON_FINANCIAL',
      hierarchyLevel: 1,
      departmentName: '全社',
      achievementRate: 72,
      unit: '%',
      children: [
        {
          id: 'kpi-007',
          kpiCode: 'KPI007',
          kpiName: '研修参加率',
          kpiType: 'NON_FINANCIAL',
          hierarchyLevel: 2,
          departmentName: '人事部',
          ownerEmployeeName: '伊藤部長',
          achievementRate: 65,
          unit: '%',
          children: [],
          actionPlans: [
            {
              id: 'ap-003',
              planName: 'オンライン研修プログラム導入',
              departmentName: '人事部',
              ownerEmployeeName: '渡辺',
              dueDate: '2026-06-30',
              progressRate: 80,
              isDelayed: false,
            },
          ],
        },
      ],
      actionPlans: [],
    },
  ],
}

const mockKpiDetail: BffKpiDetail = {
  id: 'kpi-002',
  kpiCode: 'KPI002',
  kpiName: '新規顧客売上',
  kpiType: 'NON_FINANCIAL',
  departmentName: '営業部',
  ownerEmployeeName: '山田部長',
  unit: '件',
  factAmounts: [
    {
      id: 'fact-001',
      periodCode: 'Q1',
      targetValue: 100,
      actualValue: 88,
      achievementRate: 88,
    },
    {
      id: 'fact-002',
      periodCode: 'Q2',
      targetValue: 120,
      actualValue: undefined,
      achievementRate: undefined,
    },
    {
      id: 'fact-003',
      periodCode: 'Q3',
      targetValue: 130,
      actualValue: undefined,
      achievementRate: undefined,
    },
    {
      id: 'fact-004',
      periodCode: 'Q4',
      targetValue: 150,
      actualValue: undefined,
      achievementRate: undefined,
    },
  ],
  actionPlans: [
    {
      id: 'ap-001',
      planName: '新規顧客開拓施策',
      departmentName: '営業1課',
      ownerEmployeeName: '佐藤',
      dueDate: '2026-09-30',
      progressRate: 40,
      isDelayed: false,
    },
  ],
}

const mockKpiEvents: BffKpiEvent[] = [
  {
    id: 'event-001',
    eventCode: 'KPI-2026',
    eventName: '2026年度 KPI管理',
    fiscalYear: 2026,
    status: 'DRAFT',
  },
  {
    id: 'event-002',
    eventCode: 'KPI-2025',
    eventName: '2025年度 KPI管理',
    fiscalYear: 2025,
    status: 'CONFIRMED',
  },
  {
    id: 'event-003',
    eventCode: 'KPI-2024',
    eventName: '2024年度 KPI管理',
    fiscalYear: 2024,
    status: 'CONFIRMED',
  },
]

const mockKpiItems: BffKpiItem[] = [
  {
    id: 'kpi-001',
    kpiCode: 'KPI001',
    kpiName: '売上高',
    kpiType: 'FINANCIAL',
    hierarchyLevel: 1,
    departmentName: '全社',
  },
  {
    id: 'kpi-002',
    kpiCode: 'KPI002',
    kpiName: '新規顧客売上',
    kpiType: 'NON_FINANCIAL',
    hierarchyLevel: 2,
    parentKpiItemId: 'kpi-001',
    departmentName: '営業部',
    ownerEmployeeName: '山田部長',
  },
  {
    id: 'kpi-003',
    kpiCode: 'KPI003',
    kpiName: '既存顧客売上',
    kpiType: 'FINANCIAL',
    hierarchyLevel: 2,
    parentKpiItemId: 'kpi-001',
    departmentName: '営業部',
    ownerEmployeeName: '鈴木課長',
  },
  {
    id: 'kpi-004',
    kpiCode: 'KPI004',
    kpiName: 'CO2削減率',
    kpiType: 'NON_FINANCIAL',
    hierarchyLevel: 1,
    departmentName: '全社',
  },
  {
    id: 'kpi-005',
    kpiCode: 'KPI005',
    kpiName: '省エネ設備導入率',
    kpiType: 'NON_FINANCIAL',
    hierarchyLevel: 2,
    parentKpiItemId: 'kpi-004',
    departmentName: '総務部',
    ownerEmployeeName: '田中部長',
  },
  {
    id: 'kpi-006',
    kpiCode: 'KPI006',
    kpiName: '営業利益率',
    kpiType: 'METRIC',
    hierarchyLevel: 1,
    departmentName: '全社',
  },
]

const mockSubjects: BffSelectOption[] = [
  { id: 'sub-001', code: 'S001', name: '売上高' },
  { id: 'sub-002', code: 'S002', name: '売上原価' },
  { id: 'sub-003', code: 'S003', name: '営業利益' },
  { id: 'sub-004', code: 'S004', name: '経常利益' },
]

const mockKpiDefinitions: BffSelectOption[] = [
  { id: 'def-001', code: 'D001', name: '新規顧客獲得数' },
  { id: 'def-002', code: 'D002', name: '顧客満足度' },
  { id: 'def-003', code: 'D003', name: 'CO2排出量削減率' },
  { id: 'def-004', code: 'D004', name: '従業員エンゲージメント' },
]

const mockMetrics: BffSelectOption[] = [
  { id: 'met-001', code: 'M001', name: '営業利益率' },
  { id: 'met-002', code: 'M002', name: 'ROE' },
  { id: 'met-003', code: 'M003', name: 'ROIC' },
  { id: 'met-004', code: 'M004', name: '自己資本比率' },
]

const mockDepartments: BffDepartment[] = [
  { stableId: 'dept-001', name: '全社' },
  { stableId: 'dept-002', name: '営業部' },
  { stableId: 'dept-003', name: '営業1課' },
  { stableId: 'dept-004', name: '営業2課' },
  { stableId: 'dept-005', name: '総務部' },
  { stableId: 'dept-006', name: '人事部' },
  { stableId: 'dept-007', name: '経理部' },
]

const mockEmployees: BffEmployee[] = [
  { id: 'emp-001', name: '山田部長' },
  { id: 'emp-002', name: '鈴木課長' },
  { id: 'emp-003', name: '田中部長' },
  { id: 'emp-004', name: '佐藤' },
  { id: 'emp-005', name: '高橋' },
  { id: 'emp-006', name: '伊藤部長' },
  { id: 'emp-007', name: '渡辺' },
]

/**
 * MockBffClient - UI開発用モッククライアント
 *
 * v0-workflow.md準拠:
 * - Phase UI-MOCK: モックデータでUIを先行開発
 * - contracts/bff DTO形状でデータを返却
 */
export class MockBffClient implements BffClient {
  private events = [...mockKpiEvents]
  private items = [...mockKpiItems]

  async getEvents(): Promise<BffKpiEvent[]> {
    return this.events
  }

  async createEvent(request: BffCreateKpiEventRequest): Promise<BffKpiEvent> {
    const newEvent: BffKpiEvent = {
      id: `event-${Date.now()}`,
      eventCode: request.eventCode,
      eventName: request.eventName,
      fiscalYear: request.fiscalYear,
      status: 'DRAFT',
    }
    this.events = [newEvent, ...this.events]
    return newEvent
  }

  async getKpiList(_eventId: string, _departmentStableIds?: string[]): Promise<BffKpiListResponse> {
    return mockKpiListResponse
  }

  async getKpiDetail(_kpiItemId: string): Promise<BffKpiDetail> {
    return mockKpiDetail
  }

  async getKpiItems(_eventId: string): Promise<BffKpiItem[]> {
    return this.items
  }

  async createKpiItem(request: BffCreateKpiItemRequest): Promise<BffKpiItem> {
    const department = mockDepartments.find(d => d.stableId === request.departmentStableId)
    const employee = mockEmployees.find(e => e.id === request.ownerEmployeeId)

    const newItem: BffKpiItem = {
      id: `kpi-${Date.now()}`,
      kpiCode: request.kpiCode,
      kpiName: request.kpiName,
      kpiType: request.kpiType,
      hierarchyLevel: request.hierarchyLevel,
      parentKpiItemId: request.parentKpiItemId,
      departmentStableId: request.departmentStableId,
      departmentName: department?.name,
      ownerEmployeeId: request.ownerEmployeeId,
      ownerEmployeeName: employee?.name,
    }
    this.items = [...this.items, newItem]
    return newItem
  }

  async updateKpiItem(id: string, request: Partial<BffCreateKpiItemRequest>): Promise<BffKpiItem> {
    const index = this.items.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Item not found')

    const department = request.departmentStableId
      ? mockDepartments.find(d => d.stableId === request.departmentStableId)
      : undefined
    const employee = request.ownerEmployeeId
      ? mockEmployees.find(e => e.id === request.ownerEmployeeId)
      : undefined

    const updatedItem: BffKpiItem = {
      ...this.items[index],
      ...request,
      departmentName: department?.name ?? this.items[index].departmentName,
      ownerEmployeeName: employee?.name ?? this.items[index].ownerEmployeeName,
    }
    this.items[index] = updatedItem
    return updatedItem
  }

  async deleteKpiItem(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
  }

  async updateFactAmount(_factId: string, _targetValue?: number, _actualValue?: number): Promise<void> {
    // Mock implementation - in real client, this would call BFF API
  }

  async createPeriod(_kpiItemId: string, _periodCode: string, _targetValue?: number): Promise<void> {
    // Mock implementation
  }

  async createActionPlan(_request: BffCreateActionPlanRequest): Promise<void> {
    // Mock implementation
  }

  async getSelectableSubjects(): Promise<BffSelectOption[]> {
    return mockSubjects
  }

  async getSelectableKpiDefinitions(): Promise<BffSelectOption[]> {
    return mockKpiDefinitions
  }

  async getSelectableMetrics(): Promise<BffSelectOption[]> {
    return mockMetrics
  }

  async getDepartments(): Promise<BffDepartment[]> {
    return mockDepartments
  }

  async getEmployees(): Promise<BffEmployee[]> {
    return mockEmployees
  }
}

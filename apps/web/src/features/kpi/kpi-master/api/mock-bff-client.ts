import type { BffClient } from './bff-client';
import type {
  KpiMasterEventListDto,
  KpiMasterEventDetailDto,
  CreateKpiMasterEventDto,
  GetKpiMasterEventsQueryDto,
  KpiMasterEventDto,
  KpiMasterItemListDto,
  KpiMasterItemDetailDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  GetKpiMasterItemsQueryDto,
  SelectableSubjectListDto,
  SelectableMetricListDto,
  KpiDefinitionListDto,
  CreateKpiDefinitionDto,
  GetKpiDefinitionsQueryDto,
  KpiDefinitionDto,
  CreateKpiFactAmountDto,
  UpdateKpiFactAmountDto,
  KpiFactAmountDto,
  CreateKpiTargetValueDto,
  UpdateKpiTargetValueDto,
  KpiTargetValueDto,
} from '@epm-sdd/contracts/bff/kpi-master';

// ========== Mock Data ==========

const mockEvents: KpiMasterEventDto[] = [
  {
    id: 'kpi-event-001',
    companyId: 'company-001',
    eventCode: 'KPI2026',
    eventName: '2026年度KPI管理',
    fiscalYear: 2026,
    status: 'DRAFT',
    isActive: true,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-20T15:30:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'kpi-event-002',
    companyId: 'company-001',
    eventCode: 'KPI2025',
    eventName: '2025年度KPI管理',
    fiscalYear: 2025,
    status: 'CONFIRMED',
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-04-01T09:00:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-002',
  },
  {
    id: 'kpi-event-003',
    companyId: 'company-001',
    eventCode: 'KPI2024',
    eventName: '2024年度KPI管理',
    fiscalYear: 2024,
    status: 'CONFIRMED',
    isActive: true,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-002',
  },
];

const mockKpiItems: KpiMasterItemDetailDto[] = [
  // Level 1: 財務KPI（売上高）
  {
    id: 'kpi-item-001',
    kpiEventId: 'kpi-event-001',
    parentKpiItemId: undefined,
    kpiCode: 'KPI-001',
    kpiName: '売上高',
    kpiType: 'FINANCIAL',
    hierarchyLevel: 1,
    refSubjectId: 'subject-001',
    refKpiDefinitionId: undefined,
    refMetricId: undefined,
    departmentStableId: undefined,
    departmentName: undefined,
    ownerEmployeeId: 'emp-001',
    ownerName: '山田太郎',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    periodFacts: {
      '2026-Q1': {
        periodCode: '2026-Q1',
        targetValue: 100000000,
        actualValue: 95000000,
        achievementRate: 95.0,
        notes: undefined,
      },
      '2026-Q2': {
        periodCode: '2026-Q2',
        targetValue: 110000000,
        actualValue: undefined,
        achievementRate: undefined,
        notes: undefined,
      },
      '2026-Q3': {
        periodCode: '2026-Q3',
        targetValue: 120000000,
        actualValue: undefined,
        achievementRate: undefined,
        notes: undefined,
      },
    },
    actionPlans: [
      {
        id: 'ap-001',
        planCode: 'AP-2026-001',
        planName: '新規顧客開拓',
        status: 'IN_PROGRESS',
        progress: 45,
      },
      {
        id: 'ap-002',
        planCode: 'AP-2026-002',
        planName: '既存顧客深耕',
        status: 'IN_PROGRESS',
        progress: 60,
      },
    ],
  },
  // Level 2: 財務KPI（製品売上高）
  {
    id: 'kpi-item-002',
    kpiEventId: 'kpi-event-001',
    parentKpiItemId: 'kpi-item-001',
    kpiCode: 'KPI-001-01',
    kpiName: '製品売上高',
    kpiType: 'FINANCIAL',
    hierarchyLevel: 2,
    refSubjectId: 'subject-002',
    refKpiDefinitionId: undefined,
    refMetricId: undefined,
    departmentStableId: 'dept-001',
    departmentName: '営業1部',
    ownerEmployeeId: 'emp-002',
    ownerName: '佐藤花子',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    periodFacts: {
      '2026-Q1': {
        periodCode: '2026-Q1',
        targetValue: 60000000,
        actualValue: 58000000,
        achievementRate: 96.7,
        notes: undefined,
      },
      '2026-Q2': {
        periodCode: '2026-Q2',
        targetValue: 65000000,
        actualValue: undefined,
        achievementRate: undefined,
        notes: undefined,
      },
    },
    actionPlans: [],
  },
  // Level 1: 非財務KPI（顧客満足度）
  {
    id: 'kpi-item-003',
    kpiEventId: 'kpi-event-001',
    parentKpiItemId: undefined,
    kpiCode: 'KPI-002',
    kpiName: '顧客満足度',
    kpiType: 'NON_FINANCIAL',
    hierarchyLevel: 1,
    refSubjectId: undefined,
    refKpiDefinitionId: 'kpi-def-001',
    refMetricId: undefined,
    departmentStableId: undefined,
    departmentName: undefined,
    ownerEmployeeId: 'emp-003',
    ownerName: '鈴木一郎',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-01-16T09:00:00Z',
    updatedAt: '2026-01-16T09:00:00Z',
    periodFacts: {
      '2026-H1': {
        periodCode: '2026-H1',
        targetValue: 85.0,
        actualValue: 87.5,
        achievementRate: 102.9,
        notes: 'NPS向上施策実施中',
      },
      '2026-H2': {
        periodCode: '2026-H2',
        targetValue: 90.0,
        actualValue: undefined,
        achievementRate: undefined,
        notes: undefined,
      },
    },
    actionPlans: [
      {
        id: 'ap-003',
        planCode: 'AP-2026-003',
        planName: 'カスタマーサポート体制強化',
        status: 'IN_PROGRESS',
        progress: 30,
      },
    ],
  },
  // Level 1: 指標KPI（市場シェア）
  {
    id: 'kpi-item-004',
    kpiEventId: 'kpi-event-001',
    parentKpiItemId: undefined,
    kpiCode: 'KPI-003',
    kpiName: '市場シェア',
    kpiType: 'METRIC',
    hierarchyLevel: 1,
    refSubjectId: undefined,
    refKpiDefinitionId: undefined,
    refMetricId: 'metric-001',
    departmentStableId: undefined,
    departmentName: undefined,
    ownerEmployeeId: 'emp-004',
    ownerName: '田中次郎',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-01-17T10:00:00Z',
    updatedAt: '2026-01-17T10:00:00Z',
    periodFacts: {
      '2026-Q1': {
        periodCode: '2026-Q1',
        targetValue: 15.0,
        actualValue: undefined,
        achievementRate: undefined,
        notes: '自動計算（Phase 2実装予定）',
      },
      '2026-Q2': {
        periodCode: '2026-Q2',
        targetValue: 16.0,
        actualValue: undefined,
        achievementRate: undefined,
        notes: '自動計算（Phase 2実装予定）',
      },
    },
    actionPlans: [],
  },
];

const mockSelectableSubjects = {
  subjects: [
    { id: 'subject-001', subjectCode: '1000', subjectName: '売上高', kpiManaged: true },
    { id: 'subject-002', subjectCode: '1010', subjectName: '製品売上高', kpiManaged: true },
    { id: 'subject-003', subjectCode: '1020', subjectName: 'サービス売上高', kpiManaged: true },
    { id: 'subject-004', subjectCode: '3000', subjectName: '売上総利益', kpiManaged: true },
    { id: 'subject-005', subjectCode: '5000', subjectName: '営業利益', kpiManaged: true },
  ],
};

const mockSelectableMetrics = {
  metrics: [
    { id: 'metric-001', metricCode: 'MKT-001', metricName: '市場シェア', kpiManaged: true },
    { id: 'metric-002', metricCode: 'MKT-002', metricName: '市場成長率', kpiManaged: true },
    { id: 'metric-003', metricCode: 'OP-001', metricName: '稼働率', kpiManaged: true },
  ],
};

const mockKpiDefinitions: KpiDefinitionDto[] = [
  {
    id: 'kpi-def-001',
    companyId: 'company-001',
    kpiCode: 'CSAT-001',
    kpiName: '顧客満足度',
    description: 'NPS調査による顧客満足度スコア',
    aggregationMethod: 'AVG',
    direction: 'higher_is_better',
    isActive: true,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
    createdBy: 'user-001',
  },
  {
    id: 'kpi-def-002',
    companyId: 'company-001',
    kpiCode: 'STAFF-001',
    kpiName: '従業員満足度',
    description: '従業員エンゲージメント調査スコア',
    aggregationMethod: 'AVG',
    direction: 'higher_is_better',
    isActive: true,
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-11T10:00:00Z',
    createdBy: 'user-001',
  },
];

// ========== MockBffClient Implementation ==========

export class MockBffClient implements BffClient {
  // ========== KPI Management Events ==========

  async getEvents(query: GetKpiMasterEventsQueryDto): Promise<KpiMasterEventListDto> {
    // Simulate API delay
    await this.delay(300);

    let filtered = [...mockEvents];

    // Filter by keyword
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.eventCode.toLowerCase().includes(keyword) ||
          e.eventName.toLowerCase().includes(keyword),
      );
    }

    // Filter by fiscalYear
    if (query.fiscalYear) {
      filtered = filtered.filter((e) => e.fiscalYear === query.fiscalYear);
    }

    // Filter by status
    if (query.status) {
      filtered = filtered.filter((e) => e.status === query.status);
    }

    // Sort
    const sortBy = query.sortBy || 'eventCode';
    const sortOrder = query.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedEvents = filtered.slice(start, end);

    return {
      events: paginatedEvents,
      page,
      pageSize,
      totalCount: filtered.length,
    };
  }

  async getEventById(id: string): Promise<KpiMasterEventDetailDto> {
    await this.delay(200);

    const event = mockEvents.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event not found: ${id}`);
    }

    // Get items for this event
    const items = mockKpiItems.filter((item) => item.kpiEventId === id);

    return {
      ...event,
      items,
    };
  }

  async createEvent(data: CreateKpiMasterEventDto): Promise<KpiMasterEventDto> {
    await this.delay(500);

    const newEvent: KpiMasterEventDto = {
      id: `kpi-event-${Date.now()}`,
      companyId: data.companyId,
      eventCode: data.eventCode,
      eventName: data.eventName,
      fiscalYear: data.fiscalYear,
      status: 'DRAFT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockEvents.unshift(newEvent);
    return newEvent;
  }

  async confirmEvent(id: string): Promise<KpiMasterEventDto> {
    await this.delay(400);

    const event = mockEvents.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event not found: ${id}`);
    }

    if (event.status === 'CONFIRMED') {
      throw new Error('Event already confirmed');
    }

    event.status = 'CONFIRMED';
    event.updatedAt = new Date().toISOString();

    return event;
  }

  // ========== KPI Items ==========

  async getItems(query: GetKpiMasterItemsQueryDto): Promise<KpiMasterItemListDto> {
    await this.delay(300);

    let filtered = [...mockKpiItems];

    // Filter by kpiEventId (required)
    if (query.kpiEventId) {
      filtered = filtered.filter((item) => item.kpiEventId === query.kpiEventId);
    }

    // Filter by parentKpiItemId
    if (query.parentKpiItemId !== undefined) {
      filtered = filtered.filter((item) => item.parentKpiItemId === query.parentKpiItemId);
    }

    // Filter by kpiType
    if (query.kpiType) {
      filtered = filtered.filter((item) => item.kpiType === query.kpiType);
    }

    // Filter by hierarchyLevel
    if (query.hierarchyLevel) {
      filtered = filtered.filter((item) => item.hierarchyLevel === query.hierarchyLevel);
    }

    // Filter by keyword
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.kpiCode.toLowerCase().includes(keyword) ||
          item.kpiName.toLowerCase().includes(keyword),
      );
    }

    // Sort
    const sortBy = query.sortBy || 'sortOrder';
    const sortOrder = query.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filtered.slice(start, end);

    return {
      items: paginatedItems,
      page,
      pageSize,
      totalCount: filtered.length,
    };
  }

  async getItemById(id: string): Promise<KpiMasterItemDetailDto> {
    await this.delay(200);

    const item = mockKpiItems.find((i) => i.id === id);
    if (!item) {
      throw new Error(`KPI item not found: ${id}`);
    }

    return item;
  }

  async createItem(data: CreateKpiMasterItemDto): Promise<KpiMasterItemDetailDto> {
    await this.delay(500);

    const newItem: KpiMasterItemDetailDto = {
      id: `kpi-item-${Date.now()}`,
      kpiEventId: data.kpiEventId,
      parentKpiItemId: data.parentKpiItemId,
      kpiCode: data.kpiCode,
      kpiName: data.kpiName,
      kpiType: data.kpiType,
      hierarchyLevel: data.hierarchyLevel,
      refSubjectId: data.refSubjectId,
      refKpiDefinitionId: data.refKpiDefinitionId,
      refMetricId: data.refMetricId,
      departmentStableId: data.departmentStableId,
      departmentName: undefined,
      ownerEmployeeId: data.ownerEmployeeId,
      ownerName: undefined,
      sortOrder: data.sortOrder,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      periodFacts: {},
      actionPlans: [],
    };

    mockKpiItems.push(newItem);
    return newItem;
  }

  async updateItem(
    id: string,
    data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    await this.delay(400);

    const item = mockKpiItems.find((i) => i.id === id);
    if (!item) {
      throw new Error(`KPI item not found: ${id}`);
    }

    if (data.kpiName !== undefined) item.kpiName = data.kpiName;
    if (data.departmentStableId !== undefined) item.departmentStableId = data.departmentStableId;
    if (data.ownerEmployeeId !== undefined) item.ownerEmployeeId = data.ownerEmployeeId;
    if (data.sortOrder !== undefined) item.sortOrder = data.sortOrder;

    item.updatedAt = new Date().toISOString();

    return item;
  }

  async deleteItem(id: string): Promise<void> {
    await this.delay(300);

    const index = mockKpiItems.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`KPI item not found: ${id}`);
    }

    mockKpiItems[index].isActive = false;
  }

  // ========== Selectable Options ==========

  async getSelectableSubjects(_companyId: string): Promise<SelectableSubjectListDto> {
    await this.delay(200);
    return mockSelectableSubjects;
  }

  async getSelectableMetrics(_companyId: string): Promise<SelectableMetricListDto> {
    await this.delay(200);
    return mockSelectableMetrics;
  }

  // ========== Non-Financial KPI Definitions ==========

  async getKpiDefinitions(
    query: GetKpiDefinitionsQueryDto,
  ): Promise<KpiDefinitionListDto> {
    await this.delay(300);

    let filtered = [...mockKpiDefinitions];

    // Filter by companyId (required)
    if (query.companyId) {
      filtered = filtered.filter((def) => def.companyId === query.companyId);
    }

    // Filter by keyword
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (def) =>
          def.kpiCode.toLowerCase().includes(keyword) ||
          def.kpiName.toLowerCase().includes(keyword),
      );
    }

    // Pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedDefinitions = filtered.slice(start, end);

    return {
      definitions: paginatedDefinitions,
      page,
      pageSize,
      totalCount: filtered.length,
    };
  }

  async createKpiDefinition(data: CreateKpiDefinitionDto): Promise<KpiDefinitionDto> {
    await this.delay(500);

    const newDefinition: KpiDefinitionDto = {
      id: `kpi-def-${Date.now()}`,
      companyId: data.companyId,
      kpiCode: data.kpiCode,
      kpiName: data.kpiName,
      description: data.description,
      aggregationMethod: data.aggregationMethod,
      direction: data.direction,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
    };

    mockKpiDefinitions.push(newDefinition);
    return newDefinition;
  }

  // ========== Fact Amounts ==========

  async createFactAmount(data: CreateKpiFactAmountDto): Promise<KpiFactAmountDto> {
    await this.delay(400);

    return {
      id: `fact-${Date.now()}`,
      kpiEventId: data.kpiEventId,
      kpiDefinitionId: data.kpiDefinitionId,
      periodCode: data.periodCode,
      periodStartDate: data.periodStartDate,
      periodEndDate: data.periodEndDate,
      departmentStableId: data.departmentStableId,
      targetValue: data.targetValue,
      actualValue: data.actualValue,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateFactAmount(
    id: string,
    data: UpdateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    await this.delay(400);

    return {
      id,
      kpiEventId: 'kpi-event-001',
      kpiDefinitionId: 'kpi-def-001',
      periodCode: '2026-Q1',
      periodStartDate: undefined,
      periodEndDate: undefined,
      departmentStableId: undefined,
      targetValue: data.targetValue || 100,
      actualValue: data.actualValue || 95,
      notes: data.notes,
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  }

  // ========== Target Values ==========

  async createTargetValue(data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto> {
    await this.delay(400);

    return {
      id: `target-${Date.now()}`,
      kpiMasterItemId: data.kpiMasterItemId,
      periodCode: data.periodCode,
      periodStartDate: data.periodStartDate,
      periodEndDate: data.periodEndDate,
      targetValue: data.targetValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateTargetValue(
    id: string,
    data: UpdateKpiTargetValueDto,
  ): Promise<KpiTargetValueDto> {
    await this.delay(400);

    return {
      id,
      kpiMasterItemId: 'kpi-item-004',
      periodCode: '2026-Q1',
      periodStartDate: undefined,
      periodEndDate: undefined,
      targetValue: data.targetValue || 15.0,
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  }

  // ========== Utility ==========

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

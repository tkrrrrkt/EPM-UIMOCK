/**
 * Mock BffClient for Dashboard Feature (UI-MOCK Phase)
 *
 * Purpose:
 * - Provide hardcoded mock data for UI development
 * - No real network calls
 * - Simulates BFF responses for all dashboard operations
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 11.1)
 */
import type { BffClient, GetDashboardsQuery } from './BffClient';
import type {
  BffDashboardListDto,
  BffDashboardDetailDto,
  BffDashboardDto,
  BffWidgetDto,
  BffCreateDashboardDto,
  BffUpdateDashboardDto,
  BffDashboardTemplateListDto,
  BffWidgetDataRequestDto,
  BffWidgetDataResponseDto,
  BffDashboardSelectorsRequestDto,
  BffDashboardSelectorsResponseDto,
  OwnerType,
  WidgetType,
  DataSourceType,
  ScenarioType,
  DisplayGranularity,
} from '@epm/contracts/bff/dashboard';

// ============================================================
// Mock Data
// ============================================================

const mockDashboards: BffDashboardDto[] = [
  {
    id: 'dash-001',
    name: '経営ダッシュボード',
    description: '経営層向け主要KPI一覧',
    ownerType: 'SYSTEM' as OwnerType,
    ownerId: null,
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-01-15T09:00:00+09:00',
    updatedAt: '2026-01-20T14:30:00+09:00',
    createdBy: 'system',
    updatedBy: 'admin-user-001',
  },
  {
    id: 'dash-002',
    name: '営業部ダッシュボード',
    description: '営業部の売上・受注状況',
    ownerType: 'USER' as OwnerType,
    ownerId: 'user-001',
    isActive: true,
    sortOrder: 2,
    createdAt: '2026-01-18T10:00:00+09:00',
    updatedAt: '2026-01-22T16:00:00+09:00',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: 'dash-003',
    name: 'FP&A分析ダッシュボード',
    description: '予算実績差異分析',
    ownerType: 'USER' as OwnerType,
    ownerId: 'user-002',
    isActive: true,
    sortOrder: 3,
    createdAt: '2026-01-20T11:00:00+09:00',
    updatedAt: '2026-01-23T09:00:00+09:00',
    createdBy: 'user-002',
    updatedBy: 'user-002',
  },
];

const mockWidgets: Record<string, BffWidgetDto[]> = {
  'dash-001': [
    {
      id: 'widget-001',
      widgetType: 'KPI_CARD' as WidgetType,
      title: '売上高（当月）',
      layout: { row: 0, col: 0, sizeX: 2, sizeY: 1 },
      dataConfig: {
        sources: [
          {
            type: 'FACT' as DataSourceType,
            refId: 'fact-revenue',
            label: '売上高',
          },
        ],
      },
      filterConfig: {
        useGlobal: true,
      },
      displayConfig: {
        showSparkline: true,
        showCompare: true,
        thresholds: { danger: 80, warning: 90 },
      },
      sortOrder: 1,
    },
    {
      id: 'widget-002',
      widgetType: 'LINE_CHART' as WidgetType,
      title: '月次売上推移',
      layout: { row: 0, col: 2, sizeX: 4, sizeY: 2 },
      dataConfig: {
        sources: [
          {
            type: 'FACT' as DataSourceType,
            refId: 'fact-revenue',
            label: '売上高',
            color: '#3b82f6',
          },
        ],
      },
      filterConfig: {
        useGlobal: true,
      },
      displayConfig: {
        showLegend: true,
        showTooltip: true,
        showDataLabels: false,
      },
      sortOrder: 2,
    },
    {
      id: 'widget-003',
      widgetType: 'BAR_CHART' as WidgetType,
      title: '部門別売上',
      layout: { row: 2, col: 0, sizeX: 3, sizeY: 2 },
      dataConfig: {
        sources: [
          {
            type: 'FACT' as DataSourceType,
            refId: 'fact-revenue',
            label: '売上高',
            color: '#10b981',
          },
        ],
      },
      filterConfig: {
        useGlobal: true,
      },
      displayConfig: {
        orientation: 'vertical',
        stacked: false,
        showLegend: true,
        showDataLabels: true,
      },
      sortOrder: 3,
    },
    {
      id: 'widget-004',
      widgetType: 'PIE_CHART' as WidgetType,
      title: '費用構成比',
      layout: { row: 2, col: 3, sizeX: 3, sizeY: 2 },
      dataConfig: {
        sources: [
          {
            type: 'FACT' as DataSourceType,
            refId: 'fact-expenses',
            label: '費用',
          },
        ],
      },
      filterConfig: {
        useGlobal: true,
      },
      displayConfig: {
        donut: false,
        showLabels: true,
        showLegend: true,
      },
      sortOrder: 4,
    },
  ],
};

const mockSelectors: BffDashboardSelectorsResponseDto = {
  fiscalYears: [2024, 2025, 2026],
  planEvents: [
    {
      id: 'event-001',
      eventCode: 'BUDGET_2026',
      eventName: '2026年度予算',
      scenarioType: 'BUDGET' as ScenarioType,
      fiscalYear: 2026,
    },
    {
      id: 'event-002',
      eventCode: 'FORECAST_Q2',
      eventName: '2026年度第2四半期予測',
      scenarioType: 'FORECAST' as ScenarioType,
      fiscalYear: 2026,
    },
  ],
  planVersions: [
    {
      id: 'version-001',
      versionCode: 'V1',
      versionName: '初回予算',
      status: 'CONFIRMED',
    },
    {
      id: 'version-002',
      versionCode: 'V2',
      versionName: '修正予算',
      status: 'DRAFT',
    },
  ],
  departments: [
    {
      stableId: 'dept-all',
      departmentCode: '000',
      departmentName: '全社',
      level: 0,
      hasChildren: true,
      children: [
        {
          stableId: 'dept-sales',
          departmentCode: '100',
          departmentName: '営業部',
          level: 1,
          hasChildren: false,
        },
        {
          stableId: 'dept-dev',
          departmentCode: '200',
          departmentName: '開発部',
          level: 1,
          hasChildren: false,
        },
        {
          stableId: 'dept-admin',
          departmentCode: '300',
          departmentName: '管理部',
          level: 1,
          hasChildren: false,
        },
      ],
    },
  ],
};

const mockTemplates: BffDashboardTemplateListDto = {
  templates: [
    {
      id: 'template-001',
      name: '経営ダッシュボード（テンプレート）',
      description: '経営層向け標準テンプレート',
      widgetCount: 6,
    },
    {
      id: 'template-002',
      name: '部門ダッシュボード（テンプレート）',
      description: '部門管理者向けテンプレート',
      widgetCount: 4,
    },
  ],
};

// ============================================================
// MockBffClient Implementation
// ============================================================

export const mockBffClient: BffClient = {
  /**
   * Get dashboard list
   */
  async getDashboards(query?: GetDashboardsQuery): Promise<BffDashboardListDto> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let items = [...mockDashboards];

    // Filter by keyword
    if (query?.keyword) {
      const keyword = query.keyword.toLowerCase();
      items = items.filter(
        (d) =>
          d.name.toLowerCase().includes(keyword) ||
          (d.description?.toLowerCase() || '').includes(keyword),
      );
    }

    // Sort
    const sortBy = query?.sortBy || 'sortOrder';
    const sortOrder = query?.sortOrder || 'asc';
    items.sort((a, b) => {
      const aVal = a[sortBy as keyof BffDashboardDto] ?? '';
      const bVal = b[sortBy as keyof BffDashboardDto] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = query?.page || 1;
    const pageSize = query?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      items: paged,
      total: items.length,
      page,
      pageSize,
    };
  },

  /**
   * Get dashboard by ID
   */
  async getDashboard(id: string): Promise<BffDashboardDetailDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dashboard = mockDashboards.find((d) => d.id === id);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${id}`);
    }

    return {
      ...dashboard,
      globalFilterConfig: {
        fiscalYear: 2026,
        departmentStableId: 'dept-all',
        includeChildren: true,
        periodStart: '202601',
        periodEnd: '202612',
        displayGranularity: 'MONTHLY' as DisplayGranularity,
        primary: {
          scenarioType: 'ACTUAL' as ScenarioType,
        },
        compare: {
          enabled: true,
          scenarioType: 'BUDGET' as ScenarioType,
          planEventId: 'event-001',
        },
      },
      widgets: mockWidgets[id] || [],
    };
  },

  /**
   * Create dashboard
   */
  async createDashboard(data: BffCreateDashboardDto): Promise<BffDashboardDetailDto> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newDashboard: BffDashboardDetailDto = {
      id: `dash-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      ownerType: 'USER' as OwnerType,
      ownerId: 'current-user',
      isActive: true,
      sortOrder: mockDashboards.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
      globalFilterConfig: data.globalFilterConfig || {},
      widgets: data.widgets?.map((w, idx) => ({
        id: `widget-${Date.now()}-${idx}`,
        ...w,
        sortOrder: w.sortOrder ?? idx,
      })) || [],
    };

    return newDashboard;
  },

  /**
   * Update dashboard
   */
  async updateDashboard(id: string, data: BffUpdateDashboardDto): Promise<BffDashboardDetailDto> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const dashboard = await mockBffClient.getDashboard(id);

    return {
      ...dashboard,
      name: data.name || dashboard.name,
      description: data.description !== undefined ? data.description : dashboard.description,
      globalFilterConfig: data.globalFilterConfig || dashboard.globalFilterConfig,
      widgets: data.widgets?.map((w, idx) => ({
        id: w.id || `widget-${Date.now()}-${idx}`,
        widgetType: w.widgetType,
        title: w.title,
        layout: w.layout,
        dataConfig: w.dataConfig,
        filterConfig: w.filterConfig,
        displayConfig: w.displayConfig,
        sortOrder: w.sortOrder ?? idx,
      })) || dashboard.widgets,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };
  },

  /**
   * Delete dashboard
   */
  async deleteDashboard(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dashboard = mockDashboards.find((d) => d.id === id);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${id}`);
    }

    if (dashboard.ownerType === 'SYSTEM') {
      throw new Error('System template dashboard cannot be deleted');
    }

    // In real implementation, this would remove from the list
    console.log(`[Mock] Dashboard deleted: ${id}`);
  },

  /**
   * Duplicate dashboard
   */
  async duplicateDashboard(id: string): Promise<BffDashboardDetailDto> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const original = await mockBffClient.getDashboard(id);

    return {
      ...original,
      id: `dash-${Date.now()}`,
      name: `${original.name}（コピー）`,
      ownerType: 'USER' as OwnerType,
      ownerId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
      widgets: original.widgets.map((w, idx) => ({
        ...w,
        id: `widget-${Date.now()}-${idx}`,
      })),
    };
  },

  /**
   * Get widget data
   */
  async getWidgetData(
    dashboardId: string,
    widgetId: string,
    request: BffWidgetDataRequestDto,
  ): Promise<BffWidgetDataResponseDto> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data points (12 months)
    const dataPoints = Array.from({ length: 12 }, (_, i) => ({
      label: `2026/${String(i + 1).padStart(2, '0')}`,
      value: Math.random() * 1000 + 500,
      compareValue: request.resolvedFilter.compareEnabled
        ? Math.random() * 1000 + 500
        : undefined,
    }));

    return {
      widgetId,
      dataPoints,
      difference: request.resolvedFilter.compareEnabled
        ? {
            value: 50,
            rate: 5.2,
          }
        : undefined,
      unit: '百万円',
      meta: {
        sourceName: '売上高',
        lastUpdated: new Date().toISOString(),
      },
    };
  },

  /**
   * Get selectors
   */
  async getSelectors(query?: BffDashboardSelectorsRequestDto): Promise<BffDashboardSelectorsResponseDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockSelectors;
  },

  /**
   * Get templates
   */
  async getTemplates(): Promise<BffDashboardTemplateListDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockTemplates;
  },
};

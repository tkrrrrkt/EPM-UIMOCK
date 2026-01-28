import type { BffClient } from './bff-client'
import type {
  ReportLayoutDto,
  ReportLayoutListDto,
  CreateReportLayoutDto,
  UpdateReportLayoutDto,
  ReorderLayoutsDto,
  ReportPageDto,
  ReportPageListDto,
  CreateReportPageDto,
  UpdateReportPageDto,
  ReorderPagesDto,
  ReportComponentDto,
  ReportComponentListDto,
  CreateReportComponentDto,
  UpdateReportComponentDto,
  ReorderComponentsDto,
  LayoutTemplateDto,
  LayoutTemplateListDto,
  CreateLayoutFromTemplateDto,
  KpiCardConfig,
  ChartConfig,
  TableConfig,
} from '@epm/contracts/bff/meetings'

// Mock data store
let mockLayouts: ReportLayoutDto[] = [
  {
    id: 'layout-1',
    meetingTypeId: 'mt-1',
    layoutCode: 'MONTHLY_STD',
    layoutName: '月次標準レイアウト',
    description: '月次経営会議の標準的なレポート構成',
    isDefault: true,
    sortOrder: 10,
    isActive: true,
    pageCount: 3,
  },
  {
    id: 'layout-2',
    meetingTypeId: 'mt-1',
    layoutCode: 'MONTHLY_SIMPLE',
    layoutName: '月次簡易レイアウト',
    description: 'エグゼクティブ向け簡易版',
    isDefault: false,
    sortOrder: 20,
    isActive: true,
    pageCount: 2,
  },
]

let mockPages: ReportPageDto[] = [
  {
    id: 'page-1',
    layoutId: 'layout-1',
    pageCode: 'SUMMARY',
    pageName: 'エグゼクティブサマリー',
    pageType: 'FIXED',
    sortOrder: 10,
    isActive: true,
    componentCount: 4,
  },
  {
    id: 'page-2',
    layoutId: 'layout-1',
    pageCode: 'DEPT_REPORT',
    pageName: '部門報告',
    pageType: 'PER_DEPARTMENT',
    expandDimensionId: 'dim-org',
    sortOrder: 20,
    isActive: true,
    componentCount: 1,
  },
  {
    id: 'page-3',
    layoutId: 'layout-1',
    pageCode: 'KPI_ACTION',
    pageName: 'KPI・アクション',
    pageType: 'FIXED',
    sortOrder: 30,
    isActive: true,
    componentCount: 2,
  },
  {
    id: 'page-4',
    layoutId: 'layout-2',
    pageCode: 'EXEC_SUMMARY',
    pageName: 'サマリー',
    pageType: 'FIXED',
    sortOrder: 10,
    isActive: true,
    componentCount: 2,
  },
  {
    id: 'page-5',
    layoutId: 'layout-2',
    pageCode: 'KEY_METRICS',
    pageName: '主要指標',
    pageType: 'FIXED',
    sortOrder: 20,
    isActive: true,
    componentCount: 1,
  },
]

let mockComponents: ReportComponentDto[] = [
  {
    id: 'comp-1',
    pageId: 'page-1',
    componentCode: 'KPI_CARDS',
    componentName: '主要KPIカード',
    componentType: 'KPI_CARD',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      subjectIds: ['sub-sales', 'sub-profit', 'sub-cost'],
      layout: 'grid',
      columns: 3,
      showTarget: true,
      showVariance: true,
      showTrend: true,
    } as KpiCardConfig,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'comp-2',
    pageId: 'page-1',
    componentCode: 'WATERFALL',
    componentName: '損益ウォーターフォール',
    componentType: 'CHART',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      chartType: 'waterfall',
      xAxis: 'subject',
      series: [{ dataKey: 'variance', name: '差異' }],
      showLegend: false,
      showDataLabels: true,
      waterfallConfig: {
        startLabel: '予算',
        endLabel: '実績',
      },
    } as ChartConfig,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'comp-3',
    pageId: 'page-1',
    componentCode: 'BA_TABLE',
    componentName: '予実対比表',
    componentType: 'TABLE',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      rowAxis: 'subject',
      compareMode: 'BUDGET_VS_ACTUAL',
      columns: ['budget', 'actual', 'variance', 'varianceRate'],
      showTotal: true,
      highlightVariance: true,
    } as TableConfig,
    sortOrder: 30,
    isActive: true,
  },
  {
    id: 'comp-4',
    pageId: 'page-1',
    componentCode: 'COMMENT',
    componentName: '差異コメント',
    componentType: 'SUBMISSION_DISPLAY',
    dataSource: 'SUBMISSION',
    width: 'FULL',
    configJson: {
      displayMode: 'tree',
      sectionIds: ['sec-comment'],
      showOrganizationHierarchy: true,
      showSubmissionStatus: false,
      expandByDefault: true,
    },
    sortOrder: 40,
    isActive: true,
  },
  {
    id: 'comp-5',
    pageId: 'page-2',
    componentCode: 'DEPT_SUBMISSION',
    componentName: '部門報告一覧',
    componentType: 'SUBMISSION_DISPLAY',
    dataSource: 'SUBMISSION',
    width: 'FULL',
    configJson: {
      displayMode: 'card',
      sectionIds: [],
      showOrganizationHierarchy: false,
      showSubmissionStatus: true,
      expandByDefault: false,
    },
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'comp-6',
    pageId: 'page-3',
    componentCode: 'KPI_DASHBOARD',
    componentName: 'KPI一覧',
    componentType: 'KPI_DASHBOARD',
    dataSource: 'KPI',
    width: 'FULL',
    configJson: {
      kpiDefinitionIds: [],
      layout: 'grid',
      columns: 3,
      showChart: true,
      showActions: true,
      chartPeriods: 6,
      filterByStatus: ['ON_TRACK', 'AT_RISK', 'OFF_TRACK'],
    },
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'comp-7',
    pageId: 'page-3',
    componentCode: 'AP_PROGRESS',
    componentName: 'AP進捗',
    componentType: 'AP_PROGRESS',
    dataSource: 'KPI',
    width: 'FULL',
    configJson: {
      actionPlanIds: [],
      showProgress: true,
      showKanban: true,
      filterByStatus: ['IN_PROGRESS', 'DELAYED'],
      groupBy: 'kpi',
    },
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'comp-8',
    pageId: 'page-4',
    componentCode: 'SIMPLE_KPI',
    componentName: '主要指標',
    componentType: 'KPI_CARD',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      subjectIds: ['sub-sales', 'sub-profit'],
      layout: 'grid',
      columns: 2,
      showTarget: true,
      showVariance: true,
      showTrend: false,
    } as KpiCardConfig,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'comp-9',
    pageId: 'page-4',
    componentCode: 'SIMPLE_CHART',
    componentName: '推移グラフ',
    componentType: 'CHART',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      chartType: 'line',
      xAxis: 'period',
      series: [
        { dataKey: 'actual', name: '実績' },
        { dataKey: 'budget', name: '予算' },
      ],
      showLegend: true,
      showDataLabels: false,
      showGrid: true,
    } as ChartConfig,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'comp-10',
    pageId: 'page-5',
    componentCode: 'METRICS_TABLE',
    componentName: '指標一覧',
    componentType: 'TABLE',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      rowAxis: 'subject',
      compareMode: 'BUDGET_VS_ACTUAL',
      columns: ['actual', 'budget', 'variance'],
      showTotal: false,
      highlightVariance: true,
    } as TableConfig,
    sortOrder: 10,
    isActive: true,
  },
]

const mockTemplates: LayoutTemplateDto[] = [
  {
    id: 'template-1',
    templateCode: 'MONTHLY_MEETING',
    templateName: '月次経営会議レイアウト',
    description:
      '月次経営会議向けの標準テンプレート。エグゼクティブサマリー、部門報告、KPI・アクション、アクション管理、前回比較の5ページ構成。',
    pageCount: 5,
    componentCount: 9,
  },
  {
    id: 'template-2',
    templateCode: 'QUARTERLY_REVIEW',
    templateName: '四半期レビューレイアウト',
    description:
      '四半期レビュー向けテンプレート。業績サマリー、部門詳細、戦略KPI、アクションプラン進捗の4ページ構成。',
    pageCount: 4,
    componentCount: 8,
  },
  {
    id: 'template-3',
    templateCode: 'SIMPLE_REPORT',
    templateName: '簡易レポートレイアウト',
    description: 'シンプルな2ページ構成。主要KPIと差異分析のみ。',
    pageCount: 2,
    componentCount: 3,
  },
]

// Helper to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockBffClient implements BffClient {
  private readonly networkDelay = 300

  // Layout operations
  async getLayouts(meetingTypeId: string): Promise<ReportLayoutListDto> {
    await delay(this.networkDelay)
    const items = mockLayouts.filter((l) => l.meetingTypeId === meetingTypeId)
    return { items, total: items.length }
  }

  async createLayout(dto: CreateReportLayoutDto): Promise<ReportLayoutDto> {
    await delay(this.networkDelay)

    // Check for duplicate code
    if (mockLayouts.some((l) => l.layoutCode === dto.layoutCode)) {
      throw new Error('ReportLayoutDuplicateCodeError')
    }

    const newLayout: ReportLayoutDto = {
      id: generateId(),
      meetingTypeId: dto.meetingTypeId,
      layoutCode: dto.layoutCode,
      layoutName: dto.layoutName,
      description: dto.description,
      isDefault: dto.isDefault || false,
      sortOrder: mockLayouts.length * 10 + 10,
      isActive: true,
      pageCount: 0,
    }

    // If new layout is default, unset other defaults
    if (newLayout.isDefault) {
      mockLayouts = mockLayouts.map((l) =>
        l.meetingTypeId === dto.meetingTypeId ? { ...l, isDefault: false } : l
      )
    }

    mockLayouts.push(newLayout)
    return newLayout
  }

  async updateLayout(id: string, dto: UpdateReportLayoutDto): Promise<ReportLayoutDto> {
    await delay(this.networkDelay)

    const index = mockLayouts.findIndex((l) => l.id === id)
    if (index === -1) {
      throw new Error('ReportLayoutNotFoundError')
    }

    const layout = mockLayouts[index]

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      mockLayouts = mockLayouts.map((l) =>
        l.meetingTypeId === layout.meetingTypeId && l.id !== id ? { ...l, isDefault: false } : l
      )
    }

    const updated = { ...layout, ...dto }
    mockLayouts[index] = updated
    return updated
  }

  async deleteLayout(id: string): Promise<void> {
    await delay(this.networkDelay)

    const layout = mockLayouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error('ReportLayoutNotFoundError')
    }
    if (layout.isDefault) {
      throw new Error('ReportLayoutDefaultDeleteError')
    }

    // Delete associated pages and components
    const pageIds = mockPages.filter((p) => p.layoutId === id).map((p) => p.id)
    mockComponents = mockComponents.filter((c) => !pageIds.includes(c.pageId))
    mockPages = mockPages.filter((p) => p.layoutId !== id)
    mockLayouts = mockLayouts.filter((l) => l.id !== id)
  }

  async reorderLayouts(dto: ReorderLayoutsDto): Promise<ReportLayoutListDto> {
    await delay(this.networkDelay)

    dto.orderedIds.forEach((id, index) => {
      const layout = mockLayouts.find((l) => l.id === id)
      if (layout) {
        layout.sortOrder = (index + 1) * 10
      }
    })

    return this.getLayouts(dto.meetingTypeId)
  }

  // Page operations
  async getPages(layoutId: string): Promise<ReportPageListDto> {
    await delay(this.networkDelay)
    const items = mockPages
      .filter((p) => p.layoutId === layoutId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    return { items, total: items.length }
  }

  async createPage(dto: CreateReportPageDto): Promise<ReportPageDto> {
    await delay(this.networkDelay)

    // Check for duplicate code within layout
    if (mockPages.some((p) => p.layoutId === dto.layoutId && p.pageCode === dto.pageCode)) {
      throw new Error('ReportPageDuplicateCodeError')
    }

    const layoutPages = mockPages.filter((p) => p.layoutId === dto.layoutId)
    const newPage: ReportPageDto = {
      id: generateId(),
      layoutId: dto.layoutId,
      pageCode: dto.pageCode,
      pageName: dto.pageName,
      pageType: dto.pageType,
      expandDimensionId: dto.expandDimensionId,
      sortOrder: layoutPages.length * 10 + 10,
      isActive: true,
      componentCount: 0,
    }

    mockPages.push(newPage)

    // Update layout pageCount
    const layout = mockLayouts.find((l) => l.id === dto.layoutId)
    if (layout) {
      layout.pageCount++
    }

    return newPage
  }

  async updatePage(id: string, dto: UpdateReportPageDto): Promise<ReportPageDto> {
    await delay(this.networkDelay)

    const index = mockPages.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('ReportPageNotFoundError')
    }

    const updated: ReportPageDto = {
      ...mockPages[index],
      ...dto,
      expandDimensionId:
        'expandDimensionId' in dto
          ? dto.expandDimensionId ?? undefined
          : mockPages[index].expandDimensionId,
    }
    mockPages[index] = updated
    return updated
  }

  async deletePage(id: string): Promise<void> {
    await delay(this.networkDelay)

    const page = mockPages.find((p) => p.id === id)
    if (!page) {
      throw new Error('ReportPageNotFoundError')
    }

    // Delete associated components
    mockComponents = mockComponents.filter((c) => c.pageId !== id)
    mockPages = mockPages.filter((p) => p.id !== id)

    // Update layout pageCount
    const layout = mockLayouts.find((l) => l.id === page.layoutId)
    if (layout) {
      layout.pageCount--
    }
  }

  async reorderPages(dto: ReorderPagesDto): Promise<ReportPageListDto> {
    await delay(this.networkDelay)

    dto.orderedIds.forEach((id, index) => {
      const page = mockPages.find((p) => p.id === id)
      if (page) {
        page.sortOrder = (index + 1) * 10
      }
    })

    return this.getPages(dto.layoutId)
  }

  // Component operations
  async getComponents(pageId: string): Promise<ReportComponentListDto> {
    await delay(this.networkDelay)
    const items = mockComponents
      .filter((c) => c.pageId === pageId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    return { items, total: items.length }
  }

  async createComponent(dto: CreateReportComponentDto): Promise<ReportComponentDto> {
    await delay(this.networkDelay)

    // Check for duplicate code within page
    if (mockComponents.some((c) => c.pageId === dto.pageId && c.componentCode === dto.componentCode)) {
      throw new Error('ReportComponentDuplicateCodeError')
    }

    const pageComponents = mockComponents.filter((c) => c.pageId === dto.pageId)
    const newComponent: ReportComponentDto = {
      id: generateId(),
      pageId: dto.pageId,
      componentCode: dto.componentCode,
      componentName: dto.componentName,
      componentType: dto.componentType,
      dataSource: dto.dataSource,
      width: dto.width,
      height: dto.height,
      configJson: (dto.configJson || {}) as ReportComponentDto['configJson'],
      sortOrder: pageComponents.length * 10 + 10,
      isActive: true,
    }

    mockComponents.push(newComponent)

    // Update page componentCount
    const page = mockPages.find((p) => p.id === dto.pageId)
    if (page) {
      page.componentCount++
    }

    return newComponent
  }

  async updateComponent(id: string, dto: UpdateReportComponentDto): Promise<ReportComponentDto> {
    await delay(this.networkDelay)

    const index = mockComponents.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('ReportComponentNotFoundError')
    }

    const updated = { ...mockComponents[index], ...dto }
    if (dto.configJson) {
      updated.configJson = {
        ...mockComponents[index].configJson,
        ...dto.configJson,
      }
    }
    mockComponents[index] = updated as ReportComponentDto
    return updated as ReportComponentDto
  }

  async deleteComponent(id: string): Promise<void> {
    await delay(this.networkDelay)

    const component = mockComponents.find((c) => c.id === id)
    if (!component) {
      throw new Error('ReportComponentNotFoundError')
    }

    mockComponents = mockComponents.filter((c) => c.id !== id)

    // Update page componentCount
    const page = mockPages.find((p) => p.id === component.pageId)
    if (page) {
      page.componentCount--
    }
  }

  async reorderComponents(dto: ReorderComponentsDto): Promise<ReportComponentListDto> {
    await delay(this.networkDelay)

    dto.orderedIds.forEach((id, index) => {
      const component = mockComponents.find((c) => c.id === id)
      if (component) {
        component.sortOrder = (index + 1) * 10
      }
    })

    return this.getComponents(dto.pageId)
  }

  // Template operations
  async getTemplates(): Promise<LayoutTemplateListDto> {
    await delay(this.networkDelay)
    return { items: mockTemplates, total: mockTemplates.length }
  }

  async createLayoutFromTemplate(dto: CreateLayoutFromTemplateDto): Promise<ReportLayoutDto> {
    await delay(this.networkDelay)

    const template = mockTemplates.find((t) => t.id === dto.templateId)
    if (!template) {
      throw new Error('TemplateNotFoundError')
    }

    // Check for duplicate code
    if (mockLayouts.some((l) => l.layoutCode === dto.layoutCode)) {
      throw new Error('ReportLayoutDuplicateCodeError')
    }

    const newLayout: ReportLayoutDto = {
      id: generateId(),
      meetingTypeId: dto.meetingTypeId,
      layoutCode: dto.layoutCode,
      layoutName: dto.layoutName,
      description: `${template.templateName}から作成`,
      isDefault: false,
      sortOrder: mockLayouts.length * 10 + 10,
      isActive: true,
      pageCount: template.pageCount,
    }

    mockLayouts.push(newLayout)

    // Create template pages and components (simplified)
    for (let i = 0; i < template.pageCount; i++) {
      const pageId = generateId()
      mockPages.push({
        id: pageId,
        layoutId: newLayout.id,
        pageCode: `PAGE_${i + 1}`,
        pageName: `ページ ${i + 1}`,
        pageType: 'FIXED',
        sortOrder: (i + 1) * 10,
        isActive: true,
        componentCount: i === 0 ? 2 : 1,
      })

      // Add sample components
      mockComponents.push({
        id: generateId(),
        pageId,
        componentCode: `COMP_${i + 1}_1`,
        componentName: `コンポーネント ${i + 1}-1`,
        componentType: 'KPI_CARD',
        dataSource: 'FACT',
        width: 'FULL',
        configJson: {
          subjectIds: [],
          layout: 'grid',
          columns: 3,
        } as KpiCardConfig,
        sortOrder: 10,
        isActive: true,
      })
    }

    return newLayout
  }
}

// Export singleton instance
export const mockBffClient = new MockBffClient()

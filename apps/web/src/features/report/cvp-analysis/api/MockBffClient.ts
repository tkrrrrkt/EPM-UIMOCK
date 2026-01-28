import type { BffClient } from './BffClient';
import type {
  BffCvpOptionsRequest,
  BffCvpOptionsResponse,
  BffCvpDataRequest,
  BffCvpDataResponse,
  BffCvpKpiItem,
  BffCvpTreeLine,
  BffCvpBreakevenChartData,
  BffCvpWaterfallData,
} from '../types';

const mockOptions: BffCvpOptionsResponse = {
  fiscalYears: [
    { fiscalYear: 2025, label: '2025年度' },
    { fiscalYear: 2024, label: '2024年度' },
    { fiscalYear: 2023, label: '2023年度' },
  ],
  budgetEvents: [
    {
      id: 'evt-001',
      eventCode: 'BUD2025',
      eventName: '2025年度当初予算',
      scenarioType: 'BUDGET',
      fiscalYear: 2025,
      hasFixedVersion: true,
    },
    {
      id: 'evt-004',
      eventCode: 'BUD2024',
      eventName: '2024年度当初予算',
      scenarioType: 'BUDGET',
      fiscalYear: 2024,
      hasFixedVersion: true,
    },
  ],
  forecastEvents: [
    {
      id: 'evt-002',
      eventCode: 'FC2025Q3',
      eventName: '2025年度Q3見込',
      scenarioType: 'FORECAST',
      fiscalYear: 2025,
      hasFixedVersion: true,
    },
    {
      id: 'evt-003',
      eventCode: 'FC2025Q2',
      eventName: '2025年度Q2見込',
      scenarioType: 'FORECAST',
      fiscalYear: 2025,
      hasFixedVersion: false,
    },
  ],
  versions: {
    'evt-001': [
      { id: 'ver-001', versionCode: 'V1', versionName: '初版', versionNo: 1, status: 'FIXED' },
      { id: 'ver-002', versionCode: 'V2', versionName: '修正版', versionNo: 2, status: 'DRAFT' },
    ],
    'evt-004': [
      { id: 'ver-003', versionCode: 'V1', versionName: '確定版', versionNo: 1, status: 'FIXED' },
    ],
  },
  departments: [
    {
      id: 'dept-001',
      stableId: 'CORP',
      name: '全社',
      code: '000',
      level: 0,
      hasChildren: true,
      children: [
        {
          id: 'dept-002',
          stableId: 'SALES',
          name: '営業本部',
          code: '100',
          level: 1,
          hasChildren: true,
          children: [
            {
              id: 'dept-003',
              stableId: 'SALES1',
              name: '営業1部',
              code: '110',
              level: 2,
              hasChildren: false,
            },
            {
              id: 'dept-004',
              stableId: 'SALES2',
              name: '営業2部',
              code: '120',
              level: 2,
              hasChildren: false,
            },
          ],
        },
        {
          id: 'dept-005',
          stableId: 'ADMIN',
          name: '管理本部',
          code: '200',
          level: 1,
          hasChildren: false,
        },
      ],
    },
  ],
  cvpLayoutId: 'layout-001',
  cvpLayoutName: 'CVP標準レイアウト',
};

const mockKpis: BffCvpKpiItem[] = [
  {
    id: 'kpi-revenue',
    name: '売上高',
    originalValue: 100000000,
    simulatedValue: 100000000,
    compareValue: 95000000,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-variable',
    name: '変動費',
    originalValue: 40000000,
    simulatedValue: 40000000,
    compareValue: 38000000,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-marginal',
    name: '限界利益',
    originalValue: 60000000,
    simulatedValue: 60000000,
    compareValue: 57000000,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-marginal-rate',
    name: '限界利益率',
    originalValue: 0.6,
    simulatedValue: 0.6,
    compareValue: 0.6,
    unit: '%',
    isCalculable: true,
    format: 'percent',
  },
  {
    id: 'kpi-fixed',
    name: '固定費',
    originalValue: 30000000,
    simulatedValue: 30000000,
    compareValue: 28000000,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-breakeven',
    name: '損益分岐売上',
    originalValue: 50000000,
    simulatedValue: 50000000,
    compareValue: 46666667,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-safety-margin',
    name: '安全余裕額',
    originalValue: 50000000,
    simulatedValue: 50000000,
    compareValue: 48333333,
    unit: '円',
    isCalculable: true,
    format: 'currency',
  },
  {
    id: 'kpi-safety-rate',
    name: '安全余裕率',
    originalValue: 0.5,
    simulatedValue: 0.5,
    compareValue: 0.509,
    unit: '%',
    isCalculable: true,
    format: 'percent',
  },
];

const mockTree: BffCvpTreeLine[] = [
  {
    lineId: 'line-001',
    lineNo: 1,
    lineType: 'header',
    displayName: '売上高',
    subjectId: 'subj-revenue',
    indentLevel: 0,
    isEditable: false,
    isAdjustment: false,
    originalValue: 100000000,
    compareValue: 95000000,
    parentLineId: null,
    childLineIds: ['line-002', 'line-003'],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-002',
    lineNo: 2,
    lineType: 'account',
    displayName: '製品売上',
    subjectId: 'subj-product',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 80000000,
    compareValue: 76000000,
    parentLineId: 'line-001',
    childLineIds: [],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-003',
    lineNo: 3,
    lineType: 'account',
    displayName: 'サービス売上',
    subjectId: 'subj-service',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 20000000,
    compareValue: 19000000,
    parentLineId: 'line-001',
    childLineIds: [],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-010',
    lineNo: 10,
    lineType: 'header',
    displayName: '変動費計',
    subjectId: 'subj-variable',
    indentLevel: 0,
    isEditable: false,
    isAdjustment: false,
    originalValue: 40000000,
    compareValue: 38000000,
    parentLineId: null,
    childLineIds: ['line-011', 'line-012'],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-011',
    lineNo: 11,
    lineType: 'account',
    displayName: '材料費',
    subjectId: 'subj-material',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 25000000,
    compareValue: 24000000,
    parentLineId: 'line-010',
    childLineIds: [],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-012',
    lineNo: 12,
    lineType: 'account',
    displayName: '外注費',
    subjectId: 'subj-outsource',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 15000000,
    compareValue: 14000000,
    parentLineId: 'line-010',
    childLineIds: [],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-020',
    lineNo: 20,
    lineType: 'header',
    displayName: '固定費計',
    subjectId: 'subj-fixed',
    indentLevel: 0,
    isEditable: false,
    isAdjustment: false,
    originalValue: 30000000,
    compareValue: 28000000,
    parentLineId: null,
    childLineIds: ['line-021', 'line-022'],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-021',
    lineNo: 21,
    lineType: 'account',
    displayName: '人件費',
    subjectId: 'subj-labor',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 20000000,
    compareValue: 19000000,
    parentLineId: 'line-020',
    childLineIds: [],
    rollupCoefficient: 1,
  },
  {
    lineId: 'line-022',
    lineNo: 22,
    lineType: 'account',
    displayName: '減価償却費',
    subjectId: 'subj-depreciation',
    indentLevel: 1,
    isEditable: true,
    isAdjustment: false,
    originalValue: 10000000,
    compareValue: 9000000,
    parentLineId: 'line-020',
    childLineIds: [],
    rollupCoefficient: 1,
  },
];

const mockBreakevenChart: BffCvpBreakevenChartData = {
  maxSales: 150000000,
  salesLine: [
    { x: 0, y: 0 },
    { x: 50000000, y: 50000000 },
    { x: 100000000, y: 100000000 },
    { x: 150000000, y: 150000000 },
  ],
  totalCostLine: [
    { x: 0, y: 30000000 },
    { x: 50000000, y: 50000000 },
    { x: 100000000, y: 70000000 },
    { x: 150000000, y: 90000000 },
  ],
  fixedCostLine: [
    { x: 0, y: 30000000 },
    { x: 150000000, y: 30000000 },
  ],
  breakevenPoint: { x: 50000000, y: 50000000 },
  isCalculable: true,
};

const mockWaterfall: BffCvpWaterfallData = {
  items: [
    { id: 'wf-1', name: '売上高', value: 100000000, type: 'start' },
    { id: 'wf-2', name: '変動費', value: -40000000, type: 'decrease' },
    { id: 'wf-3', name: '限界利益', value: 60000000, type: 'subtotal' },
    { id: 'wf-4', name: '固定費', value: -30000000, type: 'decrease' },
    { id: 'wf-5', name: '営業利益', value: 30000000, type: 'end' },
  ],
};

const mockWaterfallCompare: BffCvpWaterfallData = {
  items: [
    { id: 'wf-c1', name: '売上高', value: 95000000, type: 'start' },
    { id: 'wf-c2', name: '変動費', value: -38000000, type: 'decrease' },
    { id: 'wf-c3', name: '限界利益', value: 57000000, type: 'subtotal' },
    { id: 'wf-c4', name: '固定費', value: -28000000, type: 'decrease' },
    { id: 'wf-c5', name: '営業利益', value: 29000000, type: 'end' },
  ],
};

export class MockBffClient implements BffClient {
  private delay = 300;

  async getOptions(_request: BffCvpOptionsRequest): Promise<BffCvpOptionsResponse> {
    await this.simulateDelay();
    return mockOptions;
  }

  async getData(request: BffCvpDataRequest): Promise<BffCvpDataResponse> {
    await this.simulateDelay();

    return {
      kpis: mockKpis,
      tree: mockTree,
      breakevenChart: mockBreakevenChart,
      waterfallOriginal: mockWaterfall,
      waterfallCompare: request.compareEnabled ? mockWaterfallCompare : null,
      layoutId: 'layout-001',
      layoutName: 'CVP標準レイアウト',
    };
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }
}

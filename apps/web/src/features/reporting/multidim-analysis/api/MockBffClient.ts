/**
 * Mock BffClient for Multidim Analysis Feature (UI-MOCK Phase)
 *
 * Purpose:
 * - Provide hardcoded mock data for UI development
 * - No real network calls
 * - Simulates BFF responses for all multidim analysis operations
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 14.2)
 */
import type { BffClient } from './BffClient';
import type {
  BffFieldListDto,
  BffFieldDef,
  BffMeasureDef,
  BffPivotQueryRequestDto,
  BffPivotQueryResponseDto,
  BffDrilldownRequestDto,
  BffDrilldownResponseDto,
  BffDrillthroughRequestDto,
  BffDrillthroughResponseDto,
  BffPresetListDto,
  BffLayoutPresetDto,
} from '@epm/contracts/bff/multidim-analysis';
import { AnalysisMode, UnitType } from '@epm/contracts/bff/multidim-analysis';

// ============================================================
// Mock Data: Fields
// ============================================================

const mockFields: BffFieldDef[] = [
  // Basic fields
  {
    id: 'period',
    name: 'Period',
    nameJa: '期間',
    category: 'basic',
    description: '会計期間（年月）',
    allowedZones: ['rows', 'cols', 'filters'],
    isPeriod: true,
  },
  {
    id: 'org',
    name: 'Organization',
    nameJa: '組織',
    category: 'basic',
    description: '部門・組織',
    allowedZones: ['rows', 'cols', 'filters'],
  },
  {
    id: 'account',
    name: 'Account',
    nameJa: '勘定科目',
    category: 'basic',
    description: '勘定科目',
    allowedZones: ['rows', 'cols', 'filters'],
  },
  // DimX fields (mutually exclusive)
  {
    id: 'dim1',
    name: 'Dimension 1',
    nameJa: '分析軸1（製品）',
    category: 'dimx',
    description: '製品分類',
    allowedZones: ['rows', 'cols', 'filters'],
  },
  {
    id: 'dim2',
    name: 'Dimension 2',
    nameJa: '分析軸2（顧客）',
    category: 'dimx',
    description: '顧客分類',
    allowedZones: ['rows', 'cols', 'filters'],
  },
  {
    id: 'dim3',
    name: 'Dimension 3',
    nameJa: '分析軸3（チャネル）',
    category: 'dimx',
    description: '販売チャネル',
    allowedZones: ['rows', 'cols', 'filters'],
  },
  // Option fields
  {
    id: 'project',
    name: 'Project',
    nameJa: 'プロジェクト',
    category: 'option',
    description: 'プロジェクト（プロジェクト分析モード用）',
    allowedZones: ['rows', 'cols', 'filters'],
  },
];

const mockMeasures: BffMeasureDef[] = [
  {
    id: 'amount',
    name: 'Amount',
    nameJa: '金額',
    format: 'currency',
  },
  {
    id: 'quantity',
    name: 'Quantity',
    nameJa: '数量',
    format: 'number',
  },
  {
    id: 'ratio',
    name: 'Ratio',
    nameJa: '構成比',
    format: 'percentage',
  },
];

// ============================================================
// Mock Data: Presets
// ============================================================

const mockPresets: BffLayoutPresetDto[] = [
  {
    id: 'preset-001',
    name: 'Monthly P&L by Org',
    nameJa: '月次損益（組織別）',
    description: '組織別の月次損益分析',
    layout: {
      mode: AnalysisMode.STANDARD,
      rows: ['org', 'account'],
      cols: ['period'],
      values: ['amount'],
      filters: {},
    },
  },
  {
    id: 'preset-002',
    name: 'Product Analysis',
    nameJa: '製品別分析',
    description: '製品軸での売上分析',
    layout: {
      mode: AnalysisMode.STANDARD,
      rows: ['dim1', 'account'],
      cols: ['period'],
      values: ['amount'],
      filters: {},
    },
  },
  {
    id: 'preset-003',
    name: 'Project Profitability',
    nameJa: 'プロジェクト収益性',
    description: 'プロジェクト別の収益性分析',
    layout: {
      mode: AnalysisMode.PROJECT,
      rows: ['project', 'account'],
      cols: ['period'],
      values: ['amount'],
      filters: {},
    },
  },
];

// ============================================================
// Mock Data Generation Helpers
// ============================================================

function generateMockPivotData(
  request: BffPivotQueryRequestDto
): BffPivotQueryResponseDto {
  const { layout, unit } = request;
  const rowCount = Math.max(1, layout.rows.length) * 5;
  const colCount = 6; // 6 months

  // Generate row headers
  const rowHeaders: string[][] = [];
  for (let i = 0; i < rowCount; i++) {
    const row: string[] = [];
    for (const field of layout.rows) {
      if (field === 'org') {
        row.push(['営業部', '製造部', '管理部', '開発部', '経理部'][i % 5]);
      } else if (field === 'account') {
        row.push(['売上高', '売上原価', '販管費', '営業利益', 'その他'][i % 5]);
      } else if (field === 'period') {
        row.push(`2026/${String((i % 12) + 1).padStart(2, '0')}`);
      } else if (field.startsWith('dim')) {
        row.push(`${field}_value_${(i % 3) + 1}`);
      } else if (field === 'project') {
        row.push(['PJ-A', 'PJ-B', 'PJ-C', 'PJ-D', 'PJ-E'][i % 5]);
      } else {
        row.push(`${field}_${i}`);
      }
    }
    rowHeaders.push(row);
  }

  // Generate column headers
  const colHeaders: string[] = [];
  for (let i = 0; i < colCount; i++) {
    colHeaders.push(`2026/${String(i + 1).padStart(2, '0')}`);
  }

  // Generate cells with random data
  const cells: (number | null)[][] = [];
  const unitMultiplier =
    unit === UnitType.MILLION ? 1 : unit === UnitType.THOUSAND ? 1000 : 1000000;

  for (let r = 0; r < rowCount; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < colCount; c++) {
      // Generate realistic-ish numbers
      const baseValue = Math.floor(Math.random() * 10000) + 1000;
      row.push(Math.round(baseValue / unitMultiplier));
    }
    cells.push(row);
  }

  return {
    rowHeaders,
    colHeaders,
    cells,
    meta: {
      unit,
      appliedTopN: null,
      warnings: [],
      totalRows: rowCount,
      executionTimeMs: Math.floor(Math.random() * 100) + 50,
    },
  };
}

function generateMockDrilldownData(
  request: BffDrilldownRequestDto
): BffDrilldownResponseDto {
  const { drillDimension, topN } = request;
  const items = [];
  let total = 0;

  const labels = {
    org: ['営業部', '製造部', '管理部', '開発部', '経理部'],
    account: ['売上高', '売上原価', '販管費', '営業利益', 'その他'],
    period: ['2026/01', '2026/02', '2026/03', '2026/04', '2026/05'],
    dim1: ['製品A', '製品B', '製品C', '製品D', '製品E'],
    dim2: ['顧客A', '顧客B', '顧客C', '顧客D', '顧客E'],
    dim3: ['チャネルA', 'チャネルB', 'チャネルC', 'チャネルD', 'チャネルE'],
    project: ['PJ-Alpha', 'PJ-Beta', 'PJ-Gamma', 'PJ-Delta', 'PJ-Epsilon'],
  };

  const dimensionLabels =
    labels[drillDimension as keyof typeof labels] || labels.org;
  const count = Math.min(topN, dimensionLabels.length);

  for (let i = 0; i < count; i++) {
    const value = Math.floor(Math.random() * 10000000) + 1000000;
    total += value;
    items.push({
      label: dimensionLabels[i],
      value,
      percentage: 0, // Will be calculated below
    });
  }

  // Calculate percentages
  for (const item of items) {
    item.percentage = Math.round((item.value / total) * 10000) / 100;
  }

  // Sort by value descending
  items.sort((a, b) => b.value - a.value);

  return { items, total };
}

function generateMockDrillthroughData(
  request: BffDrillthroughRequestDto
): BffDrillthroughResponseDto {
  const { page, pageSize } = request;
  const totalItems = 157; // Mock total
  const items = [];

  const orgs = ['営業部', '製造部', '管理部', '開発部', '経理部'];
  const accounts = ['売上高', '仕入高', '人件費', '経費', '減価償却費'];

  for (let i = 0; i < pageSize; i++) {
    const itemIndex = (page - 1) * pageSize + i;
    if (itemIndex >= totalItems) break;

    items.push({
      id: `fact-${itemIndex + 1}`,
      date: `2026-0${(itemIndex % 6) + 1}-${String((itemIndex % 28) + 1).padStart(2, '0')}`,
      org: orgs[itemIndex % orgs.length],
      account: accounts[itemIndex % accounts.length],
      description: `取引明細 ${itemIndex + 1}`,
      amount: Math.floor(Math.random() * 1000000) + 10000,
      dimX: itemIndex % 3 === 0 ? `dim1_value_${(itemIndex % 5) + 1}` : undefined,
      project: itemIndex % 4 === 0 ? `PJ-${String.fromCharCode(65 + (itemIndex % 5))}` : undefined,
    });
  }

  return {
    items,
    total: totalItems,
    page,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}

// ============================================================
// MockBffClient Implementation
// ============================================================

export class MockBffClient implements BffClient {
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getFields(): Promise<BffFieldListDto> {
    await this.delay();
    return {
      fields: mockFields,
      measures: mockMeasures,
    };
  }

  async executePivotQuery(
    request: BffPivotQueryRequestDto
  ): Promise<BffPivotQueryResponseDto> {
    await this.delay(500);
    return generateMockPivotData(request);
  }

  async executeDrilldown(
    request: BffDrilldownRequestDto
  ): Promise<BffDrilldownResponseDto> {
    await this.delay(300);
    return generateMockDrilldownData(request);
  }

  async executeDrillthrough(
    request: BffDrillthroughRequestDto
  ): Promise<BffDrillthroughResponseDto> {
    await this.delay(300);
    return generateMockDrillthroughData(request);
  }

  async getPresets(): Promise<BffPresetListDto> {
    await this.delay();
    return {
      presets: mockPresets,
    };
  }
}

// Default export for convenience
export const mockBffClient = new MockBffClient();

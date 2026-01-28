/**
 * Domain API Contracts for Dashboard（経営ダッシュボード）
 * SSoT for BFF/Domain API communication
 * Reference: .kiro/specs/reporting/dashboard/design.md
 */

import { WidgetType, DataSourceType, OwnerType } from '../../shared/enums/dashboard';

// Re-export enums
export { WidgetType, DataSourceType, OwnerType };

// ============================================================
// Shared Types (same as BFF for consistency)
// ============================================================

export const ScenarioType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];

export const DisplayGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  YEARLY: 'YEARLY',
} as const;
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity];

// ============================================================
// JSONB Config Types (shared with BFF)
// ============================================================

export interface GlobalFilterConfig {
  fiscalYear?: number;
  departmentStableId?: string;
  includeChildren?: boolean;
  periodStart?: string;
  periodEnd?: string;
  displayGranularity?: DisplayGranularity;
  primary?: {
    scenarioType: ScenarioType;
    planEventId?: string;
    planVersionId?: string;
  };
  compare?: {
    enabled: boolean;
    scenarioType?: ScenarioType;
    planEventId?: string;
    planVersionId?: string;
  };
}

export interface WidgetLayoutConfig {
  row: number;
  col: number;
  sizeX: number;
  sizeY: number;
}

export interface DataSource {
  type: DataSourceType;
  refId: string;
  label?: string;
  color?: string;
}

export interface WidgetDataConfig {
  sources: DataSource[];
}

export interface WidgetFilterConfig {
  useGlobal: boolean;
  overrides?: Partial<GlobalFilterConfig>;
}

// Widget display configs (same structure)
export interface KpiCardDisplayConfig {
  showSparkline?: boolean;
  showCompare?: boolean;
  thresholds?: { danger?: number; warning?: number };
}

export interface LineChartDisplayConfig {
  showLegend?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
}

export interface BarChartDisplayConfig {
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export interface PieChartDisplayConfig {
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
}

export interface GaugeDisplayConfig {
  style?: 'full' | 'half';
  thresholds?: { danger?: number; warning?: number };
}

export interface TableDisplayConfig {
  showCompareColumns?: boolean;
  columns?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TextDisplayConfig {
  content: string;
}

export interface CompositeChartDisplayConfig {
  primaryAxis?: 'left' | 'right';
  secondaryAxis?: 'left' | 'right';
  showLegend?: boolean;
}

export type WidgetDisplayConfig =
  | KpiCardDisplayConfig
  | LineChartDisplayConfig
  | BarChartDisplayConfig
  | PieChartDisplayConfig
  | GaugeDisplayConfig
  | TableDisplayConfig
  | TextDisplayConfig
  | CompositeChartDisplayConfig;

// ============================================================
// API DTOs - Response
// ============================================================

/** ダッシュボードDTO（API） */
export interface ApiDashboardDto {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  ownerType: OwnerType;
  ownerId: string | null;
  globalFilterConfig: GlobalFilterConfig;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

/** ウィジェットDTO（API） */
export interface ApiWidgetDto {
  id: string;
  dashboardId: string;
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** ダッシュボード詳細DTO（ウィジェット含む） */
export interface ApiDashboardDetailDto extends ApiDashboardDto {
  widgets: ApiWidgetDto[];
}

// ============================================================
// API DTOs - Request
// ============================================================

/** ウィジェット作成リクエスト */
export interface ApiCreateWidgetDto {
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder?: number;
}

/** ダッシュボード作成リクエスト */
export interface ApiCreateDashboardDto {
  name: string;
  description?: string;
  templateId?: string;
  globalFilterConfig?: GlobalFilterConfig;
  widgets?: ApiCreateWidgetDto[];
}

/** ウィジェット更新リクエスト */
export interface ApiUpdateWidgetDto {
  id?: string;
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder?: number;
}

/** ダッシュボード更新リクエスト */
export interface ApiUpdateDashboardDto {
  name?: string;
  description?: string;
  globalFilterConfig?: GlobalFilterConfig;
  widgets?: ApiUpdateWidgetDto[];
}

// ============================================================
// API DTOs - Widget Data
// ============================================================

/** 解決済みフィルター条件 */
export interface ResolvedFilterConfig {
  fiscalYear: number;
  departmentStableId: string;
  includeChildren: boolean;
  periodStart: string;
  periodEnd: string;
  displayGranularity: DisplayGranularity;
  primaryScenarioType: ScenarioType;
  primaryPlanEventId?: string;
  primaryPlanVersionId?: string;
  compareEnabled: boolean;
  compareScenarioType?: ScenarioType;
  comparePlanEventId?: string;
  comparePlanVersionId?: string;
}

/** ウィジェットデータリクエスト */
export interface ApiWidgetDataRequestDto {
  filter: ResolvedFilterConfig;
}

/** データポイント */
export interface ApiDataPoint {
  label: string;
  value: number | null;
  compareValue?: number | null;
}

/** ウィジェットデータレスポンス */
export interface ApiWidgetDataResponseDto {
  widgetId: string;
  dataPoints: ApiDataPoint[];
  difference?: {
    value: number | null;
    rate: number | null;
  };
  unit: string | null;
  meta?: {
    sourceName?: string;
    lastUpdated?: string;
  };
}

// ============================================================
// API DTOs - Selectors
// ============================================================

/** 選択肢取得パラメータ */
export interface ApiDashboardSelectorsQueryDto {
  fiscalYear?: number;
  scenarioType?: ScenarioType;
  planEventId?: string;
}

/** 計画イベント */
export interface ApiPlanEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: ScenarioType;
  fiscalYear: number;
}

/** 計画バージョン */
export interface ApiPlanVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  status: string;
}

/** 部門ノード */
export interface ApiDepartmentNode {
  stableId: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  hasChildren: boolean;
  children?: ApiDepartmentNode[];
}

/** 選択肢レスポンス */
export interface ApiDashboardSelectorsResponseDto {
  fiscalYears: number[];
  planEvents: ApiPlanEventOption[];
  planVersions: ApiPlanVersionOption[];
  departments: ApiDepartmentNode[];
}

// ============================================================
// API DTOs - Data Source Selectors
// ============================================================

/** 非財務KPI定義の選択肢 */
export interface ApiKpiDefinitionOption {
  id: string;
  kpiCode: string;
  kpiName: string;
  unit: string | null;
}

/** 非財務KPI定義選択肢一覧 */
export interface ApiKpiDefinitionOptionListDto {
  items: ApiKpiDefinitionOption[];
}

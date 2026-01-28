/**
 * BFF Contracts for Dashboard（経営ダッシュボード）
 * SSoT for UI/BFF communication
 * Reference: .kiro/specs/reporting/dashboard/design.md
 */

import { WidgetType, DataSourceType, OwnerType } from '../../shared/enums/dashboard';

// Re-export enums for convenience
export { WidgetType, DataSourceType, OwnerType };

// ============================================================
// Shared Enums (re-use from indicator-report)
// ============================================================

/** シナリオ種別 */
export const ScenarioType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];

/** 表示粒度 */
export const DisplayGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  YEARLY: 'YEARLY',
} as const;
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity];

// ============================================================
// JSONB Config Types (Task 3.5)
// ============================================================

/** グローバルフィルター設定 */
export interface GlobalFilterConfig {
  fiscalYear?: number;
  departmentStableId?: string;
  includeChildren?: boolean;
  periodStart?: string; // YYYYMM
  periodEnd?: string; // YYYYMM
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

/** ウィジェットレイアウト設定 */
export interface WidgetLayoutConfig {
  row: number;
  col: number;
  sizeX: number;
  sizeY: number;
}

/** データソース */
export interface DataSource {
  type: DataSourceType;
  refId: string; // FACT→subjects.stable_id, KPI→kpi_definitions.id, METRIC→metrics.id
  label?: string; // 凡例名
  color?: string; // チャート色
}

/** ウィジェットデータ設定 */
export interface WidgetDataConfig {
  sources: DataSource[];
}

/** ウィジェットフィルター設定 */
export interface WidgetFilterConfig {
  useGlobal: boolean;
  overrides?: Partial<GlobalFilterConfig>;
}

// ============================================================
// Widget Display Config Types (by widget type)
// ============================================================

/** KPIカード表示設定 */
export interface KpiCardDisplayConfig {
  showSparkline?: boolean;
  showCompare?: boolean;
  thresholds?: { danger?: number; warning?: number };
}

/** 折れ線チャート表示設定 */
export interface LineChartDisplayConfig {
  showLegend?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
}

/** 棒グラフ表示設定 */
export interface BarChartDisplayConfig {
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  showLegend?: boolean;
  showDataLabels?: boolean;
}

/** 円グラフ表示設定 */
export interface PieChartDisplayConfig {
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
}

/** ゲージ表示設定 */
export interface GaugeDisplayConfig {
  style?: 'full' | 'half';
  thresholds?: { danger?: number; warning?: number };
}

/** テーブル表示設定 */
export interface TableDisplayConfig {
  showCompareColumns?: boolean;
  columns?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** テキスト表示設定 */
export interface TextDisplayConfig {
  content: string; // Markdown
}

/** 複合チャート表示設定 */
export interface CompositeChartDisplayConfig {
  primaryAxis?: 'left' | 'right';
  secondaryAxis?: 'left' | 'right';
  showLegend?: boolean;
}

/** ウィジェット表示設定（Union型） */
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
// BFF DTOs - Dashboard (Task 3.1)
// ============================================================

/** ダッシュボード基本DTO */
export interface BffDashboardDto {
  id: string;
  name: string;
  description: string | null;
  ownerType: OwnerType;
  ownerId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}

/** ウィジェットDTO */
export interface BffWidgetDto {
  id: string;
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder: number;
}

/** ダッシュボード詳細DTO（ウィジェット含む） */
export interface BffDashboardDetailDto extends BffDashboardDto {
  globalFilterConfig: GlobalFilterConfig;
  widgets: BffWidgetDto[];
}

/** ダッシュボード一覧DTO */
export interface BffDashboardListDto {
  items: BffDashboardDto[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// BFF DTOs - Create/Update (Task 3.2)
// ============================================================

/** ウィジェット作成DTO */
export interface BffCreateWidgetDto {
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder?: number;
}

/** ダッシュボード作成DTO */
export interface BffCreateDashboardDto {
  name: string;
  description?: string;
  templateId?: string; // テンプレートから作成する場合
  globalFilterConfig?: GlobalFilterConfig;
  widgets?: BffCreateWidgetDto[];
}

/** ウィジェット更新DTO */
export interface BffUpdateWidgetDto {
  id?: string; // 既存ウィジェット更新の場合
  widgetType: WidgetType;
  title: string;
  layout: WidgetLayoutConfig;
  dataConfig: WidgetDataConfig;
  filterConfig: WidgetFilterConfig;
  displayConfig: WidgetDisplayConfig;
  sortOrder?: number;
}

/** ダッシュボード更新DTO */
export interface BffUpdateDashboardDto {
  name?: string;
  description?: string;
  globalFilterConfig?: GlobalFilterConfig;
  widgets?: BffUpdateWidgetDto[];
}

/** テンプレートDTO */
export interface BffDashboardTemplateDto {
  id: string;
  name: string;
  description: string | null;
  widgetCount: number;
}

/** テンプレート一覧DTO */
export interface BffDashboardTemplateListDto {
  templates: BffDashboardTemplateDto[];
}

// ============================================================
// BFF DTOs - Widget Data (Task 3.3)
// ============================================================

/** ウィジェットデータリクエストDTO */
export interface BffWidgetDataRequestDto {
  /** グローバルフィルター適用後のフィルター条件（解決済み） */
  resolvedFilter: {
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
  };
}

/** データポイント */
export interface BffDataPoint {
  label: string; // 期間ラベル（例: "2024/01", "Q1"）
  value: number | null;
  compareValue?: number | null;
}

/** ウィジェットデータレスポンスDTO */
export interface BffWidgetDataResponseDto {
  widgetId: string;
  dataPoints: BffDataPoint[];
  /** Compare ON時の差異データ */
  difference?: {
    value: number | null;
    rate: number | null; // パーセンテージ
  };
  unit: string | null;
  /** 追加メタ情報 */
  meta?: {
    sourceName?: string;
    lastUpdated?: string;
  };
}

// ============================================================
// BFF DTOs - Selectors (Task 3.4)
// ============================================================

/** 選択肢取得リクエストDTO */
export interface BffDashboardSelectorsRequestDto {
  fiscalYear?: number;
  scenarioType?: ScenarioType;
  planEventId?: string;
}

/** 計画イベント選択肢 */
export interface BffPlanEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: ScenarioType;
  fiscalYear: number;
}

/** 計画バージョン選択肢 */
export interface BffPlanVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  status: string;
}

/** 部門ノード */
export interface BffDepartmentNode {
  stableId: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  hasChildren: boolean;
  children?: BffDepartmentNode[];
}

/** 選択肢レスポンスDTO */
export interface BffDashboardSelectorsResponseDto {
  fiscalYears: number[];
  planEvents: BffPlanEventOption[];
  planVersions: BffPlanVersionOption[];
  departments: BffDepartmentNode[];
}

// ============================================================
// BFF DTOs - Data Source Selectors
// ============================================================

/** 非財務KPI定義の選択肢 */
export interface BffKpiDefinitionOption {
  id: string;
  kpiCode: string;
  kpiName: string;
  unit: string | null;
}

/** 非財務KPI定義選択肢一覧 */
export interface BffKpiDefinitionOptionListDto {
  items: BffKpiDefinitionOption[];
}

// ============================================================
// Error Codes
// ============================================================

/** エラーコード */
export const DashboardErrorCode = {
  NOT_FOUND: 'DASHBOARD_NOT_FOUND',
  ACCESS_DENIED: 'DASHBOARD_ACCESS_DENIED',
  DELETE_FORBIDDEN: 'DASHBOARD_DELETE_FORBIDDEN',
  WIDGET_DATA_ERROR: 'DASHBOARD_WIDGET_DATA_ERROR',
  INVALID_FILTER_CONFIG: 'DASHBOARD_INVALID_FILTER_CONFIG',
} as const;
export type DashboardErrorCode = (typeof DashboardErrorCode)[keyof typeof DashboardErrorCode];

/** エラーレスポンス */
export interface DashboardError {
  code: DashboardErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * コンポーネント設定型定義
 * config_json の詳細設定を TypeScript で厳密に管理
 */

// ===========================
// Base Config（全コンポーネント共通）
// ===========================
export interface BaseConfig {
  /** カスタムタイトル */
  title?: string;
  /** ヘッダー表示 */
  showHeader?: boolean;
  /** 折りたたみ可能 */
  collapsible?: boolean;
  /** デフォルトで折りたたむ */
  defaultCollapsed?: boolean;
  /** データなし時に非表示 */
  hideWhenEmpty?: boolean;
  /** データなし時のメッセージ */
  emptyMessage?: string;
}

// ===========================
// KPI_CARD Config
// ===========================
export interface KpiCardConfig extends BaseConfig {
  /** 表示するKPI科目ID一覧 */
  subjectIds: string[];
  /** レイアウト形式 */
  layout: 'grid' | 'list';
  /** グリッド列数（layoutがgridの場合） */
  columns?: 2 | 3 | 4;
  /** 目標値表示 */
  showTarget?: boolean;
  /** 差異表示 */
  showVariance?: boolean;
  /** トレンド表示 */
  showTrend?: boolean;
  /** スパークライン表示 */
  showSparkline?: boolean;
  /** 閾値設定（色分け） */
  thresholds?: {
    /** 危険閾値（%） */
    danger?: number;
    /** 警告閾値（%） */
    warning?: number;
  };
}

// ===========================
// TABLE Config
// ===========================
export interface TableConfig extends BaseConfig {
  /** 行軸 */
  rowAxis: 'organization' | 'subject' | 'period';
  /** 比較モード */
  compareMode:
    | 'BUDGET_VS_ACTUAL'
    | 'BUDGET_VS_ACTUAL_FORECAST'
    | 'YOY'
    | 'MOM';
  /** 表示列 */
  columns: ('budget' | 'actual' | 'forecast' | 'variance' | 'varianceRate')[];
  /** 合計行表示 */
  showTotal?: boolean;
  /** 小計行表示 */
  showSubtotal?: boolean;
  /** 差異ハイライト */
  highlightVariance?: boolean;
  /** 対象科目ID一覧 */
  subjectIds?: string[];
  /** 対象組織ID一覧 */
  organizationIds?: string[];
  /** 対象期間 */
  periods?: {
    start: string;
    end: string;
  };
}

// ===========================
// CHART Config
// ===========================
export interface ChartConfig extends BaseConfig {
  /** チャートタイプ */
  chartType: 'waterfall' | 'bar' | 'line' | 'area' | 'pie' | 'donut';
  /** X軸 */
  xAxis: 'period' | 'organization' | 'subject';
  /** データ系列 */
  series: {
    dataKey: string;
    name: string;
    color?: string;
  }[];
  /** 凡例表示 */
  showLegend?: boolean;
  /** データラベル表示 */
  showDataLabels?: boolean;
  /** グリッド線表示 */
  showGrid?: boolean;
  /** ウォーターフォール固有設定 */
  waterfallConfig?: {
    startLabel?: string;
    endLabel?: string;
    positiveColor?: string;
    negativeColor?: string;
    totalColor?: string;
  };
}

// ===========================
// SUBMISSION_DISPLAY Config
// ===========================
export interface SubmissionDisplayConfig extends BaseConfig {
  /** 表示モード */
  displayMode: 'tree' | 'flat' | 'card';
  /** 対象セクションID一覧 */
  sectionIds?: string[];
  /** 組織階層表示 */
  showOrganizationHierarchy?: boolean;
  /** 提出状況表示 */
  showSubmissionStatus?: boolean;
  /** デフォルト展開 */
  expandByDefault?: boolean;
  /** グループ化軸 */
  groupBy?: 'section' | 'organization';
}

// ===========================
// REPORT_LINK Config
// ===========================
export interface ReportLinkConfig extends BaseConfig {
  /** リンク一覧 */
  links: {
    id: string;
    label: string;
    url: string;
    description?: string;
    icon?: string;
    category?: string;
  }[];
  /** レイアウト形式 */
  layout: 'grid' | 'list';
  /** グリッド列数 */
  columns?: 2 | 3 | 4;
}

// ===========================
// ACTION_LIST Config
// ===========================
export interface ActionListConfig extends BaseConfig {
  /** ステータスフィルタ */
  filterStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
  /** 優先度フィルタ */
  filterPriority?: ('HIGH' | 'MEDIUM' | 'LOW')[];
  /** 担当者表示 */
  showAssignee?: boolean;
  /** 期日表示 */
  showDueDate?: boolean;
  /** ステータス表示 */
  showStatus?: boolean;
  /** ステータス変更許可 */
  allowStatusChange?: boolean;
  /** ソートキー */
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
}

// ===========================
// SNAPSHOT_COMPARE Config
// ===========================
export interface SnapshotCompareConfig extends BaseConfig {
  /** 比較対象 */
  compareTarget: 'previous_meeting' | 'specific_snapshot';
  /** 特定スナップショットID（compareTargetがspecific_snapshotの場合） */
  specificSnapshotId?: string;
  /** 比較メトリクス一覧 */
  metrics: string[];
  /** 変更ハイライト */
  highlightChanges?: boolean;
  /** 閾値設定 */
  thresholds?: {
    /** 有意変更閾値（%） */
    significantChange?: number;
    /** 大幅変更閾値（%） */
    majorChange?: number;
  };
  /** 方向表示（↑↓） */
  showDirection?: boolean;
  /** パーセント表示 */
  showPercentage?: boolean;
}

// ===========================
// KPI_DASHBOARD Config
// ===========================
export interface KpiDashboardConfig extends BaseConfig {
  /** 対象KPI定義ID一覧 */
  kpiDefinitionIds?: string[];
  /** レイアウト形式 */
  layout: 'grid' | 'list';
  /** グリッド列数 */
  columns?: 2 | 3 | 4;
  /** チャート表示 */
  showChart?: boolean;
  /** チャート期間数 */
  chartPeriods?: number;
  /** アクション表示 */
  showActions?: boolean;
  /** ステータスフィルタ */
  filterByStatus?: ('ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')[];
}

// ===========================
// AP_PROGRESS Config
// ===========================
export interface ApProgressConfig extends BaseConfig {
  /** 対象アクションプランID一覧 */
  actionPlanIds?: string[];
  /** ガントチャート表示 */
  showGantt?: boolean;
  /** カンバン表示 */
  showKanban?: boolean;
  /** 進捗表示 */
  showProgress?: boolean;
  /** マイルストーン表示 */
  showMilestones?: boolean;
  /** ステータスフィルタ */
  filterByStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED')[];
  /** グループ化軸 */
  groupBy?: 'kpi' | 'assignee' | 'status';
}

// ===========================
// Union Type
// ===========================
export type ComponentConfig =
  | KpiCardConfig
  | TableConfig
  | ChartConfig
  | SubmissionDisplayConfig
  | ReportLinkConfig
  | ActionListConfig
  | SnapshotCompareConfig
  | KpiDashboardConfig
  | ApProgressConfig;

// ===========================
// Type Guard Functions
// ===========================
export function isKpiCardConfig(config: ComponentConfig): config is KpiCardConfig {
  return 'subjectIds' in config && 'layout' in config && !('chartType' in config);
}

export function isTableConfig(config: ComponentConfig): config is TableConfig {
  return 'rowAxis' in config && 'compareMode' in config;
}

export function isChartConfig(config: ComponentConfig): config is ChartConfig {
  return 'chartType' in config && 'xAxis' in config;
}

export function isSubmissionDisplayConfig(config: ComponentConfig): config is SubmissionDisplayConfig {
  return 'displayMode' in config && ('sectionIds' in config || 'showOrganizationHierarchy' in config);
}

export function isReportLinkConfig(config: ComponentConfig): config is ReportLinkConfig {
  return 'links' in config && Array.isArray((config as ReportLinkConfig).links);
}

export function isActionListConfig(config: ComponentConfig): config is ActionListConfig {
  return 'allowStatusChange' in config || ('filterStatus' in config && !('compareTarget' in config));
}

export function isSnapshotCompareConfig(config: ComponentConfig): config is SnapshotCompareConfig {
  return 'compareTarget' in config && 'metrics' in config;
}

export function isKpiDashboardConfig(config: ComponentConfig): config is KpiDashboardConfig {
  return 'kpiDefinitionIds' in config || ('filterByStatus' in config && 'showChart' in config);
}

export function isApProgressConfig(config: ComponentConfig): config is ApProgressConfig {
  return 'actionPlanIds' in config || 'showGantt' in config || 'showKanban' in config;
}

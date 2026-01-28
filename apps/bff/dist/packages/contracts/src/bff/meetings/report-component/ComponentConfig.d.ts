export interface BaseConfig {
    title?: string;
    showHeader?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    hideWhenEmpty?: boolean;
    emptyMessage?: string;
}
export interface KpiCardConfig extends BaseConfig {
    subjectIds: string[];
    layout: 'grid' | 'list';
    columns?: 2 | 3 | 4;
    showTarget?: boolean;
    showVariance?: boolean;
    showTrend?: boolean;
    showSparkline?: boolean;
    thresholds?: {
        danger?: number;
        warning?: number;
    };
}
export interface TableConfig extends BaseConfig {
    rowAxis: 'organization' | 'subject' | 'period';
    compareMode: 'BUDGET_VS_ACTUAL' | 'BUDGET_VS_ACTUAL_FORECAST' | 'YOY' | 'MOM';
    columns: ('budget' | 'actual' | 'forecast' | 'variance' | 'varianceRate')[];
    showTotal?: boolean;
    showSubtotal?: boolean;
    highlightVariance?: boolean;
    subjectIds?: string[];
    organizationIds?: string[];
    periods?: {
        start: string;
        end: string;
    };
}
export interface ChartConfig extends BaseConfig {
    chartType: 'waterfall' | 'bar' | 'line' | 'area' | 'pie' | 'donut';
    xAxis: 'period' | 'organization' | 'subject';
    series: {
        dataKey: string;
        name: string;
        color?: string;
    }[];
    showLegend?: boolean;
    showDataLabels?: boolean;
    showGrid?: boolean;
    waterfallConfig?: {
        startLabel?: string;
        endLabel?: string;
        positiveColor?: string;
        negativeColor?: string;
        totalColor?: string;
    };
}
export interface SubmissionDisplayConfig extends BaseConfig {
    displayMode: 'tree' | 'flat' | 'card';
    sectionIds?: string[];
    showOrganizationHierarchy?: boolean;
    showSubmissionStatus?: boolean;
    expandByDefault?: boolean;
    groupBy?: 'section' | 'organization';
}
export interface ReportLinkConfig extends BaseConfig {
    links: {
        id: string;
        label: string;
        url: string;
        description?: string;
        icon?: string;
        category?: string;
    }[];
    layout: 'grid' | 'list';
    columns?: 2 | 3 | 4;
}
export interface ActionListConfig extends BaseConfig {
    filterStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
    filterPriority?: ('HIGH' | 'MEDIUM' | 'LOW')[];
    showAssignee?: boolean;
    showDueDate?: boolean;
    showStatus?: boolean;
    allowStatusChange?: boolean;
    sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
export interface SnapshotCompareConfig extends BaseConfig {
    compareTarget: 'previous_meeting' | 'specific_snapshot';
    specificSnapshotId?: string;
    metrics: string[];
    highlightChanges?: boolean;
    thresholds?: {
        significantChange?: number;
        majorChange?: number;
    };
    showDirection?: boolean;
    showPercentage?: boolean;
}
export interface KpiDashboardConfig extends BaseConfig {
    kpiDefinitionIds?: string[];
    layout: 'grid' | 'list';
    columns?: 2 | 3 | 4;
    showChart?: boolean;
    chartPeriods?: number;
    showActions?: boolean;
    filterByStatus?: ('ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')[];
}
export interface ApProgressConfig extends BaseConfig {
    actionPlanIds?: string[];
    showGantt?: boolean;
    showKanban?: boolean;
    showProgress?: boolean;
    showMilestones?: boolean;
    filterByStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED')[];
    groupBy?: 'kpi' | 'assignee' | 'status';
}
export type ComponentConfig = KpiCardConfig | TableConfig | ChartConfig | SubmissionDisplayConfig | ReportLinkConfig | ActionListConfig | SnapshotCompareConfig | KpiDashboardConfig | ApProgressConfig;
export declare function isKpiCardConfig(config: ComponentConfig): config is KpiCardConfig;
export declare function isTableConfig(config: ComponentConfig): config is TableConfig;
export declare function isChartConfig(config: ComponentConfig): config is ChartConfig;
export declare function isSubmissionDisplayConfig(config: ComponentConfig): config is SubmissionDisplayConfig;
export declare function isReportLinkConfig(config: ComponentConfig): config is ReportLinkConfig;
export declare function isActionListConfig(config: ComponentConfig): config is ActionListConfig;
export declare function isSnapshotCompareConfig(config: ComponentConfig): config is SnapshotCompareConfig;
export declare function isKpiDashboardConfig(config: ComponentConfig): config is KpiDashboardConfig;
export declare function isApProgressConfig(config: ComponentConfig): config is ApProgressConfig;

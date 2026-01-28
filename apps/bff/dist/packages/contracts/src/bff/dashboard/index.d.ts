import { WidgetType, DataSourceType, OwnerType } from '../../shared/enums/dashboard';
export { WidgetType, DataSourceType, OwnerType };
export declare const ScenarioType: {
    readonly BUDGET: "BUDGET";
    readonly FORECAST: "FORECAST";
    readonly ACTUAL: "ACTUAL";
};
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];
export declare const DisplayGranularity: {
    readonly MONTHLY: "MONTHLY";
    readonly QUARTERLY: "QUARTERLY";
    readonly HALF_YEARLY: "HALF_YEARLY";
    readonly YEARLY: "YEARLY";
};
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity];
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
export interface KpiCardDisplayConfig {
    showSparkline?: boolean;
    showCompare?: boolean;
    thresholds?: {
        danger?: number;
        warning?: number;
    };
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
    thresholds?: {
        danger?: number;
        warning?: number;
    };
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
export type WidgetDisplayConfig = KpiCardDisplayConfig | LineChartDisplayConfig | BarChartDisplayConfig | PieChartDisplayConfig | GaugeDisplayConfig | TableDisplayConfig | TextDisplayConfig | CompositeChartDisplayConfig;
export interface BffDashboardDto {
    id: string;
    name: string;
    description: string | null;
    ownerType: OwnerType;
    ownerId: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}
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
export interface BffDashboardDetailDto extends BffDashboardDto {
    globalFilterConfig: GlobalFilterConfig;
    widgets: BffWidgetDto[];
}
export interface BffDashboardListDto {
    items: BffDashboardDto[];
    total: number;
    page: number;
    pageSize: number;
}
export interface BffCreateWidgetDto {
    widgetType: WidgetType;
    title: string;
    layout: WidgetLayoutConfig;
    dataConfig: WidgetDataConfig;
    filterConfig: WidgetFilterConfig;
    displayConfig: WidgetDisplayConfig;
    sortOrder?: number;
}
export interface BffCreateDashboardDto {
    name: string;
    description?: string;
    templateId?: string;
    globalFilterConfig?: GlobalFilterConfig;
    widgets?: BffCreateWidgetDto[];
}
export interface BffUpdateWidgetDto {
    id?: string;
    widgetType: WidgetType;
    title: string;
    layout: WidgetLayoutConfig;
    dataConfig: WidgetDataConfig;
    filterConfig: WidgetFilterConfig;
    displayConfig: WidgetDisplayConfig;
    sortOrder?: number;
}
export interface BffUpdateDashboardDto {
    name?: string;
    description?: string;
    globalFilterConfig?: GlobalFilterConfig;
    widgets?: BffUpdateWidgetDto[];
}
export interface BffDashboardTemplateDto {
    id: string;
    name: string;
    description: string | null;
    widgetCount: number;
}
export interface BffDashboardTemplateListDto {
    templates: BffDashboardTemplateDto[];
}
export interface BffWidgetDataRequestDto {
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
export interface BffDataPoint {
    label: string;
    value: number | null;
    compareValue?: number | null;
}
export interface BffWidgetDataResponseDto {
    widgetId: string;
    dataPoints: BffDataPoint[];
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
export interface BffDashboardSelectorsRequestDto {
    fiscalYear?: number;
    scenarioType?: ScenarioType;
    planEventId?: string;
}
export interface BffPlanEventOption {
    id: string;
    eventCode: string;
    eventName: string;
    scenarioType: ScenarioType;
    fiscalYear: number;
}
export interface BffPlanVersionOption {
    id: string;
    versionCode: string;
    versionName: string;
    status: string;
}
export interface BffDepartmentNode {
    stableId: string;
    departmentCode: string;
    departmentName: string;
    level: number;
    hasChildren: boolean;
    children?: BffDepartmentNode[];
}
export interface BffDashboardSelectorsResponseDto {
    fiscalYears: number[];
    planEvents: BffPlanEventOption[];
    planVersions: BffPlanVersionOption[];
    departments: BffDepartmentNode[];
}
export interface BffKpiDefinitionOption {
    id: string;
    kpiCode: string;
    kpiName: string;
    unit: string | null;
}
export interface BffKpiDefinitionOptionListDto {
    items: BffKpiDefinitionOption[];
}
export declare const DashboardErrorCode: {
    readonly NOT_FOUND: "DASHBOARD_NOT_FOUND";
    readonly ACCESS_DENIED: "DASHBOARD_ACCESS_DENIED";
    readonly DELETE_FORBIDDEN: "DASHBOARD_DELETE_FORBIDDEN";
    readonly WIDGET_DATA_ERROR: "DASHBOARD_WIDGET_DATA_ERROR";
    readonly INVALID_FILTER_CONFIG: "DASHBOARD_INVALID_FILTER_CONFIG";
};
export type DashboardErrorCode = (typeof DashboardErrorCode)[keyof typeof DashboardErrorCode];
export interface DashboardError {
    code: DashboardErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

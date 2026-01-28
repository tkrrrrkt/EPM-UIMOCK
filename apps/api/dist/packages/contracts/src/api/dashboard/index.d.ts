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
export interface ApiDashboardDetailDto extends ApiDashboardDto {
    widgets: ApiWidgetDto[];
}
export interface ApiCreateWidgetDto {
    widgetType: WidgetType;
    title: string;
    layout: WidgetLayoutConfig;
    dataConfig: WidgetDataConfig;
    filterConfig: WidgetFilterConfig;
    displayConfig: WidgetDisplayConfig;
    sortOrder?: number;
}
export interface ApiCreateDashboardDto {
    name: string;
    description?: string;
    templateId?: string;
    globalFilterConfig?: GlobalFilterConfig;
    widgets?: ApiCreateWidgetDto[];
}
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
export interface ApiUpdateDashboardDto {
    name?: string;
    description?: string;
    globalFilterConfig?: GlobalFilterConfig;
    widgets?: ApiUpdateWidgetDto[];
}
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
export interface ApiWidgetDataRequestDto {
    filter: ResolvedFilterConfig;
}
export interface ApiDataPoint {
    label: string;
    value: number | null;
    compareValue?: number | null;
}
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
export interface ApiDashboardSelectorsQueryDto {
    fiscalYear?: number;
    scenarioType?: ScenarioType;
    planEventId?: string;
}
export interface ApiPlanEventOption {
    id: string;
    eventCode: string;
    eventName: string;
    scenarioType: ScenarioType;
    fiscalYear: number;
}
export interface ApiPlanVersionOption {
    id: string;
    versionCode: string;
    versionName: string;
    status: string;
}
export interface ApiDepartmentNode {
    stableId: string;
    departmentCode: string;
    departmentName: string;
    level: number;
    hasChildren: boolean;
    children?: ApiDepartmentNode[];
}
export interface ApiDashboardSelectorsResponseDto {
    fiscalYears: number[];
    planEvents: ApiPlanEventOption[];
    planVersions: ApiPlanVersionOption[];
    departments: ApiDepartmentNode[];
}
export interface ApiKpiDefinitionOption {
    id: string;
    kpiCode: string;
    kpiName: string;
    unit: string | null;
}
export interface ApiKpiDefinitionOptionListDto {
    items: ApiKpiDefinitionOption[];
}

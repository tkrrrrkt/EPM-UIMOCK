export declare const WidgetType: {
    readonly KPI_CARD: "KPI_CARD";
    readonly LINE_CHART: "LINE_CHART";
    readonly BAR_CHART: "BAR_CHART";
    readonly PIE_CHART: "PIE_CHART";
    readonly GAUGE: "GAUGE";
    readonly TABLE: "TABLE";
    readonly TEXT: "TEXT";
    readonly COMPOSITE_CHART: "COMPOSITE_CHART";
};
export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType];

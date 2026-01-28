export declare const DataSourceType: {
    readonly FACT: "FACT";
    readonly KPI: "KPI";
    readonly METRIC: "METRIC";
};
export type DataSourceType = (typeof DataSourceType)[keyof typeof DataSourceType];

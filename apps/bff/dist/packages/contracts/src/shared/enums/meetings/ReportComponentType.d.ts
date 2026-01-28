export declare const ReportComponentType: {
    readonly KPI_CARD: "KPI_CARD";
    readonly TABLE: "TABLE";
    readonly CHART: "CHART";
    readonly SUBMISSION_DISPLAY: "SUBMISSION_DISPLAY";
    readonly REPORT_LINK: "REPORT_LINK";
    readonly ACTION_LIST: "ACTION_LIST";
    readonly SNAPSHOT_COMPARE: "SNAPSHOT_COMPARE";
    readonly KPI_DASHBOARD: "KPI_DASHBOARD";
    readonly AP_PROGRESS: "AP_PROGRESS";
};
export type ReportComponentType = (typeof ReportComponentType)[keyof typeof ReportComponentType];

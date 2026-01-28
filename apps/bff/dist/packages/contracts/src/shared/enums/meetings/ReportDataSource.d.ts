export declare const ReportDataSource: {
    readonly FACT: "FACT";
    readonly KPI: "KPI";
    readonly SUBMISSION: "SUBMISSION";
    readonly SNAPSHOT: "SNAPSHOT";
    readonly EXTERNAL: "EXTERNAL";
};
export type ReportDataSource = (typeof ReportDataSource)[keyof typeof ReportDataSource];

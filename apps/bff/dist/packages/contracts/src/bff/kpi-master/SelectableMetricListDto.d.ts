export interface SelectableMetricDto {
    id: string;
    metricCode: string;
    metricName: string;
    kpiManaged: boolean;
}
export interface SelectableMetricListDto {
    metrics: SelectableMetricDto[];
}

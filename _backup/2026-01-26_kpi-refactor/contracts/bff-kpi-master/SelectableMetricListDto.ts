/**
 * 選択可能指標
 */
export interface SelectableMetricDto {
  /** 指標ID */
  id: string;
  /** 指標コード */
  metricCode: string;
  /** 指標名 */
  metricName: string;
  /** KPI管理対象フラグ */
  kpiManaged: boolean;
}

/**
 * 選択可能指標一覧DTO
 */
export interface SelectableMetricListDto {
  /** 選択可能指標一覧（kpi_managed=true） */
  metrics: SelectableMetricDto[];
}

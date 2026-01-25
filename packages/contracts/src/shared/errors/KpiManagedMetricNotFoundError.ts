/**
 * kpi_managed=trueの指標が見つからない場合のエラー
 */
export class KpiManagedMetricNotFoundError extends Error {
  constructor(message: string = 'KPI-managed metric not found (kpi_managed=true required)') {
    super(message);
    this.name = 'KpiManagedMetricNotFoundError';
  }
}

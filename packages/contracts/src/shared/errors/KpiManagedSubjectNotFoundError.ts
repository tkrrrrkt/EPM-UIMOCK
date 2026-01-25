/**
 * kpi_managed=trueの財務科目が見つからない場合のエラー
 */
export class KpiManagedSubjectNotFoundError extends Error {
  constructor(message: string = 'KPI-managed subject not found (kpi_managed=true required)') {
    super(message);
    this.name = 'KpiManagedSubjectNotFoundError';
  }
}

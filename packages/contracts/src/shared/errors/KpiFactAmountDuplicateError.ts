/**
 * 非財務KPI予実の期間が重複している場合のエラー
 * (event_id + kpi_definition_id + period_code + department_stable_id の組み合わせが重複)
 */
export class KpiFactAmountDuplicateError extends Error {
  constructor(message: string = 'KPI fact amount with the same period already exists') {
    super(message);
    this.name = 'KpiFactAmountDuplicateError';
  }
}

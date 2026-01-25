/**
 * 指標目標値の期間が重複している場合のエラー
 * (kpi_master_item_id + period_code の組み合わせが重複)
 */
export class KpiTargetValueDuplicateError extends Error {
  constructor(message: string = 'KPI target value with the same period already exists') {
    super(message);
    this.name = 'KpiTargetValueDuplicateError';
  }
}

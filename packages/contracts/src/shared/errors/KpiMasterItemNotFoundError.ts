/**
 * KPI項目が見つからない場合のエラー
 */
export class KpiMasterItemNotFoundError extends Error {
  constructor(message: string = 'KPI master item not found') {
    super(message);
    this.name = 'KpiMasterItemNotFoundError';
  }
}

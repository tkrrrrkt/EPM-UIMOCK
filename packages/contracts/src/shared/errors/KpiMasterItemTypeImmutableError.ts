/**
 * KPI項目の種別または参照先IDの変更を試みた場合のエラー
 */
export class KpiMasterItemTypeImmutableError extends Error {
  constructor(message: string = 'KPI master item type and reference ID cannot be changed') {
    super(message);
    this.name = 'KpiMasterItemTypeImmutableError';
  }
}

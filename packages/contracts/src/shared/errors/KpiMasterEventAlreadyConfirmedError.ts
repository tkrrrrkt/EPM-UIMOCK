/**
 * KPI管理イベントが既にCONFIRMED状態の場合のエラー
 */
export class KpiMasterEventAlreadyConfirmedError extends Error {
  constructor(message: string = 'KPI management event is already confirmed') {
    super(message);
    this.name = 'KpiMasterEventAlreadyConfirmedError';
  }
}

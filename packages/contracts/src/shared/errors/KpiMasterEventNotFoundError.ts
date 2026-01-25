/**
 * KPI管理イベントが見つからない場合のエラー
 */
export class KpiMasterEventNotFoundError extends Error {
  constructor(message: string = 'KPI management event not found') {
    super(message);
    this.name = 'KpiMasterEventNotFoundError';
  }
}

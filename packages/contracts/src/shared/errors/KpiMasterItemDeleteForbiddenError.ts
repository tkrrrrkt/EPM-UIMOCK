/**
 * CONFIRMED状態のイベント内でKPI項目削除を試みた場合のエラー
 */
export class KpiMasterItemDeleteForbiddenError extends Error {
  constructor(message: string = 'Cannot delete KPI master item in CONFIRMED event') {
    super(message);
    this.name = 'KpiMasterItemDeleteForbiddenError';
  }
}

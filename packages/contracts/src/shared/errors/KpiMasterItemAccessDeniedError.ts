/**
 * 部門別閲覧権限により、KPI項目へのアクセスが拒否された場合のエラー
 */
export class KpiMasterItemAccessDeniedError extends Error {
  constructor(message: string = 'Access denied to KPI master item due to department permission') {
    super(message);
    this.name = 'KpiMasterItemAccessDeniedError';
  }
}

/**
 * ダッシュボードへのアクセス権限がない場合のエラー
 * HTTP Status: 403
 */
export class DashboardAccessDeniedError extends Error {
  constructor(message: string = 'Dashboard access denied') {
    super(message);
    this.name = 'DashboardAccessDeniedError';
  }
}

/**
 * ダッシュボードが見つからない場合のエラー
 * HTTP Status: 404
 */
export class DashboardNotFoundError extends Error {
  constructor(message: string = 'Dashboard not found') {
    super(message);
    this.name = 'DashboardNotFoundError';
  }
}

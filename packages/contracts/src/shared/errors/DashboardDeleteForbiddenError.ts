/**
 * システムテンプレートの削除が禁止されている場合のエラー
 * HTTP Status: 400
 */
export class DashboardDeleteForbiddenError extends Error {
  constructor(message: string = 'System template dashboard cannot be deleted') {
    super(message);
    this.name = 'DashboardDeleteForbiddenError';
  }
}

/**
 * デフォルトレイアウトを削除しようとした場合のエラー
 */
export class ReportLayoutDefaultDeleteError extends Error {
  constructor(message: string = 'Cannot delete default report layout') {
    super(message);
    this.name = 'ReportLayoutDefaultDeleteError';
  }
}

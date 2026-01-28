/**
 * レポートレイアウトが見つからない場合のエラー
 */
export class ReportLayoutNotFoundError extends Error {
  constructor(message: string = 'Report layout not found') {
    super(message);
    this.name = 'ReportLayoutNotFoundError';
  }
}

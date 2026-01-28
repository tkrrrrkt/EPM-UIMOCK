/**
 * レポートページが見つからない場合のエラー
 */
export class ReportPageNotFoundError extends Error {
  constructor(message: string = 'Report page not found') {
    super(message);
    this.name = 'ReportPageNotFoundError';
  }
}

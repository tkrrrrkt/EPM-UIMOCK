/**
 * レポートコンポーネントが見つからない場合のエラー
 */
export class ReportComponentNotFoundError extends Error {
  constructor(message: string = 'Report component not found') {
    super(message);
    this.name = 'ReportComponentNotFoundError';
  }
}

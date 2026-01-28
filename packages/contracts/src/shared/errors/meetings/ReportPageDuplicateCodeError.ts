/**
 * レポートページコードが重複している場合のエラー
 */
export class ReportPageDuplicateCodeError extends Error {
  constructor(message: string = 'Report page with the same page_code already exists') {
    super(message);
    this.name = 'ReportPageDuplicateCodeError';
  }
}

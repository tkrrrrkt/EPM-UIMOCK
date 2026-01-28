/**
 * レポートレイアウトコードが重複している場合のエラー
 */
export class ReportLayoutDuplicateCodeError extends Error {
  constructor(message: string = 'Report layout with the same layout_code already exists') {
    super(message);
    this.name = 'ReportLayoutDuplicateCodeError';
  }
}

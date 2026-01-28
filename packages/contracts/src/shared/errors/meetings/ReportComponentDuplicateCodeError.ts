/**
 * レポートコンポーネントコードが重複している場合のエラー
 */
export class ReportComponentDuplicateCodeError extends Error {
  constructor(message: string = 'Report component with the same component_code already exists') {
    super(message);
    this.name = 'ReportComponentDuplicateCodeError';
  }
}

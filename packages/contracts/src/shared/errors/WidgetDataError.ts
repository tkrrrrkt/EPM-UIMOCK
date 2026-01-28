/**
 * ウィジェットデータ取得時のエラー
 * HTTP Status: 500
 */
export class WidgetDataError extends Error {
  constructor(message: string = 'Failed to retrieve widget data') {
    super(message);
    this.name = 'WidgetDataError';
  }
}

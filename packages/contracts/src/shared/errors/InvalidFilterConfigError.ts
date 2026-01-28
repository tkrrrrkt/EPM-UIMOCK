/**
 * フィルター設定が不正な場合のエラー
 * HTTP Status: 400
 */
export class InvalidFilterConfigError extends Error {
  constructor(message: string = 'Invalid filter configuration') {
    super(message);
    this.name = 'InvalidFilterConfigError';
  }
}

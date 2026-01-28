/**
 * 使用中のレポートレイアウトを削除しようとした場合のエラー
 */
export class ReportLayoutInUseError extends Error {
  constructor(message: string = 'Cannot delete report layout that is currently in use') {
    super(message);
    this.name = 'ReportLayoutInUseError';
  }
}

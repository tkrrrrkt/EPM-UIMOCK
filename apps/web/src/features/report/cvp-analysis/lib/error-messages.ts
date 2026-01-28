import { CvpAnalysisErrorCode } from '../types';

export const errorMessages: Record<CvpAnalysisErrorCode, string> = {
  [CvpAnalysisErrorCode.CVP_LAYOUT_NOT_SET]: 'CVPレイアウトが未設定です。会社マスタでCVPレイアウトを設定してください。',
  [CvpAnalysisErrorCode.PRIMARY_NOT_SELECTED]: 'データソースを選択してください',
  [CvpAnalysisErrorCode.NO_DATA_FOUND]: '選択条件に該当するデータが見つかりません',
  [CvpAnalysisErrorCode.DEPARTMENT_NOT_FOUND]: '部門が見つかりません',
  [CvpAnalysisErrorCode.PERIOD_INVALID]: '期間の指定が不正です',
  [CvpAnalysisErrorCode.EVENT_NOT_FOUND]: 'イベントが見つかりません',
  [CvpAnalysisErrorCode.VERSION_NOT_FOUND]: 'バージョンが見つかりません',
  [CvpAnalysisErrorCode.VALIDATION_ERROR]: '入力内容に誤りがあります',
};

export function getErrorMessage(code: CvpAnalysisErrorCode): string {
  return errorMessages[code] || 'エラーが発生しました';
}

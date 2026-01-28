import { RoicAnalysisErrorCode, RoicWarningCode } from '../types';

export const errorMessages: Record<string, string> = {
  [RoicAnalysisErrorCode.ROIC_CONFIG_NOT_SET]: 'ROIC設定が未完了です',
  [RoicAnalysisErrorCode.PRIMARY_NOT_SELECTED]: 'データソースを選択してください',
  [RoicAnalysisErrorCode.NO_DATA_FOUND]: 'データが見つかりません',
  [RoicAnalysisErrorCode.NO_BS_DATA]: '貸借対照表データがありません',
  [RoicAnalysisErrorCode.DEPARTMENT_NOT_FOUND]: '部門が見つかりません',
  [RoicAnalysisErrorCode.PERIOD_INVALID]: '期間の指定が不正です',
  [RoicAnalysisErrorCode.EVENT_NOT_FOUND]: 'イベントが見つかりません',
  [RoicAnalysisErrorCode.VERSION_NOT_FOUND]: 'バージョンが見つかりません',
  [RoicAnalysisErrorCode.VALIDATION_ERROR]: '入力内容に誤りがあります',
  [RoicAnalysisErrorCode.SIMPLE_INPUT_NOT_ALLOWED]: '配下集約時は簡易入力できません',
  [RoicAnalysisErrorCode.NO_SIMPLE_INPUT_SUBJECTS]: '簡易入力の対象科目がありません',
};

export const warningMessages: Record<string, string> = {
  [RoicWarningCode.BS_SUBSTITUTED_WITH_ACTUAL]: 'BS予算/見込データがないため、実績で代替表示しています',
  [RoicWarningCode.WACC_NOT_SET]: 'WACCが設定されていません',
  [RoicWarningCode.PARTIAL_DATA_MISSING]: '一部期間のデータが欠損しています',
};

export function getErrorMessage(code: string): string {
  return errorMessages[code] || 'エラーが発生しました';
}

export function getWarningMessage(code: string): string {
  return warningMessages[code] || '警告';
}

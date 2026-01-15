import type { ScenarioType, DriverType, DriverSourceType, TargetType } from '@epm/contracts/bff/allocation-master'

export const SCENARIO_TYPE_LABELS: Record<ScenarioType, string> = {
  ACTUAL: '実績',
  BUDGET: '予算',
  FORECAST: '見込',
}

export const DRIVER_TYPE_LABELS: Record<DriverType, string> = {
  FIXED: '固定比率',
  HEADCOUNT: '人員数',
  SUBJECT_AMOUNT: '科目金額',
  MEASURE: '測定値',
  KPI: 'KPI',
}

export const DRIVER_SOURCE_TYPE_LABELS: Record<DriverSourceType, string> = {
  MASTER: 'マスタ',
  FACT: '実績値',
  KPI: 'KPI',
}

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  DEPARTMENT: '部門',
  DIMENSION_VALUE: 'ディメンション値',
}

export const ERROR_MESSAGES: Record<string, string> = {
  EVENT_NOT_FOUND: '配賦イベントが見つかりません',
  EVENT_CODE_DUPLICATE: 'イベントコードが重複しています',
  EVENT_HAS_STEPS: '配下にステップが存在するため削除できません',
  EVENT_VERSION_CONFLICT: '他のユーザーが変更しました。最新データを取得してください',
  STEP_NOT_FOUND: 'ステップが見つかりません',
  STEP_HAS_TARGETS: '配下にターゲットが存在するため削除できません',
  TARGET_NOT_FOUND: '配賦先が見つかりません',
  TARGET_DUPLICATE: '同じ配賦先が既に登録されています',
  TARGET_REF_NOT_FOUND: '配賦先の参照先が見つかりません',
  DRIVER_NOT_FOUND: 'ドライバが見つかりません',
  DRIVER_CODE_DUPLICATE: 'ドライバコードが重複しています',
  DRIVER_IN_USE: 'このドライバは使用中のため削除できません',
  VALIDATION_ERROR: '入力内容に誤りがあります',
  INVALID_DRIVER_CONFIG: 'ドライバ設定が不正です',
  INVALID_FIXED_RATIO: '固定比率は0〜1の範囲で入力してください',
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || '予期しないエラーが発生しました'
}

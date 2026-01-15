import { DimensionMasterErrorCode } from '@epm/contracts/bff/dimension-master'

export function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    [DimensionMasterErrorCode.DIMENSION_NOT_FOUND]: 'ディメンションが見つかりません',
    [DimensionMasterErrorCode.DIMENSION_CODE_DUPLICATE]: 'ディメンションコードが重複しています',
    [DimensionMasterErrorCode.DIMENSION_ALREADY_INACTIVE]: 'このディメンションは既に無効化されています',
    [DimensionMasterErrorCode.DIMENSION_ALREADY_ACTIVE]: 'このディメンションは既に有効です',
    [DimensionMasterErrorCode.DIMENSION_VALUE_NOT_FOUND]: 'ディメンション値が見つかりません',
    [DimensionMasterErrorCode.VALUE_CODE_DUPLICATE]: '値コードが重複しています',
    [DimensionMasterErrorCode.DIMENSION_VALUE_ALREADY_INACTIVE]: 'このディメンション値は既に無効化されています',
    [DimensionMasterErrorCode.DIMENSION_VALUE_ALREADY_ACTIVE]: 'このディメンション値は既に有効です',
    [DimensionMasterErrorCode.CIRCULAR_REFERENCE_DETECTED]: '循環参照が発生するため更新できません',
    [DimensionMasterErrorCode.VALIDATION_ERROR]: '入力内容に誤りがあります',
  }

  return messages[errorCode] || '予期しないエラーが発生しました'
}

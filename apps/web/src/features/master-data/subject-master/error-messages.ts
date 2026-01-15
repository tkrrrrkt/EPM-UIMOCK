import { SubjectMasterErrorCode } from "@contracts/bff/subject-master"

export function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case SubjectMasterErrorCode.SUBJECT_NOT_FOUND:
      return "科目が見つかりません"
    case SubjectMasterErrorCode.SUBJECT_CODE_DUPLICATE:
      return "科目コードが重複しています"
    case SubjectMasterErrorCode.SUBJECT_ALREADY_INACTIVE:
      return "この科目は既に無効化されています"
    case SubjectMasterErrorCode.SUBJECT_ALREADY_ACTIVE:
      return "この科目は既に有効です"
    case SubjectMasterErrorCode.ROLLUP_ALREADY_EXISTS:
      return "この構成科目は既に追加されています"
    case SubjectMasterErrorCode.ROLLUP_NOT_FOUND:
      return "構成科目が見つかりません"
    case SubjectMasterErrorCode.CIRCULAR_REFERENCE_DETECTED:
      return "循環参照が発生するため、この構成を追加できません"
    case SubjectMasterErrorCode.CANNOT_ADD_CHILD_TO_BASE:
      return "通常科目の下には配置できません"
    case SubjectMasterErrorCode.VALIDATION_ERROR:
      return "入力内容に誤りがあります"
    default:
      return "エラーが発生しました"
  }
}

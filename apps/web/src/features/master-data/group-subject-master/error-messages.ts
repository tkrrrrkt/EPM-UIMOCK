import type { GroupSubjectMasterErrorCode } from "@epm/contracts/bff/group-subject-master"

const errorMessages: Record<string, string> = {
  GROUP_SUBJECT_NOT_FOUND: "連結勘定科目が見つかりません",
  GROUP_SUBJECT_CODE_DUPLICATE: "連結勘定科目コードが重複しています",
  GROUP_SUBJECT_ALREADY_INACTIVE: "この科目は既に無効化されています",
  GROUP_SUBJECT_ALREADY_ACTIVE: "この科目は既に有効です",
  GROUP_ROLLUP_ALREADY_EXISTS: "この構成科目は既に追加されています",
  GROUP_ROLLUP_NOT_FOUND: "構成科目が見つかりません",
  CIRCULAR_REFERENCE_DETECTED: "循環参照が発生するため、この構成を追加できません",
  CANNOT_ADD_CHILD_TO_BASE: "通常科目の下には配置できません",
  NOT_PARENT_COMPANY: "この操作は親会社のみ実行可能です",
  INVALID_COEFFICIENT: "係数は+1または-1のみ指定できます",
  VALIDATION_ERROR: "入力値が不正です",
}

export function getErrorMessage(code: string): string {
  return errorMessages[code] || `エラーが発生しました: ${code}`
}

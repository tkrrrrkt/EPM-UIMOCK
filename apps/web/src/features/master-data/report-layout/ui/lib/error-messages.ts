export const ERROR_MESSAGES: Record<string, string> = {
  LAYOUT_NOT_FOUND: "レイアウトが見つかりません",
  LAYOUT_CODE_DUPLICATE: "レイアウトコードが重複しています",
  LAYOUT_ALREADY_INACTIVE: "このレイアウトは既に無効化されています",
  LAYOUT_ALREADY_ACTIVE: "このレイアウトは既に有効化されています",
  LINE_NOT_FOUND: "行が見つかりません",
  SUBJECT_REQUIRED_FOR_ACCOUNT: "account行には科目を選択してください",
  SUBJECT_NOT_FOUND: "科目が見つかりません",
  SUBJECT_INACTIVE: "無効化された科目は選択できません",
  SUBJECT_TYPE_MISMATCH: "選択した科目はこのレイアウト種別では使用できません",
  VALIDATION_ERROR: "入力内容に誤りがあります",
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || error.message
  }
  return "エラーが発生しました"
}

export const ERROR_MESSAGES: Record<string, string> = {
  LAYOUT_NOT_FOUND: "レイアウトが見つかりません",
  LAYOUT_CODE_DUPLICATE: "レイアウトコードが重複しています",
  LAYOUT_ALREADY_INACTIVE: "このレイアウトは既に無効化されています",
  LAYOUT_ALREADY_ACTIVE: "このレイアウトは既に有効化されています",
  DEFAULT_LAYOUT_CANNOT_DEACTIVATE: "デフォルトレイアウトは無効化できません",
  INACTIVE_LAYOUT_CANNOT_SET_DEFAULT: "無効なレイアウトはデフォルトに設定できません",
  LINE_NOT_FOUND: "行が見つかりません",
  GROUP_SUBJECT_REQUIRED_FOR_ACCOUNT: "account行には連結科目を選択してください",
  GROUP_SUBJECT_NOT_FOUND: "連結科目が見つかりません",
  GROUP_SUBJECT_INACTIVE: "無効化された連結科目は選択できません",
  GROUP_SUBJECT_TYPE_MISMATCH: "選択した連結科目はこのレイアウト種別では使用できません",
  NOT_PARENT_COMPANY: "親会社のみがレイアウトを編集できます",
  VALIDATION_ERROR: "入力内容に誤りがあります",
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || error.message
  }
  return "エラーが発生しました"
}

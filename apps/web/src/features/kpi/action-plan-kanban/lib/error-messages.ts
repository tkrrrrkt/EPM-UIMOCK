export const ERROR_MESSAGES: Record<string, string> = {
  TASK_NOT_FOUND: "タスクが見つかりません",
  CHECKLIST_ITEM_NOT_FOUND: "チェック項目が見つかりません",
  COMMENT_NOT_FOUND: "コメントが見つかりません",
  COMMENT_NOT_OWNER: "自分のコメントのみ編集・削除できます",
  OPTIMISTIC_LOCK_ERROR: "他のユーザーが更新しました。画面を更新してください",
  FORBIDDEN: "この操作を行う権限がありません",
  STATUS_NOT_FOUND: "ステータスが見つかりません",
  STATUS_CODE_DUPLICATE: "同じコードのステータスが既に存在します",
  STATUS_HAS_TASKS: "タスクが存在するステータスは削除できません",
  STATUS_IN_USE: "タスクが存在するステータスは削除できません",
  STATUS_IS_DEFAULT: "デフォルトステータスは削除できません",
  STATUS_COMPLETED_REQUIRED: "完了ステータスは最低1つ必要です",
  LABEL_NOT_FOUND: "ラベルが見つかりません",
  LABEL_CODE_DUPLICATE: "同じコードのラベルが既に存在します",
  LABEL_NAME_DUPLICATE: "同じ名前のラベルが既に存在します",
  UNKNOWN_ERROR: "エラーが発生しました",
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || error.message
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR
}

export const ERROR_MESSAGES: Record<string, string> = {
  WBS_NOT_FOUND: "WBSが見つかりません",
  WBS_CODE_DUPLICATE: "WBSコードが重複しています",
  CIRCULAR_DEPENDENCY: "循環依存は設定できません",
  OPTIMISTIC_LOCK_ERROR: "他のユーザーが更新しました。画面を更新してください",
  FORBIDDEN: "この操作を行う権限がありません",
  UNKNOWN_ERROR: "エラーが発生しました",
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR
}

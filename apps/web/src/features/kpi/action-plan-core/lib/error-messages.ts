/**
 * Maps BFF error codes to user-friendly Japanese messages
 */
export const errorMessages: Record<string, string> = {
  PLAN_NOT_FOUND: "アクションプランが見つかりません",
  PLAN_CODE_DUPLICATE: "プランコードが重複しています",
  INVALID_SUBJECT_TYPE: "KPI科目のみ選択可能です",
  OPTIMISTIC_LOCK_ERROR: "他のユーザーが更新しました。画面を更新してください",
  FORBIDDEN: "この操作を行う権限がありません",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
}

export function getErrorMessage(errorCode: string): string {
  return errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR
}

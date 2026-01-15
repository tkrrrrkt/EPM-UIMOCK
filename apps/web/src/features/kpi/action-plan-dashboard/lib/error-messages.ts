export const errorMessages: Record<string, string> = {
  SUBJECT_NOT_FOUND: "KPI科目が見つかりません",
  FORBIDDEN: "このダッシュボードへのアクセス権限がありません",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
}

export function getErrorMessage(code: string): string {
  return errorMessages[code] || errorMessages.UNKNOWN_ERROR
}

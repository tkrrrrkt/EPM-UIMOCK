export const errorMessages: Record<string, string> = {
  ReportLayoutNotFoundError: 'レイアウトが見つかりません',
  ReportLayoutDuplicateCodeError: 'レイアウトコードが重複しています',
  ReportLayoutDefaultDeleteError: 'デフォルトレイアウトは削除できません',
  ReportLayoutInUseError: '使用中のレイアウトは削除できません',
  ReportPageNotFoundError: 'ページが見つかりません',
  ReportPageDuplicateCodeError: 'ページコードが重複しています',
  ReportComponentNotFoundError: 'コンポーネントが見つかりません',
  ReportComponentDuplicateCodeError: 'コンポーネントコードが重複しています',
  TemplateNotFoundError: 'テンプレートが見つかりません',
  VALIDATION_ERROR: '入力内容に誤りがあります',
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
}

export function getErrorMessage(errorCode: string): string {
  return errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR
}

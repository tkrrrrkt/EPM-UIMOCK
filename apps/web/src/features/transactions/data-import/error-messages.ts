import { DataImportErrorCode } from "@epm/contracts/bff/data-import"

const ERROR_MESSAGES: Record<string, string> = {
  // Batch errors
  [DataImportErrorCode.BATCH_NOT_FOUND]: "取込バッチが見つかりません。最初からやり直してください。",
  [DataImportErrorCode.BATCH_EXPIRED]: "取込セッションの有効期限が切れました。最初からやり直してください。",
  [DataImportErrorCode.BATCH_INVALID_STATE]: "取込処理の状態が不正です。最初からやり直してください。",

  // File errors
  [DataImportErrorCode.FILE_TOO_LARGE]: "ファイルサイズが大きすぎます。100MB以下のファイルを選択してください。",
  [DataImportErrorCode.FILE_FORMAT_INVALID]: "ファイル形式が不正です。Excel(.xlsx, .xls)またはCSVファイルを選択してください。",
  [DataImportErrorCode.FILE_EMPTY]: "ファイルにデータがありません。データを含むファイルを選択してください。",
  [DataImportErrorCode.FILE_UPLOAD_FAILED]: "ファイルのアップロードに失敗しました。再度お試しください。",

  // Mapping errors
  [DataImportErrorCode.MAPPING_INCOMPLETE]: "マッピングが完了していません。すべての項目をマッピングしてください。",
  [DataImportErrorCode.MAPPING_RULE_NOT_FOUND]: "マッピングルールが見つかりません。",
  [DataImportErrorCode.MAPPING_RULE_DUPLICATE]: "同じマッピングルールが既に存在します。",

  // Validation errors
  [DataImportErrorCode.VALIDATION_FAILED]: "データの検証に失敗しました。エラー内容を確認してください。",
  [DataImportErrorCode.HAS_UNRESOLVED_ERRORS]: "未解決のエラーがあります。すべてのエラーを解決してから実行してください。",

  // Target errors
  [DataImportErrorCode.EVENT_NOT_FOUND]: "指定されたイベントが見つかりません。",
  [DataImportErrorCode.VERSION_NOT_FOUND]: "指定されたバージョンが見つかりません。",
  [DataImportErrorCode.VERSION_NOT_EDITABLE]: "このバージョンは編集できません。ドラフト状態のバージョンを選択してください。",
  [DataImportErrorCode.PERIOD_CLOSED]: "指定された期間は締め処理済みです。",

  // Execution errors
  [DataImportErrorCode.IMPORT_FAILED]: "データの取込に失敗しました。管理者にお問い合わせください。",
  [DataImportErrorCode.CONCURRENT_IMPORT]: "他のユーザーが同時に取込中です。しばらく待ってから再度お試しください。",

  // Template errors
  [DataImportErrorCode.TEMPLATE_NOT_FOUND]: "指定されたテンプレートが見つかりません。",

  // General errors
  [DataImportErrorCode.UNKNOWN_ERROR]: "予期せぬエラーが発生しました。管理者にお問い合わせください。",
}

export function getErrorMessage(error: unknown): string {
  // Error object with code property
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES[DataImportErrorCode.UNKNOWN_ERROR]
  }

  // String error code
  if (typeof error === "string" && ERROR_MESSAGES[error]) {
    return ERROR_MESSAGES[error]
  }

  // Error with message
  if (error instanceof Error) {
    return error.message
  }

  return ERROR_MESSAGES[DataImportErrorCode.UNKNOWN_ERROR]
}

export function getValidationErrorMessage(
  errorType: string,
  columnLabel: string,
  currentValue: string | null
): string {
  switch (errorType) {
    case "REQUIRED":
      return `${columnLabel}は必須です`
    case "FORMAT":
      return `${columnLabel}の形式が不正です: "${currentValue ?? ""}"`
    case "MAPPING":
      return `${columnLabel}のマッピングが見つかりません: "${currentValue ?? ""}"`
    case "RANGE":
      return `${columnLabel}の値が範囲外です: "${currentValue ?? ""}"`
    default:
      return `${columnLabel}にエラーがあります`
  }
}

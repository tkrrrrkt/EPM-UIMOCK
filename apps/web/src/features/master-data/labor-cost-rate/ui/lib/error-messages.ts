import type { LaborCostRateErrorCode } from "../types/bff-contracts"

export function getErrorMessage(code: LaborCostRateErrorCode): string {
  const messages: Record<LaborCostRateErrorCode, string> = {
    LABOR_COST_RATE_NOT_FOUND: "指定された単価が見つかりません",
    RATE_CODE_DUPLICATE: "この単価コードは既に使用されています",
    LABOR_COST_RATE_ALREADY_INACTIVE: "この単価は既に無効化されています",
    LABOR_COST_RATE_ALREADY_ACTIVE: "この単価は既に有効です",
    INVALID_DATE_RANGE: "有効終了日は有効開始日より後である必要があります",
    SUBJECT_NOT_FOUND: "指定された科目が見つかりません",
    DUPLICATE_SUBJECT_IN_ITEMS: "同一科目を複数指定することはできません",
    NO_ITEMS_PROVIDED: "科目別内訳は1件以上必要です",
    INVALID_ITEM_AMOUNT: "科目金額は正の数値である必要があります",
    VALIDATION_ERROR: "入力値に誤りがあります",
  }

  return messages[code] || "予期しないエラーが発生しました"
}

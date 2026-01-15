/**
 * Error message mapping for Headcount Planning
 */

import type { HeadcountPlanningErrorCode } from "@epm/contracts/bff/headcount-planning"

const ERROR_MESSAGES: Record<HeadcountPlanningErrorCode, string> = {
  RESOURCE_PLAN_NOT_FOUND: "人員計画が見つかりません",
  INDIVIDUAL_ALLOCATION_NOT_FOUND: "個人別配賦が見つかりません",
  DUPLICATE_RESOURCE_PLAN: "同じ職種・等級の人員計画がすでに存在します",
  DUPLICATE_ALLOCATION_TARGET: "同じ配賦先部門が複数指定されています",
  ALLOCATION_PERCENTAGE_NOT_100: "配賦率の合計が100%になっていません",
  ALLOCATION_HEADCOUNT_MISMATCH: "配賦人月数の合計が月別人数合計と一致しません",
  RATE_NOT_FOUND: "指定された単価が見つかりません",
  DEPARTMENT_NOT_FOUND: "指定された部門が見つかりません",
  INVALID_PLAN_VERSION_STATUS: "このバージョンは編集できません",
  BUDGET_APPLY_FAILED: "予算反映に失敗しました",
  VALIDATION_ERROR: "入力内容に誤りがあります",
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as HeadcountPlanningErrorCode] ?? `エラーが発生しました（${code}）`
}

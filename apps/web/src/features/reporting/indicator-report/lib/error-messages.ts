// ============================================================
// Error Messages - Error code to UI message mapping
// ============================================================

import { IndicatorReportErrorCode } from "@epm/contracts/bff/indicator-report"

export const errorMessages: Record<string, string> = {
  [IndicatorReportErrorCode.LAYOUT_NOT_CONFIGURED]:
    "レイアウトが設定されていません。システム管理者にお問い合わせください。",
  [IndicatorReportErrorCode.LAYOUT_NOT_FOUND]:
    "指定されたレイアウトが見つかりません",
  [IndicatorReportErrorCode.PLAN_EVENT_NOT_FOUND]:
    "指定された計画イベントが見つかりません",
  [IndicatorReportErrorCode.PLAN_VERSION_NOT_FOUND]:
    "指定された計画バージョンが見つかりません",
  [IndicatorReportErrorCode.DEPARTMENT_NOT_FOUND]:
    "指定された部門が見つかりません",
  [IndicatorReportErrorCode.INVALID_PERIOD_RANGE]: "無効な期間範囲です",
  [IndicatorReportErrorCode.NO_KPI_EVENT_FOUND]:
    "対象年度のKPIイベントが見つかりません（KPI行は「-」で表示されます）",
  [IndicatorReportErrorCode.METRIC_EVALUATION_ERROR]:
    "指標の計算でエラーが発生しました",
  [IndicatorReportErrorCode.VALIDATION_ERROR]: "入力内容に誤りがあります",
}

export function getErrorMessage(code: string): string {
  return errorMessages[code] || "エラーが発生しました"
}

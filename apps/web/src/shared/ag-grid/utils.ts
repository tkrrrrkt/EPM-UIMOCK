// ============================================
// AG-Grid Utilities for Editable Amount Grids
// ============================================

import type { ValueFormatterParams, ValueParserParams } from "ag-grid-community"
import type { AmountRowData, PendingChange } from "./types"

/**
 * 金額フォーマッター（百万円単位で表示）
 * 例: 1000000 → "1", 100000000 → "100"
 */
export function amountValueFormatter(params: ValueFormatterParams): string {
  const value = params.value
  if (value === null || value === undefined || value === "") return ""

  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return ""

  // 百万円単位で表示
  const millionYen = num / 1000000
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 0,
  }).format(millionYen)
}

/**
 * 金額パーサー（入力値を円に変換）
 * 例: "100" → 100000000（1億円）
 */
export function amountValueParser(params: ValueParserParams): number {
  const value = params.newValue
  if (value === null || value === undefined || value === "") return 0

  // カンマや空白を除去
  const cleaned = String(value).replace(/[,\s]/g, "")
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0

  // 百万円単位として入力されたものとして円に変換
  return num * 1000000
}

/**
 * 編集可能かどうかを判定するコールバック生成
 */
export function createEditableCallback(
  isReadOnly: boolean,
  editableFields: string[]
) {
  return (params: { data: AmountRowData; colDef: { field?: string } }) => {
    // 読み取り専用モードの場合
    if (isReadOnly) return false

    // 集計行は編集不可
    if (params.data?.isAggregate) return false

    // 編集可能フィールドかチェック
    const field = params.colDef?.field
    if (!field) return false

    return editableFields.includes(field)
  }
}

/**
 * セルクラス生成関数
 */
export function createCellClassRules(actualFields: string[]) {
  return {
    // 集計行のスタイル
    "font-semibold bg-muted/20": (params: { data: AmountRowData }) =>
      params.data?.isAggregate === true,
    // 実績列のスタイル
    "bg-muted text-muted-foreground": (params: { colDef: { field?: string } }) =>
      actualFields.includes(params.colDef?.field || ""),
  }
}

/**
 * ペースト時のデータ処理
 */
export function processCellFromClipboard(params: { value: string }): number {
  const value = params.value
  if (!value) return 0

  // カンマや空白を除去
  const cleaned = value.replace(/[,\s]/g, "")
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0

  // そのまま百万円単位として扱う
  return num * 1000000
}

/**
 * コピー時のデータ処理
 */
export function processCellForClipboard(params: { value: number | string }): string {
  const value = params.value
  if (value === null || value === undefined || value === "") return ""

  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return ""

  // 百万円単位でコピー（Excelと同じ形式）
  return String(Math.round(num / 1000000))
}

/**
 * 計画合計を計算
 */
export function calculatePlanTotal(
  rowData: AmountRowData,
  planFields: string[]
): number {
  return planFields.reduce((sum, field) => {
    const value = rowData[field]
    if (value === null || value === undefined) return sum
    const num = typeof value === "string" ? parseFloat(value) : (value as number)
    if (isNaN(num)) return sum
    return sum + num
  }, 0)
}

/**
 * 全社合計を計算（複数行の同一フィールドを集計）
 */
export function calculateTotalForField(
  rows: AmountRowData[],
  field: string
): number {
  return rows
    .filter((row) => !row.isAggregate)
    .reduce((sum, row) => {
      const value = row[field]
      if (value === null || value === undefined) return sum
      const num = typeof value === "string" ? parseFloat(value) : (value as number)
      if (isNaN(num)) return sum
      return sum + num
    }, 0)
}

/**
 * 保留中の変更をマージ
 */
export function mergePendingChanges(
  existing: Map<string, PendingChange>,
  newChange: PendingChange
): Map<string, PendingChange> {
  const key = `${newChange.rowId}-${newChange.field}`
  const updated = new Map(existing)

  const existingChange = updated.get(key)
  if (existingChange) {
    // 既存の変更がある場合、新しい値で更新（元の値は保持）
    updated.set(key, {
      ...existingChange,
      newValue: newChange.newValue,
    })
  } else {
    updated.set(key, newChange)
  }

  return updated
}

/**
 * フィールド名から年度を抽出
 * 例: "plan_2025" → 2025, "actual_2024" → 2024
 */
export function extractFiscalYearFromField(field: string): number | null {
  const match = field.match(/_(20\d{2})$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * フィールド名から期間キーを抽出
 * 例: "gl_ANNUAL_1" → "ANNUAL_1", "gl_HALF_1" → "HALF_1"
 */
export function extractPeriodKeyFromField(field: string): string | null {
  const match = field.match(/^gl_(.+)$/)
  return match ? match[1] : null
}

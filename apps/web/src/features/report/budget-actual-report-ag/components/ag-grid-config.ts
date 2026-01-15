"use client"

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AllEnterpriseModule } from "ag-grid-enterprise"

// AG Grid モジュールの登録（アプリケーション起動時に1回のみ実行）
let isModuleRegistered = false

export function registerAgGridModules() {
  if (isModuleRegistered) return

  ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])
  isModuleRegistered = true
}

// 日本語ロケール設定
export const AG_GRID_LOCALE_JP = {
  // フィルター
  filterOoo: "フィルター...",
  equals: "等しい",
  notEqual: "等しくない",
  lessThan: "より小さい",
  greaterThan: "より大きい",
  lessThanOrEqual: "以下",
  greaterThanOrEqual: "以上",
  inRange: "範囲内",
  contains: "含む",
  notContains: "含まない",
  startsWith: "で始まる",
  endsWith: "で終わる",
  blank: "空白",
  notBlank: "空白でない",
  andCondition: "AND",
  orCondition: "OR",
  applyFilter: "適用",
  resetFilter: "リセット",
  clearFilter: "クリア",

  // カラムメニュー
  pinColumn: "列を固定",
  pinLeft: "左に固定",
  pinRight: "右に固定",
  noPin: "固定解除",
  autosizeThisColumn: "この列を自動サイズ",
  autosizeAllColumns: "すべての列を自動サイズ",
  resetColumns: "列をリセット",

  // 行グループ
  group: "グループ",
  rowGroupColumnsEmptyMessage: "ここにドラッグしてグループ化",
  expandAll: "すべて展開",
  collapseAll: "すべて折りたたむ",

  // ピボット
  pivotMode: "ピボットモード",
  pivot: "ピボット",

  // ツールパネル
  columns: "列",
  filters: "フィルター",
  values: "値",

  // エクスポート
  export: "エクスポート",
  csvExport: "CSVエクスポート",
  excelExport: "Excelエクスポート",

  // その他
  noRowsToShow: "表示するデータがありません",
  loading: "読み込み中...",
  selectAll: "すべて選択",
  searchOoo: "検索...",
  copy: "コピー",
  copyWithHeaders: "ヘッダー付きでコピー",
  paste: "貼り付け",
}

// 数値フォーマッター
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return ""
  return new Intl.NumberFormat("ja-JP").format(value)
}

export function formatVariance(value: number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const formatted = formatNumber(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return ""
  return `${value.toFixed(1)}%`
}

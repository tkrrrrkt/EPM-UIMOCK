// ============================================
// AG-Grid Editable Amount Grid Types
// ============================================

import type { ColDef, CellValueChangedEvent } from "ag-grid-community"

/**
 * 編集可能グリッドの行データ基本型
 */
export interface AmountRowData {
  id: string
  subjectCode: string
  subjectName: string
  isAggregate: boolean
  indentLevel?: number
  /** ツリー階層パス（例: ["売上高", "製品売上高"]）*/
  treePath?: string[]
  [key: string]: string | number | boolean | string[] | undefined
}

/**
 * 列定義用の設定
 */
export interface AmountColumnConfig {
  field: string
  headerName: string
  isEditable: boolean
  isActual?: boolean
  fiscalYear?: number
  periodKey?: string
}

/**
 * 保存待ちの変更データ
 */
export interface PendingChange {
  rowId: string
  field: string
  oldValue: string
  newValue: string
}

/**
 * 編集可能グリッドのProps
 */
export interface EditableAmountGridProps<T extends AmountRowData = AmountRowData> {
  rowData: T[]
  columnDefs: ColDef<T>[]
  isReadOnly?: boolean
  autoSaveDelay?: number
  height?: string | number
  onCellValueChanged?: (change: PendingChange) => void
  onSaveChanges?: (changes: PendingChange[]) => Promise<void>
  pinnedTopRowData?: T[]
  getRowId?: (data: T) => string
  domLayout?: "normal" | "autoHeight" | "print"
  /** ツリーデータモードを有効化 */
  treeData?: boolean
  /** ツリーパスを取得するコールバック（treeData=true時に必須） */
  getDataPath?: (data: T) => string[]
  /** デフォルトで展開する階層レベル（-1で全展開） */
  groupDefaultExpanded?: number
}

/**
 * セル変更イベントの詳細情報
 */
export interface CellChangeEvent {
  rowId: string
  subjectId: string
  field: string
  fiscalYear?: number
  periodKey?: string
  oldValue: string
  newValue: string
}

/**
 * MTP用の行データ型
 */
export interface MtpAmountRowData extends AmountRowData {
  // 動的フィールド: actual_2024, plan_2025, plan_2026, etc.
  // 計画合計: planTotal
  planTotal?: number
}

/**
 * 予算ガイドライン用の行データ型
 */
export interface GuidelineAmountRowData extends AmountRowData {
  // 動的フィールド: actual_2021, actual_2022, ..., gl_ANNUAL_1, gl_HALF_1, etc.
}

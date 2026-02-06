"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type {
  ColDef,
  GridApi,
  CellValueChangedEvent,
  PasteEndEvent,
  GridReadyEvent,
} from "ag-grid-community"
import { registerAgGridModules, AG_GRID_LOCALE_JP } from "@/features/report/budget-actual-report-ag/components/ag-grid-config"
import type { AmountRowData, EditableAmountGridProps, PendingChange } from "./types"
import {
  amountValueFormatter,
  amountValueParser,
  processCellFromClipboard,
  processCellForClipboard,
  mergePendingChanges,
} from "./utils"

// AG-Gridモジュールを登録
registerAgGridModules()

/**
 * 編集可能な金額入力グリッドコンポーネント
 *
 * 機能:
 * - Excelライクなコピー＆ペースト
 * - 範囲選択
 * - キーボードナビゲーション（Tab, Enter, 矢印キー）
 * - デバウンス自動保存
 * - 読み取り専用セルと編集可能セルの制御
 */
export function EditableAmountGrid<T extends AmountRowData = AmountRowData>({
  rowData,
  columnDefs,
  isReadOnly = false,
  autoSaveDelay = 500,
  height = 400,
  onCellValueChanged,
  onSaveChanges,
  pinnedTopRowData,
  getRowId,
  domLayout = "normal",
  treeData = false,
  getDataPath,
  groupDefaultExpanded = 1,
}: EditableAmountGridProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null)
  const [gridApi, setGridApi] = useState<GridApi<T> | null>(null)
  const [pendingSaves, setPendingSaves] = useState<Map<string, PendingChange>>(new Map())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // グリッド準備完了時
  const onGridReady = useCallback((params: GridReadyEvent<T>) => {
    setGridApi(params.api)
  }, [])

  // デフォルトの列定義（金額フォーマットは各列で個別に指定）
  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: false,
      filter: false,
      resizable: true,
      suppressMenu: true,
      // valueFormatterは各列定義で指定（科目名などテキスト列に適用しないため）
    }),
    []
  )

  // ツリーデータ用の自動グループ列定義
  const autoGroupColumnDef = useMemo<ColDef<T>>(
    () => ({
      headerName: "科目",
      minWidth: 280,
      pinned: "left",
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: { data: T }) => {
          return params.data?.subjectName || ""
        },
      },
      cellClass: (params) => (params.data?.isAggregate ? "font-semibold" : ""),
    }),
    []
  )

  // 行IDの取得
  const getRowIdCallback = useCallback(
    (params: { data: T }) => {
      if (getRowId) return getRowId(params.data)
      return params.data.id
    },
    [getRowId]
  )

  // セル値変更時の処理
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      // 値が変わっていない場合はスキップ
      if (event.oldValue === event.newValue) return

      // 集計行は無視
      if (event.data?.isAggregate) return

      const change: PendingChange = {
        rowId: event.data?.id || "",
        field: event.colDef.field || "",
        oldValue: String(event.oldValue ?? ""),
        newValue: String(event.newValue ?? ""),
      }

      // 親コンポーネントに通知
      onCellValueChanged?.(change)

      // 保留中の変更に追加
      setPendingSaves((prev) => mergePendingChanges(prev, change))
    },
    [onCellValueChanged]
  )

  // ペースト完了時の処理
  const handlePasteEnd = useCallback(
    (event: PasteEndEvent<T>) => {
      // 集計行を再計算
      gridApi?.refreshCells({ force: true })
    },
    [gridApi]
  )

  // デバウンス自動保存
  useEffect(() => {
    if (pendingSaves.size === 0) return

    // 既存のタイムアウトをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 新しいタイムアウトを設定
    saveTimeoutRef.current = setTimeout(async () => {
      if (onSaveChanges && pendingSaves.size > 0) {
        const changes = Array.from(pendingSaves.values())
        try {
          await onSaveChanges(changes)
          setPendingSaves(new Map())
        } catch (error) {
          console.error("Failed to save changes:", error)
          // エラー時は変更を保持（再試行可能）
        }
      }
    }, autoSaveDelay)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [pendingSaves, autoSaveDelay, onSaveChanges])

  // コンポーネントアンマウント時に未保存の変更を保存
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // 未保存の変更がある場合は即座に保存
      if (pendingSaves.size > 0 && onSaveChanges) {
        const changes = Array.from(pendingSaves.values())
        onSaveChanges(changes).catch(console.error)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="ag-theme-alpine w-full"
      style={{ height: domLayout === "autoHeight" ? undefined : height }}
    >
      <AgGridReact<T>
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowIdCallback}
        pinnedTopRowData={pinnedTopRowData}
        domLayout={domLayout}
        onGridReady={onGridReady}
        onCellValueChanged={handleCellValueChanged}
        onPasteEnd={handlePasteEnd}
        // ロケール
        localeText={AG_GRID_LOCALE_JP}
        // クリップボード機能
        enableRangeSelection={true}
        suppressCopyRowsToClipboard={false}
        suppressClipboardPaste={isReadOnly}
        clipboardDelimiter={"\t"}
        processCellFromClipboard={processCellFromClipboard}
        processCellForClipboard={processCellForClipboard}
        // 編集・ナビゲーション
        enterNavigatesVertically={true}
        enterNavigatesVerticallyAfterEdit={true}
        singleClickEdit={true}
        stopEditingWhenCellsLoseFocus={true}
        // ツリーデータ機能
        treeData={treeData}
        getDataPath={treeData && getDataPath ? getDataPath : undefined}
        autoGroupColumnDef={treeData ? autoGroupColumnDef : undefined}
        groupDefaultExpanded={treeData ? groupDefaultExpanded : undefined}
        // その他
        animateRows={false}
        suppressRowClickSelection={true}
        rowSelection="single"
        headerHeight={40}
        rowHeight={36}
      />
    </div>
  )
}

export default EditableAmountGrid

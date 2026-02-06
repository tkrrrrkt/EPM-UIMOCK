"use client"

import * as React from "react"
import { AgGridReact } from "ag-grid-react"
import type {
  ColDef,
  GridApi,
  CellValueChangedEvent,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community"
import { registerAgGridModules, AG_GRID_LOCALE_JP } from "@/features/report/budget-actual-report-ag/components/ag-grid-config"
import { cn } from "@/lib/utils"

import type { BffStagingRow, BffStagingColumn } from "@epm/contracts/bff/data-import"

// AG-Gridモジュールを登録
registerAgGridModules()

interface ImportPreviewGridProps {
  columns: BffStagingColumn[]
  rows: BffStagingRow[]
  onRowExcludedChange: (rowIndex: number, excluded: boolean) => void
  onCellChange: (rowIndex: number, columnKey: string, value: string | null) => void
  className?: string
  height?: number | string
}

// 内部用の行データ型（AG-Grid用にrowIndex -> idに変換）
interface GridRowData extends Record<string, unknown> {
  id: string
  rowIndex: number
  excluded: boolean
  validationStatus: "OK" | "ERROR" | "WARNING"
}

// ステータスセルのレンダラー
function StatusCellRenderer(params: ICellRendererParams<GridRowData>) {
  const { excluded, validationStatus } = params.data ?? {}

  if (excluded) {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500">
        除外
      </span>
    )
  }

  switch (validationStatus) {
    case "ERROR":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-600">
          エラー
        </span>
      )
    case "WARNING":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-600">
          警告
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded bg-green-50 text-green-600">
          OK
        </span>
      )
  }
}

// チェックボックスセルのレンダラー
function ExcludedCheckboxRenderer(
  params: ICellRendererParams<GridRowData> & {
    onExcludedChange?: (rowIndex: number, excluded: boolean) => void
  }
) {
  const { excluded, rowIndex } = params.data ?? {}
  const isIncluded = !excluded

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    params.onExcludedChange?.(rowIndex!, !e.target.checked)
  }

  return (
    <div className="flex items-center justify-center h-full">
      <input
        type="checkbox"
        checked={isIncluded}
        onChange={handleChange}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        title={isIncluded ? "取込対象（クリックで除外）" : "除外中（クリックで取込対象に戻す）"}
      />
    </div>
  )
}

// 金額フォーマッター
function amountFormatter(params: ValueFormatterParams<GridRowData>): string {
  const value = params.value
  if (value === null || value === undefined || value === "") {
    return ""
  }
  const num = typeof value === "number" ? value : parseFloat(value)
  if (isNaN(num)) {
    return String(value)
  }
  return num.toLocaleString("ja-JP")
}

export function ImportPreviewGrid({
  columns,
  rows,
  onRowExcludedChange,
  onCellChange,
  className,
  height = 500,
}: ImportPreviewGridProps) {
  const gridRef = React.useRef<AgGridReact<GridRowData>>(null)
  const [gridApi, setGridApi] = React.useState<GridApi<GridRowData> | null>(null)

  // 行データを AG-Grid 形式に変換
  const rowData = React.useMemo<GridRowData[]>(() => {
    const data = rows.map((row) => ({
      id: String(row.rowIndex),
      rowIndex: row.rowIndex,
      excluded: row.excluded,
      validationStatus: row.validationStatus,
      ...row.cells,
    }))
    console.log("[ImportPreviewGrid] rowData:", data.length, "rows", data.slice(0, 2))
    return data
  }, [rows])

  // デバッグ用ログ
  React.useEffect(() => {
    console.log("[ImportPreviewGrid] columns:", columns.length, columns)
    console.log("[ImportPreviewGrid] rows:", rows.length)
  }, [columns, rows])

  // 列定義を生成
  const columnDefs = React.useMemo<ColDef<GridRowData>[]>(() => {
    const defs: ColDef<GridRowData>[] = [
      // チェックボックス列（取込対象）
      {
        headerName: "",
        field: "excluded",
        width: 50,
        pinned: "left",
        lockPosition: true,
        suppressMovable: true,
        cellRenderer: ExcludedCheckboxRenderer,
        cellRendererParams: {
          onExcludedChange: onRowExcludedChange,
        },
        editable: false,
        sortable: false,
        filter: false,
      },
      // 行番号列
      {
        headerName: "#",
        field: "rowIndex",
        width: 60,
        pinned: "left",
        lockPosition: true,
        suppressMovable: true,
        editable: false,
        sortable: false,
        filter: false,
        valueFormatter: (params) => String((params.value ?? 0) + 1),
        cellClass: "text-center text-muted-foreground tabular-nums",
      },
    ]

    // データ列
    columns.forEach((col) => {
      const isAmount = col.columnType === "AMOUNT"

      defs.push({
        headerName: col.label,
        field: col.key,
        width: col.width || 120,
        editable: (params) => !params.data?.excluded,
        sortable: false,
        filter: false,
        valueFormatter: isAmount ? amountFormatter : undefined,
        cellClass: (params) => {
          const classes = ["tabular-nums"]
          if (params.data?.excluded) {
            classes.push("bg-muted/50", "text-muted-foreground")
          }
          if (isAmount) {
            classes.push("text-right")
          }
          return classes.join(" ")
        },
        headerClass: isAmount ? "ag-right-aligned-header" : undefined,
      })
    })

    // ステータス列
    defs.push({
      headerName: "状態",
      field: "validationStatus",
      width: 80,
      pinned: "right",
      lockPosition: true,
      suppressMovable: true,
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: StatusCellRenderer,
      cellClass: "flex items-center justify-center",
    })

    return defs
  }, [columns, onRowExcludedChange])

  // デフォルト列定義
  const defaultColDef = React.useMemo<ColDef<GridRowData>>(
    () => ({
      sortable: false,
      filter: false,
      resizable: true,
      suppressMenu: true,
    }),
    []
  )

  // グリッド準備完了時
  const onGridReady = React.useCallback((params: GridReadyEvent<GridRowData>) => {
    setGridApi(params.api)
  }, [])

  // 行IDの取得
  const getRowId = React.useCallback(
    (params: { data: GridRowData }) => params.data.id,
    []
  )

  // セル値変更時
  const handleCellValueChanged = React.useCallback(
    (event: CellValueChangedEvent<GridRowData>) => {
      // チェックボックス列やステータス列は無視
      if (event.colDef.field === "excluded" || event.colDef.field === "validationStatus" || event.colDef.field === "rowIndex") {
        return
      }

      // 値が変わっていない場合はスキップ
      if (event.oldValue === event.newValue) {
        return
      }

      const rowIndex = event.data?.rowIndex
      const columnKey = event.colDef.field

      if (rowIndex !== undefined && columnKey) {
        const newValue = event.newValue === undefined ? null : String(event.newValue ?? "")
        onCellChange(rowIndex, columnKey, newValue === "" ? null : newValue)
      }
    },
    [onCellChange]
  )

  // 行の除外状態が変わった時にグリッドをリフレッシュ
  React.useEffect(() => {
    if (gridApi) {
      gridApi.refreshCells({ force: true })
    }
  }, [gridApi, rows])

  return (
    <div
      className={cn("ag-theme-alpine w-full", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <AgGridReact<GridRowData>
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onGridReady={onGridReady}
        onCellValueChanged={handleCellValueChanged}
        // ロケール
        localeText={AG_GRID_LOCALE_JP}
        // クリップボード機能
        enableRangeSelection={true}
        suppressCopyRowsToClipboard={false}
        clipboardDelimiter={"\t"}
        // 編集・ナビゲーション
        enterNavigatesVertically={true}
        enterNavigatesVerticallyAfterEdit={true}
        singleClickEdit={true}
        stopEditingWhenCellsLoseFocus={true}
        // その他
        animateRows={false}
        suppressRowClickSelection={true}
        rowSelection="single"
        headerHeight={40}
        rowHeight={36}
        // 行スタイル
        getRowClass={(params) => {
          if (params.data?.excluded) {
            return "opacity-60"
          }
          if (params.data?.validationStatus === "ERROR") {
            return "bg-red-50/30"
          }
          if (params.data?.validationStatus === "WARNING") {
            return "bg-amber-50/30"
          }
          return undefined
        }}
      />
    </div>
  )
}

export default ImportPreviewGrid

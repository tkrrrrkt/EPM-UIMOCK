"use client"

import * as React from "react"
import GC from "@mescius/spread-sheets"
import { SpreadSheets, Worksheet } from "@mescius/spread-sheets-react"
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css"

import type { BffStagingRow, BffStagingColumn } from "@epm/contracts/bff/data-import"

// SpreadJS Trial License (no key needed for trial)
GC.Spread.Sheets.LicenseKey = ""

interface StagingGridProps {
  columns: BffStagingColumn[]
  rows: BffStagingRow[]
  onRowExcludedChange: (rowIndex: number, excluded: boolean) => void
  onCellChange: (rowIndex: number, columnKey: string, value: string | null) => void
  className?: string
}

// 除外チェックボックス列の幅
const CHECKBOX_COL_WIDTH = 40
// 行番号列の幅
const ROW_NUMBER_COL_WIDTH = 50
// ステータス列の幅
const STATUS_COL_WIDTH = 60

export function StagingGrid({
  columns,
  rows,
  onRowExcludedChange,
  onCellChange,
  className,
}: StagingGridProps) {
  const spreadRef = React.useRef<GC.Spread.Sheets.Workbook | null>(null)

  const initSpread = React.useCallback((spread: GC.Spread.Sheets.Workbook) => {
    spreadRef.current = spread
    spread.suspendPaint()
    spread.suspendEvent()

    const sheet = spread.getActiveSheet()
    sheet.name("ステージング")

    // シート設定
    sheet.setRowCount(rows.length + 1) // ヘッダー + データ行
    sheet.setColumnCount(columns.length + 2) // チェックボックス + データ列 + ステータス

    // 列幅設定
    sheet.setColumnWidth(0, CHECKBOX_COL_WIDTH) // チェックボックス列
    columns.forEach((col, index) => {
      sheet.setColumnWidth(index + 1, col.width || 100)
    })
    sheet.setColumnWidth(columns.length + 1, STATUS_COL_WIDTH) // ステータス列

    // ヘッダー行設定
    sheet.setRowHeight(0, 32)
    sheet.getCell(0, 0).value("").backColor("#f3f4f6").locked(true)
    columns.forEach((col, index) => {
      sheet.getCell(0, index + 1)
        .value(col.label)
        .backColor("#f3f4f6")
        .font("bold 12px sans-serif")
        .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
        .locked(true)
    })
    sheet.getCell(0, columns.length + 1)
      .value("状態")
      .backColor("#f3f4f6")
      .font("bold 12px sans-serif")
      .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
      .locked(true)

    // データ行設定
    rows.forEach((row, rowIdx) => {
      const sheetRowIdx = rowIdx + 1 // ヘッダー行の次から

      // チェックボックス列
      const checkboxCell = sheet.getCell(sheetRowIdx, 0)
      checkboxCell.cellType(new GC.Spread.Sheets.CellTypes.CheckBox())
      checkboxCell.value(!row.excluded)
      checkboxCell.hAlign(GC.Spread.Sheets.HorizontalAlign.center)
      checkboxCell.vAlign(GC.Spread.Sheets.VerticalAlign.center)

      // データ列
      columns.forEach((col, colIdx) => {
        const cell = sheet.getCell(sheetRowIdx, colIdx + 1)
        const value = row.cells[col.key]
        cell.value(value ?? "")

        // 数値列は右寄せ
        if (col.columnType === "AMOUNT") {
          cell.hAlign(GC.Spread.Sheets.HorizontalAlign.right)
          if (value) {
            const numValue = parseFloat(value)
            if (!isNaN(numValue)) {
              cell.value(numValue)
              cell.formatter("#,##0")
            }
          }
        }

        // 除外行はグレーアウト
        if (row.excluded) {
          cell.backColor("#f3f4f6")
          cell.foreColor("#9ca3af")
        }
      })

      // ステータス列
      const statusCell = sheet.getCell(sheetRowIdx, columns.length + 1)
      statusCell.locked(true)
      statusCell.hAlign(GC.Spread.Sheets.HorizontalAlign.center)

      if (row.excluded) {
        statusCell.value("除外")
        statusCell.foreColor("#9ca3af")
        statusCell.backColor("#f3f4f6")
      } else if (row.validationStatus === "ERROR") {
        statusCell.value("エラー")
        statusCell.foreColor("#dc2626")
        statusCell.backColor("#fef2f2")
      } else if (row.validationStatus === "WARNING") {
        statusCell.value("警告")
        statusCell.foreColor("#d97706")
        statusCell.backColor("#fffbeb")
      } else {
        statusCell.value("OK")
        statusCell.foreColor("#16a34a")
      }
    })

    // フリーズ設定（ヘッダー行を固定）
    sheet.frozenRowCount(1)

    // シート保護（チェックボックスとデータセルのみ編集可）
    sheet.options.isProtected = false

    // イベント登録
    spread.bind(GC.Spread.Sheets.Events.CellChanged, (
      _sender: unknown,
      args: { row: number; col: number; newValue: unknown }
    ) => {
      const { row, col, newValue } = args
      if (row === 0) return // ヘッダー行は無視

      const dataRowIndex = row - 1

      if (col === 0) {
        // チェックボックス列の変更
        onRowExcludedChange(dataRowIndex, !newValue)
      } else if (col <= columns.length) {
        // データ列の変更
        const column = columns[col - 1]
        const stringValue = newValue === null || newValue === undefined ? null : String(newValue)
        onCellChange(dataRowIndex, column.key, stringValue)
      }
    })

    spread.resumeEvent()
    spread.resumePaint()
  }, [columns, rows, onRowExcludedChange, onCellChange])

  // 行の除外状態が変わった時にスタイルを更新
  const updateRowStyle = React.useCallback((rowIndex: number, excluded: boolean) => {
    const spread = spreadRef.current
    if (!spread) return

    const sheet = spread.getActiveSheet()
    const sheetRowIdx = rowIndex + 1

    spread.suspendPaint()

    columns.forEach((col, colIdx) => {
      const cell = sheet.getCell(sheetRowIdx, colIdx + 1)
      if (excluded) {
        cell.backColor("#f3f4f6")
        cell.foreColor("#9ca3af")
      } else {
        cell.backColor(undefined)
        cell.foreColor(undefined)
      }
    })

    // ステータス列更新
    const statusCell = sheet.getCell(sheetRowIdx, columns.length + 1)
    if (excluded) {
      statusCell.value("除外")
      statusCell.foreColor("#9ca3af")
      statusCell.backColor("#f3f4f6")
    } else {
      const row = rows[rowIndex]
      if (row?.validationStatus === "ERROR") {
        statusCell.value("エラー")
        statusCell.foreColor("#dc2626")
        statusCell.backColor("#fef2f2")
      } else if (row?.validationStatus === "WARNING") {
        statusCell.value("警告")
        statusCell.foreColor("#d97706")
        statusCell.backColor("#fffbeb")
      } else {
        statusCell.value("OK")
        statusCell.foreColor("#16a34a")
        statusCell.backColor(undefined)
      }
    }

    spread.resumePaint()
  }, [columns, rows])

  // 外部からのrowsの変更を反映
  React.useEffect(() => {
    const spread = spreadRef.current
    if (!spread) return

    rows.forEach((row, rowIndex) => {
      updateRowStyle(rowIndex, row.excluded)
    })
  }, [rows, updateRowStyle])

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <SpreadSheets
        workbookInitialized={initSpread}
        hostStyle={{ width: "100%", height: "100%" }}
      >
        <Worksheet />
      </SpreadSheets>
    </div>
  )
}

"use client"

import * as React from "react"
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  ColumnsDirective,
  ColumnDirective,
  RangesDirective,
  RangeDirective,
  getCellAddress,
  getRangeIndexes,
} from "@syncfusion/ej2-react-spreadsheet"
import { Loader2, Check, AlertCircle } from "lucide-react"
import type {
  BffBudgetRow,
  BffPeriodColumn,
  BffAffectedRow,
} from "@epm/contracts/bff/budget-entry"

// ============================================
// Types
// ============================================

interface CellState {
  isSaving: boolean
  isSaved: boolean
  error: string | null
}

interface SyncfusionBudgetGridProps {
  periods: BffPeriodColumn[]
  rows: BffBudgetRow[]
  isEditable: boolean
  onCellChange: (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null
  ) => Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }>
  onToggleExpand: (rowId: string) => void
}

// ============================================
// Helper Functions
// ============================================

const formatNumber = (value: number | string | null): string => {
  if (value === null || value === "") return ""
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return num.toLocaleString("ja-JP")
}

const parseNumber = (value: string): string | null => {
  if (!value || value.trim() === "") return null
  // Remove thousand separators
  const cleaned = value.replace(/,/g, "")
  const num = parseFloat(cleaned)
  if (isNaN(num)) return null
  return String(num)
}

// Parse cell address (e.g., "B2" -> { rowIndex: 1, colIndex: 1 })
const parseCellAddress = (address: string): { rowIndex: number; colIndex: number } | null => {
  // Handle sheet reference (e.g., "Sheet1!B2" -> "B2")
  const cellRef = address.includes("!") ? address.split("!")[1] : address
  const indexes = getRangeIndexes(cellRef)
  if (indexes && indexes.length >= 2) {
    return { rowIndex: indexes[0], colIndex: indexes[1] }
  }
  return null
}

// ============================================
// Component
// ============================================

export function SyncfusionBudgetGrid({
  periods,
  rows,
  isEditable,
  onCellChange,
}: SyncfusionBudgetGridProps) {
  const spreadsheetRef = React.useRef<SpreadsheetComponent>(null)
  const [cellStates, setCellStates] = React.useState<Record<string, CellState>>({})
  const [isReady, setIsReady] = React.useState(false)
  const saveTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})

  // Create cell key
  const getCellKey = (rowIndex: number, colIndex: number) => `${rowIndex}:${colIndex}`

  // Convert data to spreadsheet format
  const spreadsheetData = React.useMemo(() => {
    // Header row
    const headerRow = [
      "科目",
      ...periods.map((p) => p.periodLabel),
    ]

    // Data rows
    const dataRows = rows.map((row) => {
      const isAggregate = row.subjectClass === "AGGREGATE"
      const indent = "  ".repeat(row.indentLevel)
      const prefix = isAggregate ? "【" : ""
      const suffix = isAggregate ? "】" : ""
      const subjectCell = `${indent}${prefix}${row.subjectName}${suffix}`

      const cells = periods.map((period) => {
        const cell = row.cells.find((c) => c.periodId === period.periodId)
        return cell?.value ?? ""
      })

      return [subjectCell, ...cells]
    })

    return [headerRow, ...dataRows]
  }, [periods, rows])

  // Column definitions with freeze pane for subject column
  const columns = React.useMemo(() => {
    const cols: { width: number }[] = [{ width: 200 }] // Subject column
    periods.forEach((period) => {
      const width = period.periodType === "ANNUAL" ? 100 :
                   period.periodType === "HALF" ? 90 : 80
      cols.push({ width })
    })
    return cols
  }, [periods])

  // Handle cell edit - using generic event args to avoid type issues
  const handleCellSave = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      const address = args.address as string
      const value = args.value as string | number | null

      // Parse the address to get row/col indexes
      const parsed = parseCellAddress(address)
      if (!parsed) return

      const { rowIndex, colIndex } = parsed

      // Skip header row
      if (rowIndex === 0) return
      // Skip subject column
      if (colIndex === 0) return

      // Get the actual row data
      const dataRowIndex = rowIndex - 1 // Subtract header
      const row = rows[dataRowIndex]
      if (!row) return

      // Check if cell is editable
      if (!row.isEditable) {
        args.cancel = true
        return
      }

      const periodIndex = colIndex - 1 // Subtract subject column
      const period = periods[periodIndex]
      if (!period || !period.isEditable) {
        args.cancel = true
        return
      }

      // Parse the value
      const parsedValue = parseNumber(String(value ?? ""))
      const cellKey = getCellKey(rowIndex, colIndex)

      // Clear existing timeout
      if (saveTimeoutRef.current[cellKey]) {
        clearTimeout(saveTimeoutRef.current[cellKey])
      }

      // Set saving state
      setCellStates((prev) => ({
        ...prev,
        [cellKey]: { isSaving: true, isSaved: false, error: null },
      }))

      // Debounced save
      saveTimeoutRef.current[cellKey] = setTimeout(async () => {
        try {
          const result = await onCellChange(
            row.rowId,
            row.subjectId,
            period.periodId,
            row.dimensionValueId,
            parsedValue
          )

          if (result.success) {
            setCellStates((prev) => ({
              ...prev,
              [cellKey]: { isSaving: false, isSaved: true, error: null },
            }))

            // Clear saved indicator after 1.5s
            setTimeout(() => {
              setCellStates((prev) => ({
                ...prev,
                [cellKey]: { ...prev[cellKey], isSaved: false },
              }))
            }, 1500)

            // Update affected rows (AGGREGATE recalculation)
            if (result.affectedRows && spreadsheetRef.current) {
              result.affectedRows.forEach((affected) => {
                const affectedRowIndex = rows.findIndex((r) => r.rowId === affected.rowId)
                if (affectedRowIndex !== -1) {
                  affected.cells.forEach((cell) => {
                    const affectedPeriodIndex = periods.findIndex((p) => p.periodId === cell.periodId)
                    if (affectedPeriodIndex !== -1) {
                      const cellAddress = getCellAddress(affectedRowIndex + 1, affectedPeriodIndex + 1)
                      spreadsheetRef.current?.updateCell(
                        { value: formatNumber(cell.value) },
                        cellAddress
                      )
                    }
                  })
                }
              })
            }
          } else {
            setCellStates((prev) => ({
              ...prev,
              [cellKey]: { isSaving: false, isSaved: false, error: result.error ?? "保存に失敗しました" },
            }))
          }
        } catch (err) {
          setCellStates((prev) => ({
            ...prev,
            [cellKey]: {
              isSaving: false,
              isSaved: false,
              error: err instanceof Error ? err.message : "エラーが発生しました",
            },
          }))
        }
      }, 300)
    },
    [rows, periods, onCellChange]
  )

  // Handle cell format before update - using generic event args
  const handleBeforeCellUpdate = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      const rowIndex = args.rowIndex as number | undefined
      const colIndex = args.colIndex as number | undefined

      if (rowIndex === undefined || colIndex === undefined) return

      // Skip header row
      if (rowIndex === 0) return

      // Check editability
      const dataRowIndex = rowIndex - 1
      const row = rows[dataRowIndex]
      if (!row || !row.isEditable || !isEditable) {
        args.cancel = true
        return
      }

      // Skip subject column
      if (colIndex === 0) {
        args.cancel = true
        return
      }

      const periodIndex = colIndex - 1
      const period = periods[periodIndex]
      if (!period || !period.isEditable) {
        args.cancel = true
        return
      }
    },
    [rows, periods, isEditable]
  )

  // Initialize spreadsheet on created
  const handleCreated = React.useCallback(() => {
    if (!spreadsheetRef.current) return

    const spreadsheet = spreadsheetRef.current

    // Freeze first column (subject)
    spreadsheet.freezePanes(1, 1)

    // Apply header styles
    spreadsheet.cellFormat(
      {
        fontWeight: "bold",
        backgroundColor: "#f1f5f9",
        textAlign: "center",
        verticalAlign: "middle",
        border: "1px solid #e2e8f0",
      },
      "A1:" + getCellAddress(0, periods.length)
    )

    // Apply subject column styles
    spreadsheet.cellFormat(
      {
        fontWeight: "normal",
        backgroundColor: "#ffffff",
        textAlign: "left",
        verticalAlign: "middle",
        border: "1px solid #e2e8f0",
      },
      `A2:A${rows.length + 1}`
    )

    // Apply data cell styles
    spreadsheet.cellFormat(
      {
        textAlign: "right",
        verticalAlign: "middle",
        border: "1px solid #e2e8f0",
      },
      `B2:${getCellAddress(rows.length, periods.length)}`
    )

    // Apply aggregate row styles
    rows.forEach((row, index) => {
      if (row.subjectClass === "AGGREGATE") {
        const rowNum = index + 2 // +1 for header, +1 for 1-based
        spreadsheet.cellFormat(
          {
            fontWeight: "bold",
            backgroundColor: "#f1f5f9",
          },
          `A${rowNum}:${getCellAddress(index + 1, periods.length)}`
        )
      }
    })

    // Apply period type styles (quarter, half, annual)
    periods.forEach((period, index) => {
      const colLetter = String.fromCharCode(66 + index) // B, C, D...
      let bgColor = "#ffffff"
      let fontWeight: "normal" | "bold" = "normal"

      if (period.periodType === "QUARTER") {
        bgColor = "#f0f9ff"
      } else if (period.periodType === "HALF") {
        bgColor = "#dbeafe"
        fontWeight = "bold"
      } else if (period.periodType === "ANNUAL") {
        bgColor = "#fef3c7"
        fontWeight = "bold"
      }

      if (!period.isOpen || !period.isEditable) {
        bgColor = "#f8fafc"
      }

      // Apply to header
      spreadsheet.cellFormat(
        { backgroundColor: bgColor, fontWeight },
        `${colLetter}1`
      )
    })

    // Set number format for data cells
    spreadsheet.numberFormat("#,##0", `B2:${getCellAddress(rows.length, periods.length)}`)

    setIsReady(true)
  }, [periods, rows])

  // Protect non-editable cells
  React.useEffect(() => {
    if (!isReady || !spreadsheetRef.current) return

    // Lock header row
    spreadsheetRef.current.lockCells(`A1:${getCellAddress(0, periods.length)}`, true)
    // Lock subject column
    spreadsheetRef.current.lockCells(`A1:A${rows.length + 1}`, true)

    // Lock non-editable rows
    rows.forEach((row, index) => {
      if (!row.isEditable) {
        const rowNum = index + 2
        spreadsheetRef.current?.lockCells(
          `B${rowNum}:${getCellAddress(index + 1, periods.length)}`,
          true
        )
      }
    })

    // Lock non-editable period columns
    periods.forEach((period, index) => {
      if (!period.isEditable || !period.isOpen) {
        const colLetter = String.fromCharCode(66 + index) // B, C, D...
        spreadsheetRef.current?.lockCells(
          `${colLetter}2:${colLetter}${rows.length + 1}`,
          true
        )
      }
    })
  }, [isReady, rows, periods])

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">データがありません</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden relative">
      {/* Status indicators */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {Object.entries(cellStates).map(([key, state]) => {
          if (state.isSaving) {
            return (
              <div key={key} className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow-sm">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-xs">保存中...</span>
              </div>
            )
          }
          if (state.isSaved) {
            return (
              <div key={key} className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded shadow-sm">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">保存完了</span>
              </div>
            )
          }
          if (state.error) {
            return (
              <div key={key} className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded shadow-sm">
                <AlertCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs text-red-600">{state.error}</span>
              </div>
            )
          }
          return null
        })}
      </div>

      <SpreadsheetComponent
        ref={spreadsheetRef}
        height={500}
        showRibbon={false}
        showFormulaBar={false}
        showSheetTabs={false}
        allowEditing={isEditable}
        allowOpen={false}
        allowSave={false}
        allowSorting={false}
        allowFiltering={false}
        allowHyperlink={false}
        allowUndoRedo={true}
        allowAutoFill={true}
        enableClipboard={true}
        enableKeyboardNavigation={true}
        enableContextMenu={true}
        selectionSettings={{ mode: "Multiple" }}
        scrollSettings={{ isFinite: true }}
        cellSave={handleCellSave}
        beforeCellUpdate={handleBeforeCellUpdate}
        created={handleCreated}
      >
        <SheetsDirective>
          <SheetDirective
            name="予算入力"
            rowCount={rows.length + 1}
            colCount={periods.length + 1}
            frozenRows={1}
            frozenColumns={1}
          >
            <RangesDirective>
              <RangeDirective dataSource={spreadsheetData} />
            </RangesDirective>
            <ColumnsDirective>
              {columns.map((col, index) => (
                <ColumnDirective key={index} width={col.width} />
              ))}
            </ColumnsDirective>
          </SheetDirective>
        </SheetsDirective>
      </SpreadsheetComponent>
    </div>
  )
}

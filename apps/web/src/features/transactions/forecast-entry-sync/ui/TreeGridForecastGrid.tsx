"use client"

import * as React from "react"
import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Freeze,
  Selection,
  RowDD,
  Filter,
  Sort,
  Resize,
  EditSettingsModel,
  SelectionSettingsModel,
} from "@syncfusion/ej2-react-treegrid"
import { Loader2, Check, AlertCircle, Save } from "lucide-react"
import type {
  BffForecastRow,
  BffForecastPeriodColumn,
  BffForecastCell,
  BffAffectedRow,
} from "@epm/contracts/bff/forecast-entry"

// ============================================
// Types
// ============================================

interface TreeGridRow {
  id: string
  rowId: string
  subjectId: string
  subjectName: string
  subjectClass: "BASE" | "AGGREGATE"
  indentLevel: number
  isEditable: boolean
  dimensionValueId: string | null
  parentId: string | null
  isExpanded: boolean
  [key: string]: string | number | boolean | null // Period values
}

interface CellState {
  isSaving: boolean
  isSaved: boolean
  error: string | null
}

interface TreeGridForecastGridProps {
  periods: BffForecastPeriodColumn[]
  rows: BffForecastRow[]
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

const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return ""
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return num.toLocaleString("ja-JP")
}

const parseNumber = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  const strValue = String(value).trim()
  if (strValue === "") return null
  const cleaned = strValue.replace(/,/g, "")
  const num = parseFloat(cleaned)
  if (isNaN(num)) return null
  return String(num)
}

// Convert BffForecastRow to TreeGrid format
const convertToTreeGridData = (
  rows: BffForecastRow[],
  periods: BffForecastPeriodColumn[]
): TreeGridRow[] => {
  return rows.map((row) => {
    const treeRow: TreeGridRow = {
      id: row.rowId,
      rowId: row.rowId,
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      subjectClass: row.subjectClass,
      indentLevel: row.indentLevel,
      isEditable: row.isEditable,
      dimensionValueId: row.dimensionValueId,
      parentId: row.parentRowId ?? null,
      isExpanded: row.isExpanded,
    }

    // Add period values as dynamic columns
    periods.forEach((period) => {
      const cell = row.cells.find((c) => c.periodId === period.periodId)
      treeRow[period.periodId] = cell?.value ?? null
    })

    return treeRow
  })
}

// ============================================
// Component
// ============================================

export function TreeGridForecastGrid({
  periods,
  rows,
  isEditable,
  onCellChange,
  onToggleExpand,
}: TreeGridForecastGridProps) {
  const treeGridRef = React.useRef<TreeGridComponent>(null)
  const [cellStates, setCellStates] = React.useState<Record<string, CellState>>({})
  const [pendingChanges, setPendingChanges] = React.useState<number>(0)
  const saveTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})

  // Convert data to TreeGrid format
  const treeGridData = React.useMemo(
    () => convertToTreeGridData(rows, periods),
    [rows, periods]
  )

  // Edit settings
  const editSettings: EditSettingsModel = React.useMemo(
    () => ({
      allowEditing: isEditable,
      allowAdding: false,
      allowDeleting: false,
      mode: "Cell", // Cell editing mode for spreadsheet-like behavior
      newRowPosition: "Child",
    }),
    [isEditable]
  )

  // Selection settings
  const selectionSettings: SelectionSettingsModel = React.useMemo(
    () => ({
      type: "Multiple",
      mode: "Cell",
      cellSelectionMode: "Box", // Allow box selection like Excel
    }),
    []
  )

  // Get cell key
  const getCellKey = (rowId: string, periodId: string) => `${rowId}:${periodId}`

  // Handle cell edit complete
  const handleCellSave = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      const { rowData, columnName, value, previousValue } = args

      // Skip if value hasn't changed
      if (value === previousValue) return

      // Skip non-period columns
      const period = periods.find((p) => p.periodId === columnName)
      if (!period) return

      const row = rows.find((r) => r.rowId === rowData.rowId)
      if (!row) return

      // Check editability - also check month status for forecast
      if (!row.isEditable || !period.isEditable || period.monthStatus === "ACTUAL") {
        args.cancel = true
        return
      }

      const cellKey = getCellKey(row.rowId, period.periodId)
      const parsedValue = parseNumber(value)

      // Clear existing timeout
      if (saveTimeoutRef.current[cellKey]) {
        clearTimeout(saveTimeoutRef.current[cellKey])
      }

      // Update pending count
      setPendingChanges((prev) => prev + 1)

      // Set saving state
      setCellStates((prev) => ({
        ...prev,
        [cellKey]: { isSaving: true, isSaved: false, error: null },
      }))

      // Debounced save (shorter delay for better UX)
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

            // Update affected rows (AGGREGATE recalculation)
            if (result.affectedRows && treeGridRef.current) {
              result.affectedRows.forEach((affected) => {
                const affectedRow = treeGridData.find((r) => r.rowId === affected.rowId)
                if (affectedRow) {
                  affected.cells.forEach((cell) => {
                    affectedRow[cell.periodId] = cell.value
                  })
                  // Refresh the row
                  treeGridRef.current?.refresh()
                }
              })
            }

            // Clear saved indicator after 2s
            setTimeout(() => {
              setCellStates((prev) => {
                const newState = { ...prev }
                if (newState[cellKey]?.isSaved) {
                  delete newState[cellKey]
                }
                return newState
              })
            }, 2000)
          } else {
            setCellStates((prev) => ({
              ...prev,
              [cellKey]: {
                isSaving: false,
                isSaved: false,
                error: result.error ?? "保存に失敗しました",
              },
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
        } finally {
          setPendingChanges((prev) => Math.max(0, prev - 1))
        }
      }, 200) // Short delay for responsive feel
    },
    [rows, periods, onCellChange, treeGridData]
  )

  // Handle cell edit begin - check editability
  const handleCellEdit = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      const { rowData, columnName } = args

      // Allow subject column to be read-only
      if (columnName === "subjectName") {
        args.cancel = true
        return
      }

      // Check period editability
      const period = periods.find((p) => p.periodId === columnName)
      if (!period || !period.isEditable || !period.isOpen || period.monthStatus === "ACTUAL") {
        args.cancel = true
        return
      }

      // Check row editability
      if (!rowData.isEditable) {
        args.cancel = true
        return
      }
    },
    [periods]
  )

  // Row expand/collapse handler
  const handleExpanding = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      onToggleExpand(args.data.rowId)
    },
    [onToggleExpand]
  )

  const handleCollapsing = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      onToggleExpand(args.data.rowId)
    },
    [onToggleExpand]
  )

  // Query cell info for styling
  const handleQueryCellInfo = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      const { data, column, cell } = args
      if (!data || !column || !cell) return

      const isAggregate = data.subjectClass === "AGGREGATE"
      const period = periods.find((p) => p.periodId === column.field)

      // Style aggregate rows
      if (isAggregate) {
        cell.classList.add("e-aggregate-row")
        cell.style.backgroundColor = "#f8fafc"
        cell.style.fontWeight = "600"
      }

      // Style period columns
      if (period) {
        cell.style.textAlign = "right"
        cell.style.fontFamily = "ui-monospace, monospace"
        cell.style.fontSize = "13px"

        // Month status styling (for forecast)
        if (period.monthStatus === "ACTUAL") {
          cell.style.backgroundColor = isAggregate ? "#d1d5db" : "#e5e7eb"
          cell.style.color = "#6b7280"
        } else if (period.monthStatus === "CLOSING") {
          cell.style.backgroundColor = isAggregate ? "#fef08a" : "#fef9c3"
        }

        // Period type styling
        if (period.periodType === "QUARTER") {
          cell.style.backgroundColor = isAggregate ? "#d1fae5" : "#ecfdf5"
        } else if (period.periodType === "HALF") {
          cell.style.backgroundColor = isAggregate ? "#a7f3d0" : "#d1fae5"
          cell.style.fontWeight = "600"
        } else if (period.periodType === "ANNUAL") {
          cell.style.backgroundColor = isAggregate ? "#fde68a" : "#fef3c7"
          cell.style.fontWeight = "700"
        }

        // Non-editable period styling
        if (!period.isEditable || !period.isOpen) {
          cell.style.backgroundColor = "#f1f5f9"
          cell.style.color = "#64748b"
        }

        // Non-editable row styling for this cell
        if (!data.isEditable) {
          cell.style.backgroundColor = "#f8fafc"
          cell.style.color = "#64748b"
        }

        // Format number
        const value = data[column.field]
        if (value !== null && value !== undefined && value !== "") {
          cell.innerText = formatNumber(value)
        }

        // Check for cell state (saving/saved/error)
        const cellKey = getCellKey(data.rowId, period.periodId)
        const cellState = cellStates[cellKey]
        if (cellState?.error) {
          cell.style.backgroundColor = "#fef2f2"
          cell.style.borderColor = "#ef4444"
        } else if (cellState?.isSaved) {
          cell.style.backgroundColor = "#f0fdf4"
        }
      }

      // Subject column styling
      if (column.field === "subjectName") {
        cell.style.fontWeight = isAggregate ? "700" : "400"
        if (isAggregate) {
          cell.style.color = "#374151"
        }
      }
    },
    [periods, cellStates]
  )

  // Header cell styling
  const handleHeaderCellInfo = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      const { cell, column } = args
      if (!cell || !column) return

      const period = periods.find((p) => p.periodId === column.field)
      if (period) {
        cell.style.textAlign = "center"
        cell.style.fontSize = "12px"
        cell.style.fontWeight = "600"

        // Month status indicator in header
        if (period.periodType === "MONTH") {
          if (period.monthStatus === "ACTUAL") {
            cell.style.backgroundColor = "#e5e7eb"
          } else if (period.monthStatus === "CLOSING") {
            cell.style.backgroundColor = "#fef9c3"
          }
        }

        if (period.periodType === "QUARTER") {
          cell.style.backgroundColor = "#d1fae5"
        } else if (period.periodType === "HALF") {
          cell.style.backgroundColor = "#a7f3d0"
        } else if (period.periodType === "ANNUAL") {
          cell.style.backgroundColor = "#fde68a"
        }
      }
    },
    [periods]
  )

  // Calculate status
  const savingCount = Object.values(cellStates).filter((s) => s.isSaving).length
  const savedCount = Object.values(cellStates).filter((s) => s.isSaved).length
  const errorCount = Object.values(cellStates).filter((s) => s.error).length

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">データがありません</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            {rows.length} 件の科目
          </span>
          {isEditable && (
            <span className="text-muted-foreground">
              ダブルクリックまたはF2で編集 • Tab/Enterでセル移動 • Ctrl+V でペースト
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {savingCount > 0 && (
            <div className="flex items-center gap-1.5 text-blue-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>保存中...</span>
            </div>
          )}
          {savedCount > 0 && (
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="h-3.5 w-3.5" />
              <span>保存完了</span>
            </div>
          )}
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorCount}件のエラー</span>
            </div>
          )}
          {isEditable && pendingChanges === 0 && savingCount === 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Save className="h-3.5 w-3.5" />
              <span>自動保存</span>
            </div>
          )}
        </div>
      </div>

      {/* TreeGrid */}
      <TreeGridComponent
        ref={treeGridRef}
        dataSource={treeGridData}
        idMapping="id"
        parentIdMapping="parentId"
        treeColumnIndex={0}
        height="450"
        allowSelection={true}
        allowResizing={true}
        editSettings={editSettings}
        selectionSettings={selectionSettings}
        enableCollapseAll={false}
        frozenColumns={1}
        gridLines="Both"
        rowHeight={36}
        cellSave={handleCellSave}
        cellEdit={handleCellEdit}
        expanding={handleExpanding}
        collapsing={handleCollapsing}
        queryCellInfo={handleQueryCellInfo}
        headerCellInfo={handleHeaderCellInfo}
      >
        <ColumnsDirective>
          {/* Subject Column - Frozen */}
          <ColumnDirective
            field="subjectName"
            headerText="科目"
            width={220}
            minWidth={180}
            allowEditing={false}
            clipMode="EllipsisWithTooltip"
          />

          {/* Period Columns - Dynamic */}
          {periods.map((period) => (
            <ColumnDirective
              key={period.periodId}
              field={period.periodId}
              headerText={period.periodLabel}
              width={period.periodType === "ANNUAL" ? 100 : period.periodType === "HALF" ? 90 : 80}
              minWidth={70}
              textAlign="Right"
              format="N0"
              allowEditing={period.isEditable && period.isOpen && period.monthStatus !== "ACTUAL"}
              clipMode="Clip"
            />
          ))}
        </ColumnsDirective>
        <Inject services={[Edit, Freeze, Selection, RowDD, Filter, Sort, Resize]} />
      </TreeGridComponent>

      {/* Month Status Legend */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-200 border" />
            <span>実績確定</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-100 border" />
            <span>締処理中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white border" />
            <span>見込入力可</span>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        {isEditable && (
          <div className="flex items-center gap-6">
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">F2</kbd> 編集</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Tab</kbd> 次のセル</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> 下のセル</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> キャンセル</span>
          </div>
        )}
      </div>
    </div>
  )
}

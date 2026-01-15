"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import { Input } from "@/shared/ui/components/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip"
import type {
  BffBudgetRow,
  BffPeriodColumn,
  BffBudgetCell,
  BffAffectedRow,
  BffHistoricalCompareRow,
} from "@epm/contracts/bff/budget-entry"

// ============================================
// Types
// ============================================

interface CellPosition {
  rowId: string
  periodId: string
}

interface CellState {
  value: string
  isSaving: boolean
  isSaved: boolean
  error: string | null
}

interface BudgetGridProps {
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
  // 比較モード（過去実績との比較時に使用）
  compareMode?: boolean
  compareRows?: BffHistoricalCompareRow[]
  compareYear?: number
}

// ============================================
// Component
// ============================================

export function BudgetGrid({
  periods,
  rows,
  isEditable,
  onCellChange,
  onToggleExpand,
  compareMode = false,
  compareRows,
  compareYear,
}: BudgetGridProps) {
  const [editingCell, setEditingCell] = React.useState<CellPosition | null>(null)
  const [cellStates, setCellStates] = React.useState<Record<string, CellState>>({})
  const [localRows, setLocalRows] = React.useState<BffBudgetRow[]>(rows)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const saveTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})

  React.useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  React.useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const getCellKey = (rowId: string, periodId: string) => `${rowId}:${periodId}`

  const getCellValue = (row: BffBudgetRow, periodId: string): string => {
    const cellKey = getCellKey(row.rowId, periodId)
    if (cellStates[cellKey]?.value !== undefined) {
      return cellStates[cellKey].value
    }
    const cell = row.cells.find((c) => c.periodId === periodId)
    return cell?.value ?? ""
  }

  const handleCellClick = (row: BffBudgetRow, periodId: string) => {
    if (!isEditable || !row.isEditable) return
    const period = periods.find((p) => p.periodId === periodId)
    if (!period?.isEditable) return

    setEditingCell({ rowId: row.rowId, periodId })
  }

  const handleCellChange = (row: BffBudgetRow, periodId: string, value: string) => {
    const cellKey = getCellKey(row.rowId, periodId)

    setCellStates((prev) => ({
      ...prev,
      [cellKey]: {
        value,
        isSaving: false,
        isSaved: false,
        error: null,
      },
    }))

    // Clear existing timeout
    if (saveTimeoutRef.current[cellKey]) {
      clearTimeout(saveTimeoutRef.current[cellKey])
    }

    // Debounce save (500ms)
    saveTimeoutRef.current[cellKey] = setTimeout(() => {
      handleSaveCell(row, periodId, value)
    }, 500)
  }

  const handleSaveCell = async (row: BffBudgetRow, periodId: string, value: string) => {
    const cellKey = getCellKey(row.rowId, periodId)

    setCellStates((prev) => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        isSaving: true,
        error: null,
      },
    }))

    const result = await onCellChange(
      row.rowId,
      row.subjectId,
      periodId,
      row.dimensionValueId,
      value === "" ? null : value
    )

    if (result.success) {
      setCellStates((prev) => ({
        ...prev,
        [cellKey]: {
          ...prev[cellKey],
          isSaving: false,
          isSaved: true,
          error: null,
        },
      }))

      // Update affected rows (AGGREGATE recalculation)
      if (result.affectedRows) {
        setLocalRows((prev) =>
          prev.map((r) => {
            const affected = result.affectedRows?.find((ar) => ar.rowId === r.rowId)
            if (affected) {
              return {
                ...r,
                cells: affected.cells,
                annualTotal: affected.annualTotal,
              }
            }
            return r
          })
        )
      }

      // Clear saved indicator after 1.5s
      setTimeout(() => {
        setCellStates((prev) => ({
          ...prev,
          [cellKey]: {
            ...prev[cellKey],
            isSaved: false,
          },
        }))
      }, 1500)
    } else {
      setCellStates((prev) => ({
        ...prev,
        [cellKey]: {
          ...prev[cellKey],
          isSaving: false,
          isSaved: false,
          error: result.error ?? "保存に失敗しました",
        },
      }))
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    row: BffBudgetRow,
    periodIndex: number
  ) => {
    const editableRowIds = localRows.filter((r) => r.isEditable).map((r) => r.rowId)
    const currentRowIndex = editableRowIds.indexOf(row.rowId)

    switch (e.key) {
      case "Tab": {
        e.preventDefault()
        const nextPeriodIndex = e.shiftKey ? periodIndex - 1 : periodIndex + 1
        if (nextPeriodIndex >= 0 && nextPeriodIndex < periods.length) {
          setEditingCell({ rowId: row.rowId, periodId: periods[nextPeriodIndex].periodId })
        } else if (!e.shiftKey && currentRowIndex < editableRowIds.length - 1) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex + 1], periodId: periods[0].periodId })
        } else if (e.shiftKey && currentRowIndex > 0) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex - 1], periodId: periods[periods.length - 1].periodId })
        }
        break
      }
      case "Enter": {
        e.preventDefault()
        const nextRowIndex = e.shiftKey ? currentRowIndex - 1 : currentRowIndex + 1
        if (nextRowIndex >= 0 && nextRowIndex < editableRowIds.length) {
          setEditingCell({ rowId: editableRowIds[nextRowIndex], periodId: periods[periodIndex].periodId })
        }
        break
      }
      case "ArrowUp": {
        e.preventDefault()
        if (currentRowIndex > 0) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex - 1], periodId: periods[periodIndex].periodId })
        }
        break
      }
      case "ArrowDown": {
        e.preventDefault()
        if (currentRowIndex < editableRowIds.length - 1) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex + 1], periodId: periods[periodIndex].periodId })
        }
        break
      }
      case "ArrowLeft": {
        if (inputRef.current?.selectionStart === 0) {
          e.preventDefault()
          if (periodIndex > 0) {
            setEditingCell({ rowId: row.rowId, periodId: periods[periodIndex - 1].periodId })
          }
        }
        break
      }
      case "ArrowRight": {
        if (inputRef.current?.selectionStart === inputRef.current?.value.length) {
          e.preventDefault()
          if (periodIndex < periods.length - 1) {
            setEditingCell({ rowId: row.rowId, periodId: periods[periodIndex + 1].periodId })
          }
        }
        break
      }
      case "Escape": {
        e.preventDefault()
        const cellKey = getCellKey(row.rowId, periods[periodIndex].periodId)
        setCellStates((prev) => {
          const newState = { ...prev }
          delete newState[cellKey]
          return newState
        })
        setEditingCell(null)
        break
      }
    }
  }

  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return ""
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[200px] sticky left-0 bg-muted z-30">
                科目
              </TableHead>
              {periods.map((period) => (
                <TableHead
                  key={period.periodId}
                  className={cn(
                    "text-right w-[80px]",
                    !period.isOpen && "bg-muted/30 text-muted-foreground",
                    period.isAggregate && "bg-muted/40 font-semibold",
                    period.periodType === "HALF" && "bg-blue-50 font-semibold",
                    period.periodType === "ANNUAL" && "bg-amber-50 font-bold"
                  )}
                >
                  {period.periodLabel}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {localRows.map((row) => {
              const isAggregate = row.subjectClass === "AGGREGATE"

              return (
                <TableRow
                  key={row.rowId}
                  className={cn(
                    isAggregate && "bg-muted/30 font-medium",
                    row.indentLevel > 0 && "text-sm"
                  )}
                >
                  <TableCell
                    className={cn(
                      "sticky left-0 z-20",
                      isAggregate ? "bg-gray-100" : "bg-white"
                    )}
                  >
                    <div
                      className="flex items-center gap-1"
                      style={{ paddingLeft: `${row.indentLevel * 16}px` }}
                    >
                      {row.isExpandable ? (
                        <button
                          type="button"
                          onClick={() => onToggleExpand(row.rowId)}
                          className="p-0.5 hover:bg-muted rounded"
                        >
                          {row.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}
                      <span className={cn(isAggregate && "text-muted-foreground")}>
                        {isAggregate ? `【${row.subjectName}】` : row.subjectName}
                      </span>
                    </div>
                  </TableCell>

                  {periods.map((period, periodIndex) => {
                    const cellKey = getCellKey(row.rowId, period.periodId)
                    const cellState = cellStates[cellKey]
                    const isEditing =
                      editingCell?.rowId === row.rowId &&
                      editingCell?.periodId === period.periodId
                    const cellValue = getCellValue(row, period.periodId)
                    const isCellEditable =
                      isEditable && row.isEditable && period.isEditable

                    return (
                      <TableCell
                        key={period.periodId}
                        className={cn(
                          "text-right p-0",
                          isAggregate && "bg-muted/30",
                          !period.isOpen && "bg-muted/20",
                          period.isAggregate && "bg-muted/20",
                          period.periodType === "HALF" && "bg-blue-50/50",
                          period.periodType === "ANNUAL" && "bg-amber-50/50",
                          cellState?.error && "bg-destructive/10"
                        )}
                      >
                        {isEditing ? (
                          <Input
                            ref={inputRef}
                            type="text"
                            value={cellValue}
                            onChange={(e) =>
                              handleCellChange(row, period.periodId, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, row, periodIndex)}
                            onBlur={() => setEditingCell(null)}
                            className="h-8 text-right border-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        ) : (
                          <div
                            className={cn(
                              "h-8 px-2 py-1 flex items-center justify-end gap-1",
                              isCellEditable && "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={() => handleCellClick(row, period.periodId)}
                          >
                            {cellState?.isSaving && (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                            {cellState?.isSaved && (
                              <Check className="h-3 w-3 text-success" />
                            )}
                            {cellState?.error && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3 w-3 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{cellState.error}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className="font-mono text-sm">
                              {formatAmount(cellValue)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

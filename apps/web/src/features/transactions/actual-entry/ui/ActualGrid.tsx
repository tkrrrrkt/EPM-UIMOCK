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
  BffActualRow,
  BffActualPeriodColumn,
  BffActualCell,
  BffAffectedRow,
  ActualMonthStatus,
  SourceType,
} from "@epm/contracts/bff/actual-entry"

// ============================================
// Types
// ============================================

interface CellPosition {
  rowId: string
  periodId: string
  sourceType: SourceType
}

interface CellState {
  value: string
  isSaving: boolean
  isSaved: boolean
  error: string | null
}

interface ActualGridProps {
  periods: BffActualPeriodColumn[]
  rows: BffActualRow[]
  isEditable: boolean
  showAdjustmentBreakdown: boolean
  onCellChange: (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null,
    sourceType: SourceType
  ) => Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }>
  onToggleExpand: (rowId: string) => void
}

// ============================================
// Component
// ============================================

export function ActualGrid({
  periods,
  rows,
  isEditable,
  showAdjustmentBreakdown,
  onCellChange,
  onToggleExpand,
}: ActualGridProps) {
  const [editingCell, setEditingCell] = React.useState<CellPosition | null>(null)
  const [cellStates, setCellStates] = React.useState<Record<string, CellState>>({})
  const [localRows, setLocalRows] = React.useState<BffActualRow[]>(rows)
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

  const getCellKey = (rowId: string, periodId: string, sourceType: SourceType = "TOTAL") =>
    `${rowId}:${periodId}:${sourceType}`

  const getCellValue = (
    cells: BffActualCell[],
    rowId: string,
    periodId: string,
    sourceType: SourceType
  ): string => {
    const cellKey = getCellKey(rowId, periodId, sourceType)
    if (cellStates[cellKey]?.value !== undefined) {
      return cellStates[cellKey].value
    }
    const cell = cells.find((c) => c.periodId === periodId)
    return cell?.value ?? ""
  }

  const handleCellClick = (
    row: BffActualRow,
    periodId: string,
    sourceType: SourceType
  ) => {
    if (!isEditable || !row.isEditable) return
    const period = periods.find((p) => p.periodId === periodId)
    if (!period?.isEditable) return

    // HARD_CLOSED, FUTUREは編集不可
    if (period.monthStatus === "HARD_CLOSED" || period.monthStatus === "FUTURE") return

    // INPUT行は編集不可（ERP取込値）
    if (sourceType === "INPUT") return

    // TOTAL行の場合、調整内訳表示中は編集不可（ADJUST行で編集）
    if (sourceType === "TOTAL" && showAdjustmentBreakdown) return

    setEditingCell({ rowId: row.rowId, periodId, sourceType })
  }

  const handleCellChange = (
    row: BffActualRow,
    periodId: string,
    value: string,
    sourceType: SourceType
  ) => {
    const cellKey = getCellKey(row.rowId, periodId, sourceType)

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
      handleSaveCell(row, periodId, value, sourceType)
    }, 500)
  }

  const handleSaveCell = async (
    row: BffActualRow,
    periodId: string,
    value: string,
    sourceType: SourceType
  ) => {
    const cellKey = getCellKey(row.rowId, periodId, sourceType)

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
      value === "" ? null : value,
      sourceType === "TOTAL" ? "ADJUST" : sourceType
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
                cells: affected.cells as BffActualCell[],
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
    row: BffActualRow,
    periodIndex: number,
    sourceType: SourceType
  ) => {
    const editableRowIds = localRows.filter((r) => r.isEditable).map((r) => r.rowId)
    const currentRowIndex = editableRowIds.indexOf(row.rowId)

    switch (e.key) {
      case "Tab": {
        e.preventDefault()
        const nextPeriodIndex = e.shiftKey ? periodIndex - 1 : periodIndex + 1
        if (nextPeriodIndex >= 0 && nextPeriodIndex < periods.length) {
          setEditingCell({ rowId: row.rowId, periodId: periods[nextPeriodIndex].periodId, sourceType })
        } else if (!e.shiftKey && currentRowIndex < editableRowIds.length - 1) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex + 1], periodId: periods[0].periodId, sourceType })
        } else if (e.shiftKey && currentRowIndex > 0) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex - 1], periodId: periods[periods.length - 1].periodId, sourceType })
        }
        break
      }
      case "Enter": {
        e.preventDefault()
        const nextRowIndex = e.shiftKey ? currentRowIndex - 1 : currentRowIndex + 1
        if (nextRowIndex >= 0 && nextRowIndex < editableRowIds.length) {
          setEditingCell({ rowId: editableRowIds[nextRowIndex], periodId: periods[periodIndex].periodId, sourceType })
        }
        break
      }
      case "ArrowUp": {
        e.preventDefault()
        if (currentRowIndex > 0) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex - 1], periodId: periods[periodIndex].periodId, sourceType })
        }
        break
      }
      case "ArrowDown": {
        e.preventDefault()
        if (currentRowIndex < editableRowIds.length - 1) {
          setEditingCell({ rowId: editableRowIds[currentRowIndex + 1], periodId: periods[periodIndex].periodId, sourceType })
        }
        break
      }
      case "ArrowLeft": {
        if (inputRef.current?.selectionStart === 0) {
          e.preventDefault()
          if (periodIndex > 0) {
            setEditingCell({ rowId: row.rowId, periodId: periods[periodIndex - 1].periodId, sourceType })
          }
        }
        break
      }
      case "ArrowRight": {
        if (inputRef.current?.selectionStart === inputRef.current?.value.length) {
          e.preventDefault()
          if (periodIndex < periods.length - 1) {
            setEditingCell({ rowId: row.rowId, periodId: periods[periodIndex + 1].periodId, sourceType })
          }
        }
        break
      }
      case "Escape": {
        e.preventDefault()
        const cellKey = getCellKey(row.rowId, periods[periodIndex].periodId, sourceType)
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

  // 月の状態に応じた背景色を取得
  const getMonthStatusBgClass = (monthStatus: ActualMonthStatus, periodType: string): string => {
    // 集計列の背景色を優先
    if (periodType === "QUARTER") return "bg-muted/40"
    if (periodType === "HALF") return "bg-blue-50"
    if (periodType === "ANNUAL") return "bg-amber-50"

    // 月の状態に応じた背景色
    switch (monthStatus) {
      case "HARD_CLOSED":
        return "bg-gray-300" // 確定（濃いグレー）
      case "SOFT_CLOSED":
        return "bg-yellow-100" // 仮締め（黄色）
      case "OPEN":
        return "" // 入力中（白）
      case "FUTURE":
        return "bg-gray-100" // 未経過（薄いグレー）
      default:
        return ""
    }
  }

  // 月の状態ラベル
  const getMonthStatusLabel = (monthStatus: ActualMonthStatus): string => {
    switch (monthStatus) {
      case "HARD_CLOSED":
        return "確定"
      case "SOFT_CLOSED":
        return "仮締"
      case "OPEN":
        return "入力"
      case "FUTURE":
        return "未経過"
      default:
        return ""
    }
  }

  // セル表示コンポーネント
  const renderCell = (
    row: BffActualRow,
    cells: BffActualCell[],
    period: BffActualPeriodColumn,
    periodIndex: number,
    sourceType: SourceType,
    isSubRow: boolean = false
  ) => {
    const cellKey = getCellKey(row.rowId, period.periodId, sourceType)
    const cellState = cellStates[cellKey]
    const isEditing =
      editingCell?.rowId === row.rowId &&
      editingCell?.periodId === period.periodId &&
      editingCell?.sourceType === sourceType
    const cellValue = getCellValue(cells, row.rowId, period.periodId, sourceType)

    // 編集可能条件
    const canEdit =
      isEditable &&
      row.isEditable &&
      period.isEditable &&
      period.monthStatus !== "HARD_CLOSED" &&
      period.monthStatus !== "FUTURE" &&
      sourceType !== "INPUT" &&
      !(sourceType === "TOTAL" && showAdjustmentBreakdown)

    const isAggregate = row.subjectClass === "AGGREGATE"

    return (
      <TableCell
        key={`${period.periodId}-${sourceType}`}
        className={cn(
          "text-right p-0",
          isAggregate && "bg-muted/30",
          getMonthStatusBgClass(period.monthStatus, period.periodType),
          cellState?.error && "bg-destructive/10",
          isSubRow && "bg-opacity-50"
        )}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            value={cellValue}
            onChange={(e) => handleCellChange(row, period.periodId, e.target.value, sourceType)}
            onKeyDown={(e) => handleKeyDown(e, row, periodIndex, sourceType)}
            onBlur={() => setEditingCell(null)}
            className="h-8 text-right border-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        ) : (
          <div
            className={cn(
              "h-8 px-2 py-1 flex items-center justify-end gap-1",
              canEdit && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() => handleCellClick(row, period.periodId, sourceType)}
          >
            {cellState?.isSaving && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {cellState?.isSaved && <Check className="h-3 w-3 text-success" />}
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
            <span className={cn("font-mono text-sm", isSubRow && "text-muted-foreground")}>
              {formatAmount(cellValue)}
            </span>
          </div>
        )}
      </TableCell>
    )
  }

  // 科目列の表示
  const renderSubjectCell = (
    row: BffActualRow,
    isAggregate: boolean,
    label?: string
  ) => (
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
        {label ? (
          <>
            <span className="w-5" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </TableCell>
  )

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
                    !period.isOpen && "text-muted-foreground",
                    getMonthStatusBgClass(period.monthStatus, period.periodType),
                    period.isAggregate && "font-semibold",
                    period.periodType === "ANNUAL" && "font-bold"
                  )}
                >
                  <div className="flex flex-col items-end">
                    <span>{period.periodLabel}</span>
                    {period.periodType === "MONTH" && (
                      <span className="text-[10px] text-muted-foreground">
                        {getMonthStatusLabel(period.monthStatus)}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {localRows.map((row) => {
              const isAggregate = row.subjectClass === "AGGREGATE"
              const hasBreakdown = showAdjustmentBreakdown && row.inputRow && row.adjustRow

              return (
                <React.Fragment key={row.rowId}>
                  {/* メイン行（TOTAL） */}
                  <TableRow
                    className={cn(
                      isAggregate && "bg-muted/30 font-medium",
                      row.indentLevel > 0 && "text-sm"
                    )}
                  >
                    {renderSubjectCell(row, isAggregate)}
                    {periods.map((period, periodIndex) =>
                      renderCell(row, row.cells, period, periodIndex, "TOTAL")
                    )}
                  </TableRow>

                  {/* INPUT行（ERP取込値） */}
                  {hasBreakdown && row.inputRow && (
                    <TableRow className="bg-gray-50/50 text-sm">
                      {renderSubjectCell(row, isAggregate, "├ 取込")}
                      {periods.map((period, periodIndex) =>
                        renderCell(row, row.inputRow!.cells, period, periodIndex, "INPUT", true)
                      )}
                    </TableRow>
                  )}

                  {/* ADJUST行（調整値） */}
                  {hasBreakdown && row.adjustRow && (
                    <TableRow className="bg-amber-50/30 text-sm">
                      {renderSubjectCell(row, isAggregate, "└ 調整")}
                      {periods.map((period, periodIndex) =>
                        renderCell(row, row.adjustRow!.cells, period, periodIndex, "ADJUST", true)
                      )}
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

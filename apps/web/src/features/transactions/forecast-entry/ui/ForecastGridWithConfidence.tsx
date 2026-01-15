"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Loader2, Check, AlertCircle, BarChart3 } from "lucide-react"
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
  BffForecastRow,
  BffForecastPeriodColumn,
  BffForecastCell,
  BffAffectedRow,
} from "@epm/contracts/bff/forecast-entry"
import type { BffConfidenceLevel } from "@epm/contracts/bff/confidence-master"

// ============================================
// Types
// ============================================

interface CellPosition {
  rowId: string
  periodId: string
  confidenceLevelId?: string // 確度展開時
}

interface CellState {
  value: string
  isSaving: boolean
  isSaved: boolean
  error: string | null
}

// 確度管理拡張された行
interface ForecastRowWithConfidence extends BffForecastRow {
  isConfidenceEnabled?: boolean // 確度管理対象か
  isWnbEnabled?: boolean // W/N/B対象か
  confidenceRows?: ConfidenceRow[] // 確度別展開行
  summaryRow?: {
    totalCells: { periodId: string; value: string }[]
    expectedCells: { periodId: string; value: string }[]
    budgetCells: { periodId: string; value: string }[]
  }
}

interface ConfidenceRow {
  confidenceLevelId: string
  levelCode: string
  levelName: string
  probabilityRate: number
  colorCode: string
  cells: { periodId: string; value: string | null }[]
}

interface ForecastGridWithConfidenceProps {
  periods: BffForecastPeriodColumn[]
  rows: ForecastRowWithConfidence[]
  confidenceLevels: BffConfidenceLevel[]
  wnbStartPeriodNo: number | null // W/N/B開始月
  isEditable: boolean
  onCellChange: (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null,
    confidenceLevelId?: string
  ) => Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }>
  onToggleExpand: (rowId: string) => void
  onWnbClick?: (row: ForecastRowWithConfidence, periodId: string) => void
}

// ============================================
// Component
// ============================================

export function ForecastGridWithConfidence({
  periods,
  rows,
  confidenceLevels,
  wnbStartPeriodNo,
  isEditable,
  onCellChange,
  onToggleExpand,
  onWnbClick,
}: ForecastGridWithConfidenceProps) {
  const [editingCell, setEditingCell] = React.useState<CellPosition | null>(null)
  const [cellStates, setCellStates] = React.useState<Record<string, CellState>>({})
  const [localRows, setLocalRows] = React.useState<ForecastRowWithConfidence[]>(rows)
  const [expandedConfidenceRows, setExpandedConfidenceRows] = React.useState<Set<string>>(new Set())
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

  const getCellKey = (rowId: string, periodId: string, confidenceLevelId?: string) =>
    confidenceLevelId ? `${rowId}:${periodId}:${confidenceLevelId}` : `${rowId}:${periodId}`

  const toggleConfidenceExpand = (rowId: string) => {
    setExpandedConfidenceRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  // W/N/B対象月かどうか判定
  const isWnbPeriod = (period: BffForecastPeriodColumn): boolean => {
    if (!wnbStartPeriodNo) return false
    if (period.periodType !== "MONTH") return false
    // periodNo から月を取得（期間表記に依存）
    // ここでは periodLabel から月番号を推定
    const monthMap: Record<string, number> = {
      "4月": 4, "5月": 5, "6月": 6, "7月": 7, "8月": 8, "9月": 9,
      "10月": 10, "11月": 11, "12月": 12, "1月": 1, "2月": 2, "3月": 3,
    }
    const monthNo = monthMap[period.periodLabel]
    if (!monthNo) return false
    // 4月始まりを考慮したW/N/B開始判定
    const fiscalMonthOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
    const startIndex = fiscalMonthOrder.indexOf(wnbStartPeriodNo)
    const currentIndex = fiscalMonthOrder.indexOf(monthNo)
    return currentIndex >= startIndex
  }

  const handleCellClick = (
    row: ForecastRowWithConfidence,
    periodId: string,
    confidenceLevelId?: string
  ) => {
    if (!isEditable || !row.isEditable) return
    const period = periods.find((p) => p.periodId === periodId)
    if (!period?.isEditable) return
    if (period.monthStatus === "ACTUAL") return

    setEditingCell({ rowId: row.rowId, periodId, confidenceLevelId })
  }

  const handleCellChange = (
    row: ForecastRowWithConfidence,
    periodId: string,
    value: string,
    confidenceLevelId?: string
  ) => {
    const cellKey = getCellKey(row.rowId, periodId, confidenceLevelId)

    setCellStates((prev) => ({
      ...prev,
      [cellKey]: {
        value,
        isSaving: false,
        isSaved: false,
        error: null,
      },
    }))

    if (saveTimeoutRef.current[cellKey]) {
      clearTimeout(saveTimeoutRef.current[cellKey])
    }

    saveTimeoutRef.current[cellKey] = setTimeout(() => {
      handleSaveCell(row, periodId, value, confidenceLevelId)
    }, 500)
  }

  const handleSaveCell = async (
    row: ForecastRowWithConfidence,
    periodId: string,
    value: string,
    confidenceLevelId?: string
  ) => {
    const cellKey = getCellKey(row.rowId, periodId, confidenceLevelId)

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
      confidenceLevelId
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

  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return ""
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  const getMonthStatusBgClass = (monthStatus: string, periodType: string): string => {
    if (periodType === "QUARTER") return "bg-muted/40"
    if (periodType === "HALF") return "bg-blue-50"
    if (periodType === "ANNUAL") return "bg-amber-50"

    switch (monthStatus) {
      case "ACTUAL":
        return "bg-gray-200"
      case "CLOSING":
        return "bg-yellow-50"
      case "FORECAST":
      default:
        return ""
    }
  }

  const renderConfidenceRows = (row: ForecastRowWithConfidence) => {
    if (!row.isConfidenceEnabled || !expandedConfidenceRows.has(row.rowId)) {
      return null
    }

    const rows: React.ReactNode[] = []

    // 確度別行
    confidenceLevels.forEach((level) => {
      const confidenceRow = row.confidenceRows?.find(
        (cr) => cr.confidenceLevelId === level.id
      )

      rows.push(
        <TableRow key={`${row.rowId}-confidence-${level.id}`} className="bg-amber-50/30">
          <TableCell className="sticky left-0 z-20 bg-amber-50/30">
            <div className="flex items-center gap-2 pl-8">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: level.colorCode }}
              />
              <span className="text-sm">
                {level.levelCode}（{Math.round(level.probabilityRate * 100)}%）
              </span>
            </div>
          </TableCell>
          {periods.map((period) => {
            const cellValue =
              confidenceRow?.cells.find((c) => c.periodId === period.periodId)?.value ?? ""
            const cellKey = getCellKey(row.rowId, period.periodId, level.id)
            const cellState = cellStates[cellKey]
            const isEditing =
              editingCell?.rowId === row.rowId &&
              editingCell?.periodId === period.periodId &&
              editingCell?.confidenceLevelId === level.id
            const isCellEditable =
              isEditable &&
              row.isEditable &&
              period.isEditable &&
              period.monthStatus !== "ACTUAL"

            return (
              <TableCell
                key={period.periodId}
                className={cn(
                  "text-right p-0 bg-amber-50/30",
                  getMonthStatusBgClass(period.monthStatus, period.periodType),
                  cellState?.error && "bg-destructive/10"
                )}
              >
                {isEditing ? (
                  <Input
                    ref={inputRef}
                    type="text"
                    value={cellState?.value ?? cellValue}
                    onChange={(e) =>
                      handleCellChange(row, period.periodId, e.target.value, level.id)
                    }
                    onBlur={() => setEditingCell(null)}
                    className="h-8 text-right border-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                ) : (
                  <div
                    className={cn(
                      "h-8 px-2 py-1 flex items-center justify-end gap-1",
                      isCellEditable && "cursor-pointer hover:bg-amber-100/50"
                    )}
                    onClick={() => handleCellClick(row, period.periodId, level.id)}
                  >
                    {cellState?.isSaving && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                    {cellState?.isSaved && <Check className="h-3 w-3 text-success" />}
                    <span className="font-mono text-sm">{formatAmount(cellValue)}</span>
                  </div>
                )}
              </TableCell>
            )
          })}
        </TableRow>
      )
    })

    // サマリー行（合計・期待値・予算）
    if (row.summaryRow) {
      // 合計行
      rows.push(
        <TableRow key={`${row.rowId}-summary-total`} className="bg-amber-100/50">
          <TableCell className="sticky left-0 z-20 bg-amber-100/50">
            <div className="pl-8 text-sm font-medium">合計</div>
          </TableCell>
          {periods.map((period) => {
            const value =
              row.summaryRow?.totalCells.find((c) => c.periodId === period.periodId)?.value ?? ""
            return (
              <TableCell key={period.periodId} className="text-right p-0 bg-amber-100/50">
                <div className="h-8 px-2 py-1 flex items-center justify-end">
                  <span className="font-mono text-sm font-medium">{formatAmount(value)}</span>
                </div>
              </TableCell>
            )
          })}
        </TableRow>
      )

      // 期待値行
      rows.push(
        <TableRow key={`${row.rowId}-summary-expected`} className="bg-green-50/50">
          <TableCell className="sticky left-0 z-20 bg-green-50/50">
            <div className="pl-8 text-sm font-medium text-green-700">期待値</div>
          </TableCell>
          {periods.map((period) => {
            const value =
              row.summaryRow?.expectedCells.find((c) => c.periodId === period.periodId)?.value ?? ""
            return (
              <TableCell key={period.periodId} className="text-right p-0 bg-green-50/50">
                <div className="h-8 px-2 py-1 flex items-center justify-end">
                  <span className="font-mono text-sm font-medium text-green-700">
                    {formatAmount(value)}
                  </span>
                </div>
              </TableCell>
            )
          })}
        </TableRow>
      )

      // 予算行
      rows.push(
        <TableRow key={`${row.rowId}-summary-budget`} className="bg-muted/30">
          <TableCell className="sticky left-0 z-20 bg-muted/30">
            <div className="pl-8 text-sm text-muted-foreground">予算</div>
          </TableCell>
          {periods.map((period) => {
            const value =
              row.summaryRow?.budgetCells.find((c) => c.periodId === period.periodId)?.value ?? ""
            return (
              <TableCell key={period.periodId} className="text-right p-0 bg-muted/30">
                <div className="h-8 px-2 py-1 flex items-center justify-end">
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatAmount(value)}
                  </span>
                </div>
              </TableCell>
            )
          })}
        </TableRow>
      )
    }

    return rows
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[200px] sticky left-0 bg-muted z-30">科目</TableHead>
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
                        {period.monthStatus === "ACTUAL" && "確定"}
                        {period.monthStatus === "CLOSING" && "締中"}
                        {period.monthStatus === "FORECAST" && "見込"}
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
              const isConfidenceExpanded = expandedConfidenceRows.has(row.rowId)

              return (
                <React.Fragment key={row.rowId}>
                  <TableRow
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
                        {/* 確度管理対象の場合は展開アイコン */}
                        {row.isConfidenceEnabled ? (
                          <button
                            type="button"
                            onClick={() => toggleConfidenceExpand(row.rowId)}
                            className="p-0.5 hover:bg-amber-100 rounded"
                          >
                            {isConfidenceExpanded ? (
                              <ChevronDown className="h-4 w-4 text-amber-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-amber-600" />
                            )}
                          </button>
                        ) : row.isExpandable ? (
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
                        {/* 確度管理バッジ */}
                        {row.isConfidenceEnabled && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded">
                            確度
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {periods.map((period) => {
                      const cellKey = getCellKey(row.rowId, period.periodId)
                      const cellState = cellStates[cellKey]
                      const cell = row.cells.find((c) => c.periodId === period.periodId)
                      const isEditing =
                        editingCell?.rowId === row.rowId &&
                        editingCell?.periodId === period.periodId &&
                        !editingCell?.confidenceLevelId
                      const cellValue = cellState?.value ?? cell?.value ?? ""
                      const isCellEditable =
                        isEditable &&
                        row.isEditable &&
                        period.isEditable &&
                        period.monthStatus !== "ACTUAL" &&
                        !row.isConfidenceEnabled // 確度管理対象は親行は編集不可

                      // W/N/B アイコン表示判定
                      const showWnbIcon =
                        row.isWnbEnabled &&
                        isWnbPeriod(period) &&
                        !row.isConfidenceEnabled // 確度管理対象はW/N/Bアイコン非表示

                      return (
                        <TableCell
                          key={period.periodId}
                          className={cn(
                            "text-right p-0",
                            isAggregate && "bg-muted/30",
                            getMonthStatusBgClass(period.monthStatus, period.periodType),
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
                              onBlur={() => setEditingCell(null)}
                              className="h-8 text-right border-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          ) : (
                            <div
                              className={cn(
                                "h-8 px-2 py-1 flex items-center justify-end gap-1",
                                isCellEditable && "cursor-pointer hover:bg-muted/50"
                              )}
                              onClick={() => {
                                if (isCellEditable) {
                                  handleCellClick(row, period.periodId)
                                }
                              }}
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
                              <span className="font-mono text-sm">{formatAmount(cellValue)}</span>
                              {/* W/N/B アイコン */}
                              {showWnbIcon && onWnbClick && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onWnbClick(row, period.periodId)
                                      }}
                                      className="p-0.5 hover:bg-blue-100 rounded"
                                    >
                                      <BarChart3 className="h-3 w-3 text-blue-500" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>W/N/B入力</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>

                  {/* 確度展開行 */}
                  {renderConfidenceRows(row)}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

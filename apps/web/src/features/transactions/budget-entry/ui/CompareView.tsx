"use client"

import * as React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import type {
  BffBudgetCompareRow,
  BffPeriodColumn,
} from "@epm/contracts/bff/budget-entry"

// ============================================
// Types
// ============================================

interface CompareViewProps {
  periods: BffPeriodColumn[]
  rows: BffBudgetCompareRow[]
  baseVersionName: string
  currentVersionName: string
  onToggleExpand: (rowId: string) => void
}

// ============================================
// Component
// ============================================

export function CompareView({
  periods,
  rows,
  baseVersionName,
  currentVersionName,
  onToggleExpand,
}: CompareViewProps) {
  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  const formatVariance = (value: string | null, isPositive: boolean): string => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    if (num === 0) return "0"
    const prefix = isPositive ? "+" : ""
    return `${prefix}${num.toLocaleString("ja-JP")}`
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              rowSpan={2}
              className="w-[200px] sticky left-0 bg-muted/50 z-10 border-r"
            >
              科目
            </TableHead>
            {periods.map((period) => (
              <TableHead
                key={period.periodId}
                colSpan={3}
                className="text-center border-l"
              >
                {period.periodLabel}
              </TableHead>
            ))}
            <TableHead colSpan={3} className="text-center border-l bg-muted/30">
              年計
            </TableHead>
          </TableRow>
          <TableRow className="bg-muted/30">
            {periods.map((period) => (
              <React.Fragment key={period.periodId}>
                <TableHead className="text-right text-xs w-[80px] border-l">
                  {baseVersionName}
                </TableHead>
                <TableHead className="text-right text-xs w-[80px]">
                  {currentVersionName}
                </TableHead>
                <TableHead className="text-right text-xs w-[80px]">差異</TableHead>
              </React.Fragment>
            ))}
            <TableHead className="text-right text-xs w-[80px] border-l">
              {baseVersionName}
            </TableHead>
            <TableHead className="text-right text-xs w-[80px]">
              {currentVersionName}
            </TableHead>
            <TableHead className="text-right text-xs w-[80px]">差異</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isAggregate = row.subjectClass === "AGGREGATE"

            // Calculate annual totals for base and current
            const baseAnnualTotal = row.baseCells.reduce((sum, cell) => {
              const val = parseFloat(cell.value ?? "0") || 0
              return sum + val
            }, 0)
            const currentAnnualTotal = row.currentCells.reduce((sum, cell) => {
              const val = parseFloat(cell.value ?? "0") || 0
              return sum + val
            }, 0)
            const annualVariance = currentAnnualTotal - baseAnnualTotal

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
                    "sticky left-0 bg-background z-10 border-r",
                    isAggregate && "bg-muted/30"
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

                {periods.map((period, index) => {
                  const baseCell = row.baseCells.find(
                    (c) => c.periodId === period.periodId
                  )
                  const currentCell = row.currentCells.find(
                    (c) => c.periodId === period.periodId
                  )
                  const varianceCell = row.varianceCells.find(
                    (c) => c.periodId === period.periodId
                  )

                  return (
                    <React.Fragment key={period.periodId}>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm border-l",
                          isAggregate && "bg-muted/30"
                        )}
                      >
                        {formatAmount(baseCell?.value ?? null)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm",
                          isAggregate && "bg-muted/30"
                        )}
                      >
                        {formatAmount(currentCell?.value ?? null)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm",
                          isAggregate && "bg-muted/30",
                          varianceCell?.isPositive
                            ? "text-info"
                            : varianceCell?.value && parseFloat(varianceCell.value) < 0
                            ? "text-destructive"
                            : ""
                        )}
                      >
                        {formatVariance(
                          varianceCell?.value ?? null,
                          varianceCell?.isPositive ?? true
                        )}
                      </TableCell>
                    </React.Fragment>
                  )
                })}

                {/* Annual totals */}
                <TableCell
                  className={cn(
                    "text-right font-mono text-sm font-semibold border-l bg-muted/20",
                    isAggregate && "bg-muted/40"
                  )}
                >
                  {formatAmount(String(baseAnnualTotal))}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-sm font-semibold bg-muted/20",
                    isAggregate && "bg-muted/40"
                  )}
                >
                  {formatAmount(String(currentAnnualTotal))}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-sm font-semibold bg-muted/20",
                    isAggregate && "bg-muted/40",
                    annualVariance > 0
                      ? "text-info"
                      : annualVariance < 0
                      ? "text-destructive"
                      : ""
                  )}
                >
                  {formatVariance(
                    String(annualVariance),
                    annualVariance >= 0
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

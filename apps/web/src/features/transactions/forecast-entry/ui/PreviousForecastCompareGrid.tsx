"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import { Loader2 } from "lucide-react"
import type {
  BffForecastPreviousCompareResponse,
  BffForecastPeriodColumn,
} from "@epm/contracts/bff/forecast-entry"

// ============================================
// Types
// ============================================

interface PreviousForecastCompareGridProps {
  data: BffForecastPreviousCompareResponse | null
  loading: boolean
}

// ============================================
// Component
// ============================================

export function PreviousForecastCompareGrid({ data, loading }: PreviousForecastCompareGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  const getMonthStatusBgClass = (period: BffForecastPeriodColumn): string => {
    if (period.periodType === "QUARTER") return "bg-muted/40"
    if (period.periodType === "HALF") return "bg-blue-50"
    if (period.periodType === "ANNUAL") return "bg-amber-50"

    switch (period.monthStatus) {
      case "ACTUAL":
        return "bg-gray-100"
      case "CLOSING":
        return "bg-yellow-50"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            前回見込対比 - {data.context.currentVersionName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            前回: {data.context.previousVersionName}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              {/* 第1行: 期間ヘッダー */}
              <TableRow className="bg-muted">
                <TableHead
                  className="w-[200px] sticky left-0 bg-muted z-30"
                  rowSpan={2}
                >
                  科目
                </TableHead>
                {data.periods.map((period) => (
                  <TableHead
                    key={period.periodId}
                    colSpan={3}
                    className={cn(
                      "text-center border-l",
                      getMonthStatusBgClass(period)
                    )}
                  >
                    {period.periodLabel}
                  </TableHead>
                ))}
              </TableRow>
              {/* 第2行: 今回/前回/差異 */}
              <TableRow className="bg-muted/70">
                {data.periods.map((period) => (
                  <React.Fragment key={period.periodId}>
                    <TableHead className="text-right text-xs w-[70px] border-l">
                      今回
                    </TableHead>
                    <TableHead className="text-right text-xs w-[70px]">
                      前回
                    </TableHead>
                    <TableHead className="text-right text-xs w-[70px]">
                      差異
                    </TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => {
                const isAggregate = row.subjectClass === "AGGREGATE"

                return (
                  <TableRow
                    key={row.rowId}
                    className={cn(
                      isAggregate && "bg-muted/30 font-medium"
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
                        <span className={cn(isAggregate && "text-muted-foreground")}>
                          {isAggregate ? `【${row.subjectName}】` : row.subjectName}
                        </span>
                      </div>
                    </TableCell>

                    {data.periods.map((period, periodIndex) => {
                      const currentCell = row.currentCells[periodIndex]
                      const previousCell = row.previousCells[periodIndex]
                      const varianceCell = row.varianceCells[periodIndex]

                      return (
                        <React.Fragment key={period.periodId}>
                          {/* 今回見込 */}
                          <TableCell
                            className={cn(
                              "text-right p-1 border-l font-mono text-sm",
                              getMonthStatusBgClass(period)
                            )}
                          >
                            {formatAmount(currentCell?.value)}
                          </TableCell>
                          {/* 前回見込 */}
                          <TableCell
                            className={cn(
                              "text-right p-1 font-mono text-sm text-muted-foreground",
                              getMonthStatusBgClass(period)
                            )}
                          >
                            {formatAmount(previousCell?.value)}
                          </TableCell>
                          {/* 差異 */}
                          <TableCell
                            className={cn(
                              "text-right p-1 font-mono text-sm",
                              getMonthStatusBgClass(period),
                              varianceCell?.isPositive
                                ? "text-success"
                                : "text-destructive"
                            )}
                          >
                            {varianceCell?.isPositive && "+"}
                            {formatAmount(varianceCell?.value)}
                          </TableCell>
                        </React.Fragment>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

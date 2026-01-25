"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import type {
  BffHistoricalCompareResponse,
  BffHistoricalCompareRow,
  BffPeriodColumn,
} from "@epm/contracts/bff/budget-entry"

interface HistoricalCompareGridProps {
  data: BffHistoricalCompareResponse | null
  loading: boolean
}

export function HistoricalCompareGrid({ data, loading }: HistoricalCompareGridProps) {
  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  const formatVariance = (value: string | null, isPositive: boolean): React.ReactNode => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    const formatted = num.toLocaleString("ja-JP")
    const prefix = num > 0 ? "+" : ""
    return (
      <span className={cn(isPositive ? "text-success" : "text-destructive")}>
        {prefix}{formatted}
      </span>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">過去実績との比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">過去実績との比較</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            比較データがありません
          </p>
        </CardContent>
      </Card>
    )
  }

  // 期間ヘッダースタイルを取得
  const getPeriodHeaderStyle = (period: BffPeriodColumn) => {
    if (period.periodType === "QUARTER") return "bg-muted/60 font-semibold"
    if (period.periodType === "HALF") return "bg-blue-100/70 font-semibold"
    if (period.periodType === "ANNUAL") return "bg-amber-100/70 font-bold"
    return "bg-muted/30"
  }

  // 月グループ化レイアウト: 4月予算,4月実績,4月差異,5月予算...
  const renderTableHeader = (periods: BffPeriodColumn[]) => (
    <>
      {/* 1段目: 期間グループヘッダー */}
      <tr className="border-b bg-muted">
        <th
          rowSpan={2}
          className="sticky left-0 z-30 min-w-[180px] border-r bg-muted p-3 text-left font-medium"
        >
          科目
        </th>
        {periods.map((period) => (
          <th
            key={period.periodId}
            colSpan={3}
            className={cn(
              "border-r p-1.5 text-center text-xs font-medium",
              getPeriodHeaderStyle(period)
            )}
          >
            {period.periodLabel}
          </th>
        ))}
      </tr>
      {/* 2段目: 予算/実績/差異 ラベル */}
      <tr className="border-b bg-muted/20">
        {periods.map((period) => (
          <React.Fragment key={period.periodId}>
            <th className="min-w-[55px] border-r p-1 text-right text-[10px] font-medium bg-blue-50/50">
              予算
            </th>
            <th className="min-w-[55px] border-r p-1 text-right text-[10px] font-medium bg-gray-50/50">
              実績
            </th>
            <th className="min-w-[55px] border-r p-1 text-right text-[10px] font-medium bg-amber-50/50">
              差異
            </th>
          </React.Fragment>
        ))}
      </tr>
    </>
  )

  const renderTableRow = (row: BffHistoricalCompareRow, periods: BffPeriodColumn[]) => {
    const isAggregate = row.subjectClass === "AGGREGATE"

    return (
      <tr
        key={row.rowId}
        className={cn(
          "border-b hover:bg-muted/30",
          isAggregate && "bg-muted/20"
        )}
      >
        {/* 科目名 */}
        <td
          className={cn(
            "sticky left-0 z-20 border-r p-2 font-medium whitespace-nowrap",
            isAggregate ? "bg-gray-100 font-semibold" : "bg-white"
          )}
        >
          {isAggregate ? `【${row.subjectName}】` : row.subjectName}
        </td>
        {/* 期間ごとに 予算・実績・差異 を横並び */}
        {periods.map((period, idx) => {
          const currentCell = row.currentCells[idx]
          const historicalCell = row.historicalCells[idx]
          const varianceCell = row.varianceCells[idx]
          const isAggPeriod = period.periodType !== "MONTH"

          return (
            <React.Fragment key={period.periodId}>
              {/* 予算 */}
              <td
                className={cn(
                  "border-r p-1 text-right tabular-nums text-xs",
                  isAggPeriod ? "bg-blue-50/70" : "bg-blue-50/20",
                  isAggregate && "font-medium"
                )}
              >
                {formatAmount(currentCell?.value ?? null)}
              </td>
              {/* 実績 */}
              <td
                className={cn(
                  "border-r p-1 text-right tabular-nums text-xs",
                  isAggPeriod ? "bg-gray-50/70" : "bg-gray-50/20",
                  isAggregate && "font-medium"
                )}
              >
                {formatAmount(historicalCell?.value ?? null)}
              </td>
              {/* 差異 */}
              <td
                className={cn(
                  "border-r p-1 text-right tabular-nums text-xs",
                  isAggPeriod ? "bg-amber-50/70" : "bg-amber-50/20",
                  isAggregate && "font-medium"
                )}
              >
                {varianceCell ? formatVariance(varianceCell.value, varianceCell.isPositive) : "-"}
              </td>
            </React.Fragment>
          )
        })}
      </tr>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            過去実績との比較
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.context.departmentName} / {data.context.fiscalYear}年度予算 vs {data.context.compareFiscalYear}年度実績
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>{renderTableHeader(data.periods)}</thead>
            <tbody>{data.rows.map((row) => renderTableRow(row, data.periods))}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

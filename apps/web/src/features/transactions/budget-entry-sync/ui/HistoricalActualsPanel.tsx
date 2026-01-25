"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
} from "@/shared/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import type {
  BffHistoricalActualResponse,
  BffHistoricalActualRow,
  BffPeriodColumn,
} from "@epm/contracts/bff/budget-entry"

interface HistoricalActualsPanelProps {
  data: BffHistoricalActualResponse | null
  loading: boolean
  selectedSubjectIds?: string[]
  // 予算グリッドと同じ期間列定義を使用（列位置を揃えるため）
  periods?: BffPeriodColumn[]
}

export function HistoricalActualsPanel({
  data,
  loading,
  selectedSubjectIds,
  periods: externalPeriods,
}: HistoricalActualsPanelProps) {
  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return "-"
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  if (loading) {
    return (
      <Card className="border-gray-200/50">
        <CardHeader className="py-2 px-4 bg-gray-50/30">
          <CardTitle className="text-sm font-medium text-gray-700">過去実績</CardTitle>
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
      <Card className="border-gray-200/50">
        <CardHeader className="py-2 px-4 bg-gray-50/30">
          <CardTitle className="text-sm font-medium text-gray-700">過去実績</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            過去実績データがありません
          </p>
        </CardContent>
      </Card>
    )
  }

  // 予算グリッドと同じ期間列を使用（渡されている場合）
  const periods = externalPeriods || data.periods

  // 科目フィルターが適用されている場合
  const filteredRows = selectedSubjectIds && selectedSubjectIds.length > 0
    ? data.rows.filter(row => selectedSubjectIds.includes(row.subjectId))
    : data.rows

  // 期間IDから金額を取得するヘルパー
  const getPeriodValue = (row: BffHistoricalActualRow, fiscalYear: number, periodId: string): string | null => {
    const yearData = row.fiscalYearAmounts.find(ya => ya.fiscalYear === fiscalYear)
    if (!yearData) return null
    const periodData = yearData.periodAmounts.find(p => p.periodId === periodId)
    return periodData?.value ?? null
  }

  const renderYearTable = (fiscalYear: number) => (
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
                period.isAggregate && "bg-muted/40 font-semibold",
                period.periodType === "HALF" && "bg-gray-100/70 font-semibold",
                period.periodType === "ANNUAL" && "bg-gray-200/70 font-bold"
              )}
            >
              {period.periodLabel}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRows.map((row) => {
          const isAggregate = row.subjectClass === "AGGREGATE"

          return (
            <TableRow
              key={`${row.subjectId}-${fiscalYear}`}
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
                {isAggregate ? `【${row.subjectName}】` : row.subjectName}
              </TableCell>
              {periods.map((period) => (
                <TableCell
                  key={period.periodId}
                  className={cn(
                    "text-right tabular-nums",
                    isAggregate && "bg-muted/30",
                    period.isAggregate && "bg-muted/20",
                    period.periodType === "HALF" && "bg-gray-50/50",
                    period.periodType === "ANNUAL" && "bg-gray-100/50"
                  )}
                >
                  <span className="font-mono text-sm">
                    {formatAmount(getPeriodValue(row, fiscalYear, period.periodId))}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  return (
    <Accordion type="multiple" defaultValue={data.fiscalYears.map(y => `fy-${y}`)}>
      {data.fiscalYears.map((fiscalYear) => (
        <AccordionItem key={fiscalYear} value={`fy-${fiscalYear}`} className="border-0">
          <Card className="border-gray-200/50 mb-2">
            <AccordionTrigger className="px-4 py-2 hover:no-underline bg-gray-50/30 rounded-t-lg [&[data-state=open]]:rounded-b-none">
              <CardTitle className="text-sm font-medium text-gray-700">
                実績 ({fiscalYear}年度)
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-0">
                <div className="border rounded-b-lg overflow-hidden">
                  {renderYearTable(fiscalYear)}
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

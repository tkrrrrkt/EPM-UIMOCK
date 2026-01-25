"use client"

import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui"
import { formatAmount } from "../utils/format"
import { cn } from "@/lib/utils"
import type { BffMtpTrendResponse } from "@epm/contracts/bff/mtp"

interface TrendTableProps {
  data: BffMtpTrendResponse
}

export function TrendTable({ data }: TrendTableProps) {
  // Group amounts by fiscal year
  const fiscalYears = Array.from(new Set(data.tableData[0]?.amounts.map((a) => a.fiscalYear) || [])).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>推移表</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-card font-semibold">科目</TableHead>
                {fiscalYears.map((year) => (
                  <TableHead key={year} className="text-right font-semibold">
                    FY{year}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-card"></TableHead>
                {fiscalYears.map((year) => {
                  const isActual = data.tableData[0]?.amounts.find((a) => a.fiscalYear === year)?.isActual
                  return (
                    <TableHead key={`${year}-type`} className="text-right text-xs text-muted-foreground">
                      {isActual ? "実績" : "計画"}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tableData.map((row) => (
                <TableRow key={row.subjectId}>
                  <TableCell className="sticky left-0 z-10 bg-card font-medium">{row.subjectName}</TableCell>
                  {fiscalYears.map((year) => {
                    const amount = row.amounts.find((a) => a.fiscalYear === year)
                    const isActual = amount?.isActual || false
                    return (
                      <TableCell
                        key={`${row.subjectId}-${year}`}
                        className={cn("text-right tabular-nums", isActual && "bg-muted text-muted-foreground")}
                      >
                        {amount ? formatAmount(amount.amount) : "-"}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

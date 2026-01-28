"use client"

// ============================================================
// ReportTable - Main report table component
// ============================================================

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  ScrollArea,
  Skeleton,
} from "@/shared/ui"
import type { BffReportRow } from "@epm/contracts/bff/indicator-report"
import { ReportRow } from "./ReportRow"

interface ReportTableProps {
  rows: BffReportRow[]
  showCompare: boolean
  primaryLabel: string
  compareLabel?: string
  isLoading?: boolean
}

export function ReportTable({
  rows,
  showCompare,
  primaryLabel,
  compareLabel,
  isLoading = false,
}: ReportTableProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 overflow-hidden">
      <ScrollArea className="h-full max-h-[calc(100vh-420px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/30 z-10">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="w-[40%] min-w-48 text-foreground font-semibold">
                項目名
              </TableHead>
              {showCompare ? (
                <>
                  <TableHead className="w-[15%] text-right text-foreground font-semibold">
                    {primaryLabel}
                  </TableHead>
                  <TableHead className="w-[15%] text-right text-foreground font-semibold">
                    {compareLabel || "Compare"}
                  </TableHead>
                  <TableHead className="w-[15%] text-right text-foreground font-semibold">
                    差分
                  </TableHead>
                  <TableHead className="w-[15%] text-right text-foreground font-semibold">
                    差分率
                  </TableHead>
                </>
              ) : (
                <TableHead className="w-[60%] text-right text-foreground font-semibold">
                  {primaryLabel}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ReportRow key={row.lineId} row={row} showCompare={showCompare} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

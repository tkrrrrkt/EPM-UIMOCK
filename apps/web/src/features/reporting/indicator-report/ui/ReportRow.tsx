"use client"

// ============================================================
// ReportRow - Render individual row based on line type
// ============================================================

import { cn } from "@/lib/utils"
import { TableCell, TableRow, Separator } from "@/shared/ui"
import type { BffReportRow } from "@epm/contracts/bff/indicator-report"

interface ReportRowProps {
  row: BffReportRow
  showCompare: boolean
}

// Indent class mapping
const indentClasses: Record<number, string> = {
  0: "",
  1: "pl-4",
  2: "pl-8",
  3: "pl-12",
}

// Format number based on unit
function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return "-"

  if (unit === "円") {
    return value.toLocaleString("ja-JP")
  }
  if (unit === "%" || unit === "pt") {
    return value.toFixed(1)
  }
  if (unit === "人") {
    return value.toLocaleString("ja-JP")
  }
  // Default: 2 decimal places
  return value.toFixed(2)
}

// Format difference value with sign
function formatDifference(value: number | null, unit: string | null): string {
  if (value === null) return "-"

  const formatted = formatValue(Math.abs(value), unit)
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${formatted}`
}

// Format difference rate
function formatDifferenceRate(rate: number | null): string {
  if (rate === null) return "-"
  const sign = rate > 0 ? "+" : ""
  return `${sign}${rate.toFixed(1)}%`
}

// Get color class for difference
function getDifferenceColorClass(value: number | null): string {
  if (value === null || value === 0) return "text-muted-foreground"
  if (value > 0) return "text-success"
  return "text-destructive"
}

function getRateBarWidth(rate: number | null): number {
  if (rate === null) return 0
  return Math.min(Math.abs(rate), 100)
}

export function ReportRow({ row, showCompare }: ReportRowProps) {
  const {
    lineType,
    displayName,
    indentLevel,
    isBold,
    primaryValue,
    compareValue,
    differenceValue,
    differenceRate,
    unit,
  } = row

  const indentClass = indentClasses[indentLevel] || ""
  const fontClass = isBold ? "font-semibold" : "font-normal"

  // Blank row
  if (lineType === "blank") {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={showCompare ? 5 : 2} className="h-6" />
      </TableRow>
    )
  }

  // Divider row
  if (lineType === "divider") {
    if (displayName) {
      // Divider with total text
      return (
        <TableRow className="border-t-2 border-border bg-muted/30 hover:bg-muted/40">
          <TableCell className={cn("py-2", fontClass, indentClass)}>
            {displayName}
          </TableCell>
          {showCompare ? (
            <>
              <TableCell className={cn("text-right", fontClass)}>
                {formatValue(primaryValue, unit)}
              </TableCell>
              <TableCell className={cn("text-right", fontClass)}>
                {formatValue(compareValue, unit)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  fontClass,
                  getDifferenceColorClass(differenceValue)
                )}
              >
                {formatDifference(differenceValue, unit)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  fontClass,
                  getDifferenceColorClass(differenceRate)
                )}
              >
                <div className="flex flex-col items-end gap-1">
                  <span>{formatDifferenceRate(differenceRate)}</span>
                  {differenceRate !== null && (
                    <div className="h-1 w-20 rounded-full bg-muted/40">
                      <div
                        className={cn(
                          "h-1 rounded-full",
                          differenceRate > 0 ? "bg-success" : "bg-destructive"
                        )}
                        style={{ width: `${getRateBarWidth(differenceRate)}%` }}
                      />
                    </div>
                  )}
                </div>
              </TableCell>
            </>
          ) : (
            <TableCell className={cn("text-right", fontClass)}>
              {formatValue(primaryValue, unit)}
            </TableCell>
          )}
        </TableRow>
      )
    }
    // Simple divider line
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={showCompare ? 5 : 2} className="py-1 px-0">
          <Separator className="bg-border" />
        </TableCell>
      </TableRow>
    )
  }

  // Header row
  if (lineType === "header") {
    return (
      <TableRow className="bg-primary/5 hover:bg-primary/10">
        <TableCell
          className={cn("py-2 text-foreground", fontClass, indentClass)}
        >
          {displayName}
        </TableCell>
        <TableCell colSpan={showCompare ? 4 : 1} />
      </TableRow>
    )
  }

  // Note row
  if (lineType === "note") {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={showCompare ? 5 : 2}
          className="py-1 text-xs text-muted-foreground italic"
        >
          {displayName}
        </TableCell>
      </TableRow>
    )
  }

  // Item row (default)
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className={cn("py-2", fontClass, indentClass)}>
        {displayName}
      </TableCell>
      {showCompare ? (
        <>
          <TableCell className={cn("text-right tabular-nums", fontClass)}>
            {formatValue(primaryValue, unit)}
            {unit && primaryValue !== null && (
              <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
            )}
          </TableCell>
          <TableCell className={cn("text-right tabular-nums", fontClass)}>
            {formatValue(compareValue, unit)}
            {unit && compareValue !== null && (
              <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
            )}
          </TableCell>
          <TableCell
            className={cn(
              "text-right tabular-nums",
              fontClass,
              getDifferenceColorClass(differenceValue)
            )}
          >
            {formatDifference(differenceValue, unit)}
          </TableCell>
          <TableCell
            className={cn(
              "text-right tabular-nums",
              fontClass,
              getDifferenceColorClass(differenceRate)
            )}
          >
            <div className="flex flex-col items-end gap-1">
              <span>{formatDifferenceRate(differenceRate)}</span>
              {differenceRate !== null && (
                <div className="h-1 w-20 rounded-full bg-muted/40">
                  <div
                    className={cn(
                      "h-1 rounded-full",
                      differenceRate > 0 ? "bg-success" : "bg-destructive"
                    )}
                    style={{ width: `${getRateBarWidth(differenceRate)}%` }}
                  />
                </div>
              )}
            </div>
          </TableCell>
        </>
      ) : (
        <TableCell className={cn("text-right tabular-nums", fontClass)}>
          {formatValue(primaryValue, unit)}
          {unit && primaryValue !== null && (
            <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
          )}
        </TableCell>
      )}
    </TableRow>
  )
}

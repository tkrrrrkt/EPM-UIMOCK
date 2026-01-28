"use client"

// ============================================================
// ReportSummaryCards - Executive summary cards & insights
// ============================================================

import { TrendingDown, TrendingUp, Sparkles } from "lucide-react"
import { Badge, Card, CardContent } from "@/shared/ui"
import type { BffReportRow } from "@epm/contracts/bff/indicator-report"
import { cn } from "@/lib/utils"

interface ReportSummaryCardsProps {
  rows: BffReportRow[]
  showCompare: boolean
  primaryLabel: string
  compareLabel?: string
}

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return "-"
  if (unit === "円") return value.toLocaleString("ja-JP")
  if (unit === "%" || unit === "pt") return value.toFixed(1)
  if (unit === "人") return value.toLocaleString("ja-JP")
  return value.toFixed(2)
}

function pickSummaryRows(rows: BffReportRow[]): BffReportRow[] {
  const items = rows.filter(
    (row) =>
      row.lineType === "item" &&
      row.displayName &&
      row.primaryValue !== null
  )
  const top = items.filter((row) => row.indentLevel === 0).slice(0, 4)
  if (top.length >= 4) return top
  const rest = items.filter((row) => !top.includes(row)).slice(0, 4 - top.length)
  return [...top, ...rest]
}

export function ReportSummaryCards({
  rows,
  showCompare,
  primaryLabel,
  compareLabel,
}: ReportSummaryCardsProps) {
  const summaryRows = pickSummaryRows(rows)
  const diffRows = rows.filter(
    (row) => row.lineType === "item" && row.differenceRate !== null
  )
  const negativeRows = diffRows.filter((row) => (row.differenceRate ?? 0) < 0)
  const positiveRows = diffRows.filter((row) => (row.differenceRate ?? 0) > 0)
  const worstRow = [...diffRows].sort(
    (a, b) => (a.differenceRate ?? 0) - (b.differenceRate ?? 0)
  )[0]
  const bestRow = [...diffRows].sort(
    (a, b) => (b.differenceRate ?? 0) - (a.differenceRate ?? 0)
  )[0]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryRows.map((row) => {
          const diff = row.differenceRate ?? null
          const diffColor =
            diff === null
              ? "text-muted-foreground"
              : diff > 0
                ? "text-success"
                : diff < 0
                  ? "text-destructive"
                  : "text-muted-foreground"

          return (
            <Card key={row.lineId} className="border-border/60">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{row.displayName}</div>
                <div className="mt-2 text-2xl font-bold tabular-nums">
                  {formatValue(row.primaryValue, row.unit)}
                  {row.unit && row.primaryValue !== null && (
                    <span className="ml-1 text-xs text-muted-foreground">{row.unit}</span>
                  )}
                </div>
                {showCompare && diff !== null && (
                  <div className={cn("mt-1 flex items-center gap-2 text-xs", diffColor)}>
                    {diff >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {primaryLabel} vs {compareLabel || "比較"}: {diff >= 0 ? "+" : ""}
                      {diff.toFixed(1)}%
                    </span>
                  </div>
                )}
                {!showCompare && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    比較なし
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            ハイライト
          </div>
          {showCompare ? (
            <>
              <Badge variant="secondary" className="text-xs">
                改善 {positiveRows.length}件
              </Badge>
              <Badge variant="outline" className="text-xs">
                悪化 {negativeRows.length}件
              </Badge>
              {bestRow && (
                <span className="text-xs text-muted-foreground">
                  最良: {bestRow.displayName} {bestRow.differenceRate?.toFixed(1)}%
                </span>
              )}
              {worstRow && (
                <span className="text-xs text-muted-foreground">
                  最悪: {worstRow.displayName} {worstRow.differenceRate?.toFixed(1)}%
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              比較設定を有効にすると改善・悪化のハイライトが表示されます
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

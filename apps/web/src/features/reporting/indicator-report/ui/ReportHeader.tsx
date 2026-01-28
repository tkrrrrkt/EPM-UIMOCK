"use client"

// ============================================================
// ReportHeader - Display report name and header text
// ============================================================

import { Badge } from "@/shared/ui"

interface ReportHeaderProps {
  layoutName: string
  headerText: string | null
  fiscalYear: number | null
  periodLabel: string | null
  granularityLabel: string | null
  departmentName: string | null
  includeChildren: boolean
  primaryLabel: string
  compareEnabled: boolean
  compareLabel?: string
}

export function ReportHeader({
  layoutName,
  headerText,
  fiscalYear,
  periodLabel,
  granularityLabel,
  departmentName,
  includeChildren,
  primaryLabel,
  compareEnabled,
  compareLabel,
}: ReportHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{layoutName}</h2>
          {headerText && (
            <p className="text-sm text-muted-foreground">{headerText}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {fiscalYear && <Badge variant="outline">{fiscalYear}年度</Badge>}
          {periodLabel && <Badge variant="secondary">{periodLabel}</Badge>}
          {granularityLabel && (
            <Badge variant="outline">{granularityLabel}</Badge>
          )}
          {departmentName && (
            <Badge variant="outline">
              {departmentName}
              {includeChildren ? "（配下含む）" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Primary: {primaryLabel}</span>
        {compareEnabled && compareLabel && (
          <>
            <span>•</span>
            <span>Compare: {compareLabel}</span>
          </>
        )}
      </div>
    </div>
  )
}

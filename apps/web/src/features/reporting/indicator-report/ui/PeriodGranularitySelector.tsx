"use client"

// ============================================================
// PeriodGranularitySelector - Period range and granularity selector
// ============================================================

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
} from "@/shared/ui"
import { DisplayGranularity } from "@epm/contracts/bff/indicator-report"

interface PeriodGranularitySelectorProps {
  fiscalYear: number | null
  startPeriod: string | null
  endPeriod: string | null
  onStartPeriodChange: (period: string) => void
  onEndPeriodChange: (period: string) => void
  granularity: DisplayGranularity | null
  onGranularityChange: (granularity: DisplayGranularity) => void
}

const granularityLabels: Record<DisplayGranularity, string> = {
  MONTHLY: "月次",
  QUARTERLY: "四半期",
  HALF_YEARLY: "半期",
  YEARLY: "年度",
}

// Generate period codes for a fiscal year
function generatePeriodCodes(fiscalYear: number | null): string[] {
  if (!fiscalYear) return []
  return Array.from({ length: 12 }, (_, i) => {
    const period = String(i + 1).padStart(2, "0")
    return `FY${fiscalYear}-P${period}`
  })
}

// Get period label
function getPeriodLabel(periodCode: string): string {
  const match = periodCode.match(/P(\d{2})$/)
  if (!match) return periodCode
  return `${Number(match[1])}月`
}

export function PeriodGranularitySelector({
  fiscalYear,
  startPeriod,
  endPeriod,
  onStartPeriodChange,
  onEndPeriodChange,
  granularity,
  onGranularityChange,
}: PeriodGranularitySelectorProps) {
  const periodCodes = generatePeriodCodes(fiscalYear)

  return (
    <Card className="border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Start Period */}
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">期間（開始）</Label>
          <Select
            value={startPeriod || ""}
            onValueChange={onStartPeriodChange}
            disabled={!fiscalYear}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {periodCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {getPeriodLabel(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground pb-2">〜</span>

        {/* End Period */}
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">期間（終了）</Label>
          <Select
            value={endPeriod || ""}
            onValueChange={onEndPeriodChange}
            disabled={!fiscalYear}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {periodCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {getPeriodLabel(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Granularity */}
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">表示粒度</Label>
          <Select
            value={granularity || ""}
            onValueChange={(v) => onGranularityChange(v as DisplayGranularity)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(granularityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { Download, RefreshCw } from "lucide-react"
import { Button } from "@/shared/ui/components/button"
import { Label } from "@/shared/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"

export type ComparisonMode = "budget" | "previous" | "priorYear"

export function ReportHeader({
  comparisonMode = "budget",
  onComparisonModeChange,
  fiscalYear = 2024,
  onFiscalYearChange,
  onExport,
  onRefresh,
}: {
  comparisonMode?: ComparisonMode
  onComparisonModeChange?: (mode: ComparisonMode) => void
  fiscalYear?: number
  onFiscalYearChange?: (year: number) => void
  onExport?: () => void
  onRefresh?: () => void
}) {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-foreground">業績レポート</h1>

          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fiscal-year" className="text-xs text-muted-foreground">
                年度
              </Label>
              <Select
                value={String(fiscalYear)}
                onValueChange={(v) => onFiscalYearChange?.(Number(v))}
              >
                <SelectTrigger id="fiscal-year" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}年度
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="comparison-mode" className="text-xs text-muted-foreground">
                比較モード
              </Label>
              <Select
                value={comparisonMode}
                onValueChange={(v) => onComparisonModeChange?.(v as ComparisonMode)}
              >
                <SelectTrigger id="comparison-mode" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">予算 vs 実績+見込</SelectItem>
                  <SelectItem value="previous">今回見込 vs 前回見込</SelectItem>
                  <SelectItem value="priorYear">当年 vs 前年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            更新
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </div>
    </header>
  )
}

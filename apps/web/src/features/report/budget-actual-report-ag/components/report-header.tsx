"use client"

import { CalendarDays, RefreshCcw, Settings } from "lucide-react"
import { Button } from "@/shared/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"

export type ComparisonMode = "budget" | "previous" | "priorYear"

interface ReportHeaderProps {
  comparisonMode: ComparisonMode
  onComparisonModeChange: (mode: ComparisonMode) => void
}

export function ReportHeader({ comparisonMode, onComparisonModeChange }: ReportHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">業績レポート</h1>
              <p className="text-sm text-muted-foreground mt-0.5">AG Grid 版サンプル</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 年度選択 */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="2024">
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="年度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024年度</SelectItem>
                  <SelectItem value="2023">2023年度</SelectItem>
                  <SelectItem value="2022">2022年度</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 比較モード選択 */}
            <Select
              value={comparisonMode}
              onValueChange={(v) => onComparisonModeChange(v as ComparisonMode)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="比較モード" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">予算 vs 実績+見込</SelectItem>
                <SelectItem value="previous">今回 vs 前回見込</SelectItem>
                <SelectItem value="priorYear">当年 vs 前年</SelectItem>
              </SelectContent>
            </Select>

            {/* アクションボタン */}
            <Button variant="outline" size="icon" className="h-9 w-9">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

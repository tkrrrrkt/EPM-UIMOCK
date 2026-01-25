"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card"
import { Button } from "@/shared/ui/components/button"
import { Badge } from "@/shared/ui/components/badge"
import type { BffForecastSummary, BffMonthlyAchievement } from "@epm/contracts/bff/forecast-entry"

// ============================================
// Types
// ============================================

interface AchievementRatePanelProps {
  summary: BffForecastSummary
  showMonthlyDetails?: boolean
  onToggleMonthlyDetails?: () => void
}

// ============================================
// Helper Functions
// ============================================

function formatAmount(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  // 万単位に変換
  if (Math.abs(num) >= 10000) {
    return `${(num / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万`
  }
  return num.toLocaleString("ja-JP")
}

function getAchievementColor(rate: number): string {
  if (rate >= 100) return "text-success"
  if (rate >= 90) return "text-amber-600"
  return "text-destructive"
}

function getAchievementBadgeVariant(rate: number): "default" | "secondary" | "destructive" | "outline" {
  if (rate >= 100) return "default"
  if (rate >= 90) return "secondary"
  return "destructive"
}

function getAchievementIcon(rate: number) {
  if (rate >= 100) return <TrendingUp className="h-4 w-4" />
  if (rate >= 90) return <Minus className="h-4 w-4" />
  return <TrendingDown className="h-4 w-4" />
}

// ============================================
// Component
// ============================================

export function AchievementRatePanel({
  summary,
  showMonthlyDetails = false,
  onToggleMonthlyDetails,
}: AchievementRatePanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            達成率・通期見通し
          </CardTitle>
          {summary.monthlyAchievement && summary.monthlyAchievement.length > 0 && onToggleMonthlyDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMonthlyDetails}
              className="h-7 text-xs"
            >
              {showMonthlyDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  月次詳細を閉じる
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  月次詳細を表示
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 通期サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 通期達成率 */}
          <div className="col-span-2 md:col-span-1 bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">通期達成率</div>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-bold", getAchievementColor(summary.achievementRate))}>
                {summary.achievementRate.toFixed(1)}%
              </span>
              <Badge variant={getAchievementBadgeVariant(summary.achievementRate)} className="gap-1">
                {getAchievementIcon(summary.achievementRate)}
              </Badge>
            </div>
          </div>

          {/* 年初来実績 */}
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">年初来実績</div>
            <div className="text-lg font-semibold">
              {formatAmount(summary.ytdActual)}
            </div>
          </div>

          {/* 残期間見込 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">残期間見込</div>
            <div className="text-lg font-semibold text-blue-700">
              {formatAmount(summary.remainingForecast)}
            </div>
          </div>

          {/* 通期見通し */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">通期見通し</div>
            <div className="text-lg font-semibold text-green-700">
              {formatAmount(summary.fullYearForecast)}
            </div>
          </div>

          {/* 通期予算 */}
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">通期予算</div>
            <div className="text-lg font-semibold text-amber-700">
              {formatAmount(summary.fullYearBudget)}
            </div>
          </div>
        </div>

        {/* 月次達成率詳細 */}
        {showMonthlyDetails && summary.monthlyAchievement && summary.monthlyAchievement.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-xs text-muted-foreground mb-2">月次達成率（確定月のみ）</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">月</th>
                    {summary.monthlyAchievement.map((m) => (
                      <th key={m.periodId} className="text-right py-2 px-3 font-medium">
                        {m.periodLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">累計達成率</td>
                    {summary.monthlyAchievement.map((m) => (
                      <td
                        key={m.periodId}
                        className={cn("text-right py-2 px-3 font-medium", getAchievementColor(m.cumulative))}
                      >
                        {m.cumulative.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-muted-foreground">単月達成率</td>
                    {summary.monthlyAchievement.map((m) => (
                      <td
                        key={m.periodId}
                        className={cn("text-right py-2 px-3 font-medium", getAchievementColor(m.monthly))}
                      >
                        {m.monthly.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

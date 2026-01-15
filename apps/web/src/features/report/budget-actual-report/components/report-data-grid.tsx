"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown, Percent } from "lucide-react"
import { Button } from "@/shared/ui/components/button"
import type { ComparisonMode } from "./report-header"

interface ReportDataGridProps {
  organizationId: string | null
  comparisonMode: ComparisonMode
}

interface DataRow {
  id: string
  accountName: string
  isParent?: boolean
  children?: DataRow[]
  data: {
    budget: number[]
    actualForecast: number[]
    prevForecast: number[]
  }
}

const mockData: DataRow[] = [
  {
    id: "revenue",
    accountName: "売上高",
    isParent: true,
    data: {
      budget: [10000, 11000, 10500, 12000, 11500, 13000, 12500, 11000, 10500, 11500, 12000, 13500],
      actualForecast: [9800, 10500, 10200, 11800, 11200, 12800, 0, 0, 0, 0, 0, 0],
      prevForecast: [9500, 10200, 9900, 11500, 10800, 12300, 12000, 10500, 10000, 11000, 11500, 13000],
    },
    children: [
      {
        id: "product-sales",
        accountName: "製品売上",
        data: {
          budget: [7000, 7700, 7350, 8400, 8050, 9100, 8750, 7700, 7350, 8050, 8400, 9450],
          actualForecast: [6860, 7350, 7140, 8260, 7840, 8960, 0, 0, 0, 0, 0, 0],
          prevForecast: [6650, 7140, 6930, 8050, 7560, 8610, 8400, 7350, 7000, 7700, 8050, 9100],
        },
      },
      {
        id: "service-sales",
        accountName: "サービス売上",
        data: {
          budget: [3000, 3300, 3150, 3600, 3450, 3900, 3750, 3300, 3150, 3450, 3600, 4050],
          actualForecast: [2940, 3150, 3060, 3540, 3360, 3840, 0, 0, 0, 0, 0, 0],
          prevForecast: [2850, 3060, 2970, 3450, 3240, 3690, 3600, 3150, 3000, 3300, 3450, 3900],
        },
      },
    ],
  },
  {
    id: "cogs",
    accountName: "売上原価",
    isParent: true,
    data: {
      budget: [4000, 4400, 4200, 4800, 4600, 5200, 5000, 4400, 4200, 4600, 4800, 5400],
      actualForecast: [3920, 4200, 4080, 4720, 4480, 5120, 0, 0, 0, 0, 0, 0],
      prevForecast: [3800, 4080, 3960, 4600, 4320, 4920, 4800, 4200, 4000, 4400, 4600, 5200],
    },
  },
  {
    id: "sga",
    accountName: "販管費",
    isParent: true,
    data: {
      budget: [3000, 3300, 3150, 3600, 3450, 3900, 3750, 3300, 3150, 3450, 3600, 4050],
      actualForecast: [2940, 3150, 3060, 3540, 3360, 3840, 0, 0, 0, 0, 0, 0],
      prevForecast: [2850, 3060, 2970, 3450, 3240, 3690, 3600, 3150, 3000, 3300, 3450, 3900],
    },
    children: [
      {
        id: "personnel",
        accountName: "人件費",
        data: {
          budget: [2000, 2200, 2100, 2400, 2300, 2600, 2500, 2200, 2100, 2300, 2400, 2700],
          actualForecast: [1960, 2100, 2040, 2360, 2240, 2560, 0, 0, 0, 0, 0, 0],
          prevForecast: [1900, 2040, 1980, 2300, 2160, 2460, 2400, 2100, 2000, 2200, 2300, 2600],
        },
      },
      {
        id: "rent",
        accountName: "地代家賃",
        data: {
          budget: [500, 550, 525, 600, 575, 650, 625, 550, 525, 575, 600, 675],
          actualForecast: [490, 525, 510, 590, 560, 640, 0, 0, 0, 0, 0, 0],
          prevForecast: [475, 510, 495, 575, 540, 615, 600, 525, 500, 550, 575, 650],
        },
      },
    ],
  },
]

const periods = [
  { key: "M01", label: "1月" },
  { key: "M02", label: "2月" },
  { key: "M03", label: "3月" },
  { key: "M04", label: "4月" },
  { key: "M05", label: "5月" },
  { key: "M06", label: "6月" },
  { key: "M07", label: "7月" },
  { key: "M08", label: "8月" },
  { key: "M09", label: "9月" },
  { key: "M10", label: "10月" },
  { key: "M11", label: "11月" },
  { key: "M12", label: "12月" },
]

function formatNumber(num: number): string {
  return new Intl.NumberFormat("ja-JP").format(num)
}

function formatVariance(num: number): string {
  const formatted = formatNumber(Math.abs(num))
  return num >= 0 ? `+${formatted}` : `-${formatted}`
}

interface RowComponentProps {
  row: DataRow
  level: number
  currentMonth: number
  comparisonMode: ComparisonMode
  showRates: boolean
}

function RowComponent({ row, level, currentMonth, comparisonMode, showRates }: RowComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <tr className={cn("group hover:bg-muted/50", row.isParent && "bg-muted/30")}>
        <td
          className="sticky left-0 z-10 border-r border-b border-border bg-card group-hover:bg-muted/50 px-2 py-1.5"
          style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="shrink-0 hover:text-foreground text-muted-foreground"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}
            <span className={cn("text-sm truncate", row.isParent && "font-medium")}>{row.accountName}</span>
          </div>
        </td>

        {periods.map((period, idx) => {
          const budgetValue = row.data.budget[idx]
          const actualValue = row.data.actualForecast[idx] > 0 ? row.data.actualForecast[idx] : row.data.budget[idx]
          const variance = actualValue - budgetValue
          const varianceRate = budgetValue !== 0 ? (variance / budgetValue) * 100 : 0

          return (
            <React.Fragment key={`${period.key}-cells`}>
              {/* Budget */}
              <td className="border-r border-b border-border px-1.5 py-1.5 text-right text-sm tabular-nums whitespace-nowrap">
                {formatNumber(budgetValue)}
              </td>

              {/* Actual + Forecast */}
              <td
                className={cn(
                  "border-r border-b border-border px-1.5 py-1.5 text-right text-sm tabular-nums whitespace-nowrap",
                  idx < currentMonth ? "" : "text-muted-foreground"
                )}
              >
                {actualValue > 0 ? formatNumber(actualValue) : "-"}
              </td>

              {/* Variance */}
              <td
                className={cn(
                  "border-r border-b border-border px-1.5 py-1.5 text-right text-sm tabular-nums whitespace-nowrap",
                  variance >= 0 ? "text-emerald-600" : "text-destructive"
                )}
              >
                {formatVariance(variance)}
              </td>

              {/* Variance % (optional) */}
              {showRates && (
                <td
                  className={cn(
                    "border-r border-b border-border px-1.5 py-1.5 text-right text-xs tabular-nums whitespace-nowrap",
                    varianceRate >= 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {varianceRate.toFixed(1)}%
                </td>
              )}
            </React.Fragment>
          )
        })}
      </tr>

      {hasChildren &&
        isExpanded &&
        row.children!.map((child) => (
          <RowComponent
            key={child.id}
            row={child}
            level={level + 1}
            currentMonth={currentMonth}
            comparisonMode={comparisonMode}
            showRates={showRates}
          />
        ))}
    </>
  )
}

export function ReportDataGrid({ organizationId, comparisonMode }: ReportDataGridProps) {
  const currentMonth = 6
  const [showRates, setShowRates] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Summary Cards */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-start gap-4 mb-0">
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">通期予算</div>
              <div className="text-xl font-semibold tabular-nums">¥138,000</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">実績+見込</div>
              <div className="text-xl font-semibold tabular-nums">¥135,520</div>
              <div className="text-xs text-destructive mt-1">-1.8%</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">前回見込</div>
              <div className="text-xl font-semibold tabular-nums">¥133,160</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">前回比</div>
              <div className="text-xl font-semibold text-emerald-600 tabular-nums">+¥2,360</div>
              <div className="text-xs text-emerald-600 mt-1">+1.8%</div>
            </div>
          </div>

          <Button
            variant={showRates ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRates(!showRates)}
            className="shrink-0 gap-2"
          >
            <Percent className="h-4 w-4" />
            率表示
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <table className="border-collapse table-fixed min-w-max">
          <colgroup>
            <col className="w-[180px]" />
            {periods.map((period) => (
              <React.Fragment key={period.key}>
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                {showRates && <col className="w-[50px]" />}
              </React.Fragment>
            ))}
          </colgroup>
          <thead>
            <tr className="sticky top-0 z-20 bg-card h-9">
              <th className="sticky left-0 z-30 border-r border-b border-border bg-card px-3 text-left font-medium text-xs text-muted-foreground">
                科目
              </th>

              {periods.map((period) => (
                <th
                  key={period.key}
                  colSpan={showRates ? 4 : 3}
                  className="border-r border-b border-border bg-card px-2 text-center font-medium text-xs"
                >
                  {period.label}
                </th>
              ))}
            </tr>

            <tr className="sticky top-9 z-20 bg-card h-7">
              <th className="sticky left-0 z-30 border-r border-b border-border bg-card" />

              {periods.map((period) => (
                <React.Fragment key={`${period.key}-sub`}>
                  <th className="border-r border-b border-border bg-card px-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                    予算
                  </th>
                  <th className="border-r border-b border-border bg-card px-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                    実績
                  </th>
                  <th className={cn(
                    "border-b border-border bg-card px-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap",
                    showRates ? "border-r" : "border-r"
                  )}>
                    差異
                  </th>
                  {showRates && (
                    <th className="border-r border-b border-border bg-card px-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                      %
                    </th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {mockData.map((row) => (
              <RowComponent
                key={row.id}
                row={row}
                level={0}
                currentMonth={currentMonth}
                comparisonMode={comparisonMode}
                showRates={showRates}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

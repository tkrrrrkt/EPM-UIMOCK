"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { cn } from "@/lib/utils"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffVarianceReportFilters, BffVarianceWaterfallItem } from "@epm/contracts/bff/variance-report"

interface VarianceWaterfallChartProps {
  filters: BffVarianceReportFilters
  selectedOrgId: string
}

interface ProcessedItem extends BffVarianceWaterfallItem {
  start: number
  end: number
  cumulative: number
}

export function VarianceWaterfallChart({ filters, selectedOrgId }: VarianceWaterfallChartProps) {
  const client = useBffClient()
  const [chartData, setChartData] = useState<ProcessedItem[]>([])
  const [summary, setSummary] = useState({ budget: 0, actual: 0, variance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await client.getWaterfallData(filters, selectedOrgId)

        // Calculate cumulative values and positions for waterfall chart
        let cumulative = response.startValue
        const processed: ProcessedItem[] = response.items.map((item) => {
          const start = cumulative
          cumulative += item.variance
          const end = cumulative

          return { ...item, start, end, cumulative }
        })

        setChartData(processed)
        setSummary({
          budget: response.startValue,
          actual: response.endValue,
          variance: response.totalVariance,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [client, filters, selectedOrgId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(
    summary.budget,
    summary.actual,
    ...chartData.map((d) => Math.max(Math.abs(d.start), Math.abs(d.end)))
  )
  const chartHeight = 500

  const getBarColor = (item: ProcessedItem) => {
    return item.isPositive ? "bg-positive" : "bg-negative"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>科目別差異分析</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-muted-foreground">
            <div className="text-right pr-2">¥{Math.round(maxValue * 1.2).toLocaleString()}M</div>
            <div className="text-right pr-2">¥{Math.round(maxValue * 0.6).toLocaleString()}M</div>
            <div className="text-right pr-2">¥0M</div>
          </div>

          {/* Chart Area */}
          <div className="ml-24 relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-t border-border/30" />
              <div className="border-t border-border/30" />
              <div className="border-t border-border" />
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around pb-16 gap-2">
              {chartData.map((item, index) => {
                const height = (Math.abs(item.variance) / (maxValue * 1.2)) * 100
                const bottom = (Math.min(item.start, item.end) / (maxValue * 1.2)) * 100

                return (
                  <div key={item.subjectId} className="flex flex-col items-center flex-1">
                    {/* Value label */}
                    <div
                      className={cn(
                        "text-xs font-semibold mb-1",
                        item.isPositive ? "text-positive" : "text-negative"
                      )}
                    >
                      {item.variance > 0 && "+"}¥{item.variance.toLocaleString()}M
                    </div>

                    {/* Bar container */}
                    <div className="relative w-full" style={{ height: chartHeight - 100 }}>
                      {/* Connector line */}
                      {index < chartData.length - 1 && (
                        <div
                          className="absolute border-t-2 border-dashed border-muted-foreground/30"
                          style={{
                            top: `${100 - (item.cumulative / (maxValue * 1.2)) * 100}%`,
                            left: "50%",
                            width: "100%",
                          }}
                        />
                      )}

                      {/* Bar */}
                      <div
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 w-full max-w-[200px] rounded transition-all hover:opacity-80",
                          getBarColor(item)
                        )}
                        style={{
                          height: `${height}%`,
                          bottom: `${bottom}%`,
                        }}
                      />
                    </div>

                    {/* Label */}
                    <div
                      className="text-xs text-center text-muted-foreground mt-2 leading-tight"
                      style={{ maxWidth: 200 }}
                    >
                      {item.subjectName}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 flex justify-between items-center p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">予算</div>
            <div className="text-xl font-bold text-budget">¥{summary.budget.toLocaleString()}M</div>
          </div>
          <div className="text-2xl text-muted-foreground">→</div>
          <div>
            <div className="text-sm text-muted-foreground">実績+見込</div>
            <div className="text-xl font-bold text-forecast">
              ¥{summary.actual.toLocaleString()}M
            </div>
          </div>
          <div className="text-2xl text-muted-foreground">=</div>
          <div>
            <div className="text-sm text-muted-foreground">差異合計</div>
            <div
              className={cn(
                "text-xl font-bold",
                summary.variance >= 0 ? "text-positive" : "text-negative"
              )}
            >
              {summary.variance > 0 && "+"}¥{summary.variance.toLocaleString()}M
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

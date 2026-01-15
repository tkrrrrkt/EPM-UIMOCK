"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffScenarioReportFilters, BffScenarioComparisonMonth } from "@epm/contracts/bff/scenario-report"

interface ScenarioComparisonProps {
  filters: BffScenarioReportFilters
  selectedOrgId: string
}

export function ScenarioComparison({ filters, selectedOrgId }: ScenarioComparisonProps) {
  const client = useBffClient()
  const [months, setMonths] = useState<BffScenarioComparisonMonth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await client.getComparison(filters, selectedOrgId)
        setMonths(response.months)
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

  const maxValue = Math.max(...months.map((m) => m.best ?? 0))
  const minValue = Math.min(...months.map((m) => m.worst ?? 0))
  const chartHeight = 500
  const padding = { top: 40, right: 40, bottom: 60, left: 80 }

  const getX = (index: number, width: number) => {
    const innerWidth = width - padding.left - padding.right
    return padding.left + (index / (months.length - 1)) * innerWidth
  }

  const getY = (value: number) => {
    const innerHeight = chartHeight - padding.top - padding.bottom
    return padding.top + innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
  }

  const createPath = (values: number[], width: number) => {
    return values
      .map((value, index) => {
        const x = getX(index, width)
        const y = getY(value)
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  const generateAreaPath = (width: number) => {
    const bestValues = months.map((m) => m.best ?? m.normal)
    const worstValues = months.map((m) => m.worst ?? m.normal)

    const topPath = bestValues
      .map((value, index) => `${index === 0 ? "M" : "L"} ${getX(index, width)} ${getY(value)}`)
      .join(" ")
    const bottomPath = worstValues
      .map(
        (value, index) =>
          `L ${getX(worstValues.length - 1 - index, width)} ${getY(worstValues[worstValues.length - 1 - index])}`
      )
      .reverse()
      .join(" ")
    return `${topPath} ${bottomPath} Z`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>3シナリオ推移とブレ幅</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 1400 ${chartHeight}`}
            className="w-full min-w-[1000px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Area fill for range */}
            <path d={generateAreaPath(1400)} fill="hsl(var(--muted))" opacity="0.3" />

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const innerHeight = chartHeight - padding.top - padding.bottom
              const y = padding.top + innerHeight * (1 - ratio)
              const value = Math.round(minValue + (maxValue - minValue) * ratio)
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={1400 - padding.right}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 15}
                    y={y + 5}
                    textAnchor="end"
                    fontSize="14"
                    fill="hsl(var(--muted-foreground))"
                  >
                    ¥{value}M
                  </text>
                </g>
              )
            })}

            {/* Worst line */}
            <path
              d={createPath(
                months.map((m) => m.worst ?? m.normal),
                1400
              )}
              fill="none"
              stroke="hsl(var(--scenario-worst))"
              strokeWidth="2.5"
            />

            {/* Normal line */}
            <path
              d={createPath(
                months.map((m) => m.normal),
                1400
              )}
              fill="none"
              stroke="hsl(var(--scenario-normal))"
              strokeWidth="3.5"
            />

            {/* Best line */}
            <path
              d={createPath(
                months.map((m) => m.best ?? m.normal),
                1400
              )}
              fill="none"
              stroke="hsl(var(--scenario-best))"
              strokeWidth="2.5"
            />

            {/* Data points */}
            {months.map((m, index) => (
              <g key={m.monthNo}>
                <circle
                  cx={getX(index, 1400)}
                  cy={getY(m.worst ?? m.normal)}
                  r="4"
                  fill="hsl(var(--scenario-worst))"
                />
                <circle
                  cx={getX(index, 1400)}
                  cy={getY(m.normal)}
                  r="5"
                  fill="hsl(var(--scenario-normal))"
                />
                <circle
                  cx={getX(index, 1400)}
                  cy={getY(m.best ?? m.normal)}
                  r="4"
                  fill="hsl(var(--scenario-best))"
                />
              </g>
            ))}

            {/* Month labels */}
            {months.map((m, index) => (
              <text
                key={m.monthNo}
                x={getX(index, 1400)}
                y={chartHeight - padding.bottom + 25}
                textAnchor="middle"
                fontSize="14"
                fill="hsl(var(--foreground))"
                fontWeight="500"
              >
                {m.month}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t">
          <div className="flex items-center gap-2">
            <div className="w-10 h-0.5 bg-scenario-worst rounded" />
            <span className="text-sm font-medium">ワーストケース</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-scenario-normal rounded" />
            <span className="text-sm font-semibold">ノーマル（計画）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-0.5 bg-scenario-best rounded" />
            <span className="text-sm font-medium">ベストケース</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-4 bg-muted opacity-30 rounded" />
            <span className="text-sm font-medium">ブレ幅（リスク/機会）</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

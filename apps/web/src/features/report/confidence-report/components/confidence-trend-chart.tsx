"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type {
  BffConfidenceReportFilters,
  BffConfidenceTrendMonth,
  BffConfidenceLevelInfo,
} from "@epm/contracts/bff/confidence-report"

interface ConfidenceTrendChartProps {
  filters: BffConfidenceReportFilters
  selectedOrgId: string
}

export function ConfidenceTrendChart({ filters, selectedOrgId }: ConfidenceTrendChartProps) {
  const client = useBffClient()
  const [months, setMonths] = useState<BffConfidenceTrendMonth[]>([])
  const [confidenceLevels, setConfidenceLevels] = useState<BffConfidenceLevelInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrend() {
      setLoading(true)
      try {
        const response = await client.getTrend(filters, selectedOrgId)
        setMonths(response.months)
        setConfidenceLevels(response.confidenceLevels)
      } finally {
        setLoading(false)
      }
    }
    fetchTrend()
  }, [client, filters, selectedOrgId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  // 確度レベルの色（逆順：Z→S）
  const levelColors: Record<string, string> = {
    Z: "hsl(var(--confidence-z))",
    D: "hsl(var(--confidence-d))",
    C: "hsl(var(--confidence-c))",
    B: "hsl(var(--confidence-b))",
    A: "hsl(var(--confidence-a))",
    S: "hsl(var(--confidence-s))",
  }

  const maxValue = Math.max(
    ...months.map((d) => d.S + d.A + d.B + d.C + d.D + d.Z)
  )

  const chartHeight = 350
  const padding = { top: 20, right: 30, bottom: 40, left: 50 }
  const innerHeight = chartHeight - padding.top - padding.bottom

  return (
    <Card>
      <CardHeader>
        <CardTitle>確度推移グラフ（積み上げ面グラフ）</CardTitle>
        <p className="text-sm text-muted-foreground">
          Zランク（目安なし）が徐々に確度の高いランクへ移行する様子を可視化
        </p>
      </CardHeader>
      <CardContent>
        {/* 凡例 */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {confidenceLevels.map((level) => (
            <div key={level.code} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: levelColors[level.code] }}
              />
              <span className="text-xs text-muted-foreground">{level.name}</span>
            </div>
          ))}
        </div>

        {/* SVGチャート */}
        <div className="relative w-full" style={{ height: chartHeight }}>
          <svg className="h-full w-full" viewBox={`0 0 900 ${chartHeight}`}>
            {/* Y軸グリッド線 */}
            {[0, 200, 400, 600, 800].map((value, i) => (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={padding.top + innerHeight - (i * innerHeight) / 4}
                  x2={900 - padding.right}
                  y2={padding.top + innerHeight - (i * innerHeight) / 4}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={padding.top + innerHeight - (i * innerHeight) / 4 + 4}
                  fill="hsl(var(--muted-foreground))"
                  fontSize="12"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            ))}

            {/* 積み上げ面グラフ */}
            {(() => {
              const xStep = (900 - padding.left - padding.right) / (months.length - 1)
              const yScale = innerHeight / maxValue

              const levels = ["Z", "D", "C", "B", "A", "S"]
              const getY = (monthIndex: number, upToLevel: string) => {
                const month = months[monthIndex]
                let sum = 0
                for (const level of levels) {
                  sum += month[level as keyof BffConfidenceTrendMonth] as number
                  if (level === upToLevel) break
                }
                return padding.top + innerHeight - sum * yScale
              }

              return levels.map((level, levelIndex) => {
                const topPath = months
                  .map((_, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${getY(i, level)}`)
                  .join(" ")

                const prevLevel = levelIndex > 0 ? levels[levelIndex - 1] : null
                const bottomPath = prevLevel
                  ? [...months]
                      .map((_, i) => `L ${padding.left + (months.length - 1 - i) * xStep} ${getY(months.length - 1 - i, prevLevel)}`)
                      .join(" ")
                  : `L ${padding.left + (months.length - 1) * xStep} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight}`

                return (
                  <path
                    key={level}
                    d={`${topPath} ${bottomPath} Z`}
                    fill={levelColors[level]}
                    opacity="0.8"
                  />
                )
              })
            })()}

            {/* X軸ラベル */}
            {months.map((m, i) => (
              <text
                key={i}
                x={padding.left + i * ((900 - padding.left - padding.right) / (months.length - 1))}
                y={chartHeight - 10}
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
                textAnchor="middle"
              >
                {m.month}
              </text>
            ))}
          </svg>
        </div>

        {/* インサイト */}
        <div className="mt-4 rounded-lg bg-accent p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">推移の傾向：</span>
            Zランク（目安なし）が4月の400Mから10月の60Mまで減少し、S・Aランクの高確度案件が増加しています。
            期末に向けて案件の確度が順調に上昇していることが確認できます。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

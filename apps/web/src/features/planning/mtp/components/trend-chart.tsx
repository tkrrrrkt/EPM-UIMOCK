"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { BffMtpTrendResponse } from "@epm/contracts/bff/mtp"

interface TrendChartProps {
  data: BffMtpTrendResponse
}

export function TrendChart({ data }: TrendChartProps) {
  const yearMap = new Map<number, { year: string; actual?: number; plan?: number }>()

  // Collect all fiscal years from data points
  data.dataPoints.forEach((point) => {
    const yearKey = point.fiscalYear
    if (!yearMap.has(yearKey)) {
      yearMap.set(yearKey, { year: `FY${yearKey}` })
    }
  })

  // Populate actual and plan values
  data.dataPoints.forEach((point) => {
    const yearKey = point.fiscalYear
    const amount = point.amount / 100000000 // Convert to 億円
    const entry = yearMap.get(yearKey)!

    if (point.isActual) {
      entry.actual = amount
    } else {
      entry.plan = amount
    }
  })

  // Sort by year
  const chartData = Array.from(yearMap.values()).sort(
    (a, b) => Number.parseInt(a.year.replace("FY", "")) - Number.parseInt(b.year.replace("FY", "")),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>推移グラフ</CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.subject.subjectName} {data.dimensionValue ? `(${data.dimensionValue.valueName})` : "(全社)"}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" style={{ fontSize: "12px" }} stroke="hsl(var(--foreground))" />
            <YAxis
              style={{ fontSize: "12px" }}
              stroke="hsl(var(--foreground))"
              label={{
                value: "億円",
                angle: -90,
                position: "insideLeft",
                style: { fill: "hsl(var(--foreground))" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number | undefined) =>
                value !== undefined ? [`${value.toFixed(1)}億円`, ""] : ["-", ""]
              }
            />
            <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="実績" radius={[4, 4, 0, 0]} />
            <Bar dataKey="plan" fill="hsl(var(--chart-2))" name="計画" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

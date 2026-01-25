"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/ui"
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart as LineChartIcon, Building2, Globe, Target } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts"
import { MockBffClient } from "../api/mock-bff-client"
import { cn } from "@/lib/utils"
import type { BffGuidelineEventDetailResponse, BffTrendResponse } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

type ChartType = "bar" | "line" | "composed"

interface TrendTabProps {
  eventId: string
  event: BffGuidelineEventDetailResponse
}

export function TrendTab({ eventId, event }: TrendTabProps) {
  const [trendData, setTrendData] = useState<BffTrendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("subj-001")
  const [selectedDimensionValueId, setSelectedDimensionValueId] = useState<string | undefined>(undefined)
  const [chartType, setChartType] = useState<ChartType>("composed")
  const { toast } = useToast()

  useEffect(() => {
    loadTrend()
  }, [eventId, selectedSubjectId, selectedDimensionValueId])

  async function loadTrend() {
    try {
      setLoading(true)
      const data = await bffClient.getTrend(eventId, {
        subjectId: selectedSubjectId,
        dimensionValueId: selectedDimensionValueId,
      })
      setTrendData(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "推移データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // チャートデータを生成
  const chartData = useMemo(() => {
    if (!trendData) return []

    const yearMap = new Map<number, { year: string; fiscalYear: number; actual?: number; guideline?: number; growth?: number }>()

    trendData.dataPoints.forEach((point) => {
      const yearKey = point.fiscalYear
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, { year: `FY${yearKey}`, fiscalYear: yearKey })
      }
      const entry = yearMap.get(yearKey)!
      const amount = Number(point.amount) / 100000000 // 億円換算

      if (point.isActual) {
        entry.actual = amount
      } else {
        entry.guideline = amount
      }
    })

    const data = Array.from(yearMap.values()).sort((a, b) => a.fiscalYear - b.fiscalYear)

    // 前年比成長率を計算
    for (let i = 1; i < data.length; i++) {
      const current = data[i].actual || data[i].guideline || 0
      const prev = data[i - 1].actual || data[i - 1].guideline || 0
      if (prev > 0) {
        data[i].growth = ((current - prev) / prev) * 100
      }
    }

    return data
  }, [trendData])

  // KPIカード用の計算
  const kpiMetrics = useMemo(() => {
    if (!chartData.length) return null

    const latestActual = chartData.filter(d => d.actual !== undefined).pop()
    const guidelineData = chartData.find(d => d.guideline !== undefined)

    // 5年実績平均
    const actualValues = chartData.filter(d => d.actual !== undefined).map(d => d.actual!)
    const avgActual = actualValues.length > 0 ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length : 0

    // 実績からガイドラインへの成長率
    const guidelineGrowth = latestActual && guidelineData && latestActual.actual
      ? ((guidelineData.guideline! - latestActual.actual) / latestActual.actual) * 100
      : 0

    return {
      latestActualValue: latestActual?.actual || 0,
      latestActualYear: latestActual?.fiscalYear || 0,
      guidelineValue: guidelineData?.guideline || 0,
      guidelineYear: guidelineData?.fiscalYear || 0,
      avgActual,
      guidelineGrowth,
      actualYearsCount: actualValues.length,
    }
  }, [chartData])

  const getGrowthIcon = (growth: number | undefined) => {
    if (growth === undefined) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getGrowthColor = (growth: number | undefined) => {
    if (growth === undefined) return "text-muted-foreground"
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const selectedSubject = trendData?.subjects.find(s => s.id === selectedSubjectId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trendData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">データがありません</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルターとチャートタイプ選択 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">科目</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trendData.subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">組織単位</label>
            <Select
              value={selectedDimensionValueId || "all"}
              onValueChange={(value) => setSelectedDimensionValueId(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-[180px] h-10">
                <div className="flex items-center gap-2">
                  {selectedDimensionValueId ? <Building2 className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    全社
                  </div>
                </SelectItem>
                {event.dimensionValues
                  .filter((dv) => !dv.isTotal)
                  .map((dv) => (
                    <SelectItem key={dv.id} value={dv.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {dv.valueName}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ToggleGroup type="single" value={chartType} onValueChange={(v) => v && setChartType(v as ChartType)}>
          <ToggleGroupItem value="bar" aria-label="棒グラフ">
            <BarChart3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="line" aria-label="折れ線グラフ">
            <LineChartIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="composed" aria-label="複合グラフ">
            <BarChart3 className="h-4 w-4 mr-1" />
            <LineChartIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* KPIカード */}
      {kpiMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">直近実績 (FY{kpiMetrics.latestActualYear})</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                {kpiMetrics.latestActualValue.toFixed(1)}
                <span className="ml-1 text-lg font-normal text-blue-600 dark:text-blue-400">億円</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">ガイドライン (FY{kpiMetrics.guidelineYear})</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {kpiMetrics.guidelineValue.toFixed(1)}
                <span className="ml-1 text-lg font-normal text-emerald-600 dark:text-emerald-400">億円</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">過去{kpiMetrics.actualYearsCount}年平均</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                {kpiMetrics.avgActual.toFixed(1)}
                <span className="ml-1 text-lg font-normal text-purple-600 dark:text-purple-400">億円</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">GL目標成長率</p>
                {getGrowthIcon(kpiMetrics.guidelineGrowth)}
              </div>
              <p className={cn("mt-2 text-3xl font-bold", getGrowthColor(kpiMetrics.guidelineGrowth))}>
                {kpiMetrics.guidelineGrowth >= 0 ? "+" : ""}{kpiMetrics.guidelineGrowth.toFixed(1)}
                <span className="ml-1 text-lg font-normal">%</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインチャート */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {selectedSubject?.subjectName || "科目"}の推移
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {selectedDimensionValueId ? event.dimensionValues.find(d => d.id === selectedDimensionValueId)?.valueName : "全社"} | 過去実績 + ガイドライン
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            {chartType === "bar" ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="year"
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                />
                <YAxis
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "億円",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: "12px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [typeof value === "number" ? `${value.toFixed(1)}億円` : "", ""]}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="実績" radius={[4, 4, 0, 0]} />
                <Bar dataKey="guideline" fill="hsl(var(--chart-3))" name="ガイドライン" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="year"
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                />
                <YAxis
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "億円",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: "12px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [typeof value === "number" ? `${value.toFixed(1)}億円` : "", ""]}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "hsl(var(--chart-1))" }}
                  name="実績"
                />
                <Line
                  type="monotone"
                  dataKey="guideline"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 6, fill: "hsl(var(--chart-3))" }}
                  name="ガイドライン"
                />
              </LineChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="actualGradientGL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="year"
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                />
                <YAxis
                  style={{ fontSize: "14px" }}
                  stroke="hsl(var(--foreground))"
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "億円",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: "12px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name) => {
                    if (typeof value !== "number") return ["", ""]
                    return [`${value.toFixed(1)}億円`, name === "actual" ? "実績" : "ガイドライン"]
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  fill="url(#actualGradientGL)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="実績"
                />
                <Bar dataKey="guideline" fill="hsl(var(--chart-3))" name="ガイドライン" radius={[4, 4, 0, 0]} opacity={0.9} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 年度別データテーブル */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">年度別詳細データ</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 p-4 text-left font-semibold">年度</th>
                  <th className="p-4 text-center font-semibold min-w-[120px]">種別</th>
                  <th className="p-4 text-right font-semibold min-w-[140px]">金額</th>
                  <th className="p-4 text-right font-semibold min-w-[120px]">前年比</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => {
                  const value = row.actual || row.guideline || 0
                  const isActual = row.actual !== undefined

                  return (
                    <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-background p-4 font-medium">{row.year}</td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium",
                            isActual
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          )}
                        >
                          {isActual ? "実績" : "ガイドライン"}
                        </span>
                      </td>
                      <td className="p-4 text-right tabular-nums font-semibold text-lg">
                        {value.toFixed(1)}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">億円</span>
                      </td>
                      <td className="p-4 text-right">
                        {row.growth !== undefined ? (
                          <div className={cn("flex items-center justify-end gap-1 font-semibold", getGrowthColor(row.growth))}>
                            {getGrowthIcon(row.growth)}
                            {row.growth >= 0 ? "+" : ""}{row.growth.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/components/table"
import { RefreshCw } from "lucide-react"
import type { BffKpiDetail } from "../types"
import type { BffClient } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"

interface KpiDetailPanelProps {
  kpiId: string
  bffClient: BffClient
}

export function KpiDetailPanel({ kpiId, bffClient }: KpiDetailPanelProps) {
  const [detail, setDetail] = useState<BffKpiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await bffClient.getKpiDetail(kpiId)
        setDetail(result)
      } catch (err) {
        const errorCode = err instanceof Error ? err.message : "UNKNOWN_ERROR"
        setError(getErrorMessage(errorCode))
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [kpiId, bffClient])

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString("ja-JP")}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-")
    return `${year}年${month}月`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-destructive text-sm">{error}</div>
  }

  if (!detail) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">
          {detail.kpiCode} - {detail.kpiName}
        </h4>
        <div className="text-sm text-muted-foreground">月次予実データ</div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>年月</TableHead>
              <TableHead className="text-right">予算</TableHead>
              <TableHead className="text-right">実績</TableHead>
              <TableHead className="text-right">差異</TableHead>
              <TableHead className="text-right">達成率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.monthlyData.map((row) => (
              <TableRow key={row.yearMonth}>
                <TableCell className="font-medium">{formatYearMonth(row.yearMonth)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.budgetAmount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.actualAmount)}</TableCell>
                <TableCell className={`text-right ${row.variance < 0 ? "text-destructive" : "text-green-600"}`}>
                  {formatCurrency(row.variance)}
                </TableCell>
                <TableCell className="text-right">{formatPercentage(row.achievementRate)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>合計</TableCell>
              <TableCell className="text-right">{formatCurrency(detail.totalBudget)}</TableCell>
              <TableCell className="text-right">{formatCurrency(detail.totalActual)}</TableCell>
              <TableCell
                className={`text-right ${
                  detail.totalActual - detail.totalBudget < 0 ? "text-destructive" : "text-green-600"
                }`}
              >
                {formatCurrency(detail.totalActual - detail.totalBudget)}
              </TableCell>
              <TableCell className="text-right">{formatPercentage(detail.totalAchievementRate)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

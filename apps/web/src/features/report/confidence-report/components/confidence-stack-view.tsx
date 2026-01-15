"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type {
  BffConfidenceReportFilters,
  BffConfidenceStackData,
} from "@epm/contracts/bff/confidence-report"

interface ConfidenceStackViewProps {
  filters: BffConfidenceReportFilters
  selectedOrgId: string
}

export function ConfidenceStackView({ filters, selectedOrgId }: ConfidenceStackViewProps) {
  const client = useBffClient()
  const [stacks, setStacks] = useState<BffConfidenceStackData[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [expectedValue, setExpectedValue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStackView() {
      setLoading(true)
      try {
        const response = await client.getStackView(filters, selectedOrgId)
        setStacks(response.stacks)
        setTotalAmount(response.totalAmount)
        setExpectedValue(response.expectedValue)
      } finally {
        setLoading(false)
      }
    }
    fetchStackView()
  }, [client, filters, selectedOrgId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}億円`
    }
    return `${(value / 10000).toFixed(0)}万円`
  }

  // 確度レベルのカラーマッピング
  const getColorClass = (levelCode: string): string => {
    const colorMap: Record<string, string> = {
      S: "bg-confidence-s",
      A: "bg-confidence-a",
      B: "bg-confidence-b",
      C: "bg-confidence-c",
      D: "bg-confidence-d",
      Z: "bg-confidence-z",
    }
    return colorMap[levelCode] || "bg-muted"
  }

  return (
    <div className="space-y-6">
      {/* 横棒グラフ（積み上げ） */}
      <Card>
        <CardHeader>
          <CardTitle>確度別構成</CardTitle>
          <p className="text-sm text-muted-foreground">
            確度ランク別の金額構成比を表示します
          </p>
        </CardHeader>
        <CardContent>
          {/* 積み上げバー */}
          <div className="space-y-4">
            <div className="flex h-12 w-full overflow-hidden rounded-lg">
              {stacks.map((stack) => (
                <div
                  key={stack.levelCode}
                  className={`flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80 ${getColorClass(stack.levelCode)}`}
                  style={{ width: `${stack.percentage}%` }}
                  title={`${stack.levelName}: ${formatCurrency(stack.amount)} (${stack.count}件)`}
                >
                  {stack.percentage > 8 && `${stack.percentage}%`}
                </div>
              ))}
            </div>

            {/* 凡例 */}
            <div className="flex flex-wrap gap-4">
              {stacks.map((stack) => (
                <div key={stack.levelCode} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded ${getColorClass(stack.levelCode)}`} />
                  <span className="text-sm text-muted-foreground">
                    {stack.levelName}: {stack.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 確度別詳細テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>確度別詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">確度</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">金額</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">件数</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">構成比</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">構成</th>
                </tr>
              </thead>
              <tbody>
                {stacks.map((stack) => (
                  <tr key={stack.levelCode} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded ${getColorClass(stack.levelCode)}`} />
                        <span className="font-medium text-foreground">{stack.levelName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(stack.amount)}
                    </td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      {stack.count}件
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-foreground">
                      {stack.percentage}%
                    </td>
                    <td className="py-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getColorClass(stack.levelCode)}`}
                          style={{ width: `${stack.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td className="pt-3 font-bold text-foreground">合計</td>
                  <td className="pt-3 text-right text-sm font-bold text-foreground">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="pt-3 text-right text-sm text-muted-foreground">
                    {stacks.reduce((sum, s) => sum + s.count, 0)}件
                  </td>
                  <td className="pt-3 text-right text-sm font-bold text-foreground">100%</td>
                  <td />
                </tr>
                <tr>
                  <td className="pt-2 font-bold text-primary">期待値</td>
                  <td className="pt-2 text-right text-sm font-bold text-primary">
                    {formatCurrency(expectedValue)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { cn } from "@/lib/utils"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffVarianceReportFilters, BffVarianceAccountRow } from "@epm/contracts/bff/variance-report"

interface VarianceDetailTableProps {
  filters: BffVarianceReportFilters
  selectedOrgId: string
}

export function VarianceDetailTable({ filters, selectedOrgId }: VarianceDetailTableProps) {
  const client = useBffClient()
  const [items, setItems] = useState<BffVarianceAccountRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await client.getAccountDetail(filters, selectedOrgId)
        setItems(response.rows)
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
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>差異詳細</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  科目
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">予算</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                  実績+見込
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">差異</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                  差異率
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const isSubItem = row.indentLevel > 0

                return (
                  <tr key={row.subjectId} className="border-b border-border/50 hover:bg-muted/30">
                    <td
                      className={cn(
                        "py-3 px-4 text-sm",
                        isSubItem ? "text-muted-foreground pl-8" : "font-medium text-foreground"
                      )}
                    >
                      {row.subjectName}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-foreground">
                      ¥{row.budget.toLocaleString()}M
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-foreground">
                      ¥{row.actual.toLocaleString()}M
                    </td>
                    <td
                      className={cn(
                        "text-right py-3 px-4 text-sm font-semibold",
                        row.isPositive ? "text-positive" : "text-negative"
                      )}
                    >
                      {row.variance > 0 && "+"}¥{row.variance.toLocaleString()}M
                    </td>
                    <td
                      className={cn(
                        "text-right py-3 px-4 text-sm font-semibold",
                        row.isPositive ? "text-positive" : "text-negative"
                      )}
                    >
                      {row.varianceRate.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Progress } from "@/shared/ui"
import { cn } from "@/lib/utils"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffBudgetTrendFilters, BffBudgetOrgBreakdown } from "@epm/contracts/bff/budget-trend-report"

interface BudgetOrgBreakdownProps {
  filters: BffBudgetTrendFilters
  selectedOrgId: string
}

export function BudgetOrgBreakdown({ filters, selectedOrgId }: BudgetOrgBreakdownProps) {
  const client = useBffClient()
  const [organizations, setOrganizations] = useState<BffBudgetOrgBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBreakdown() {
      setLoading(true)
      try {
        const response = await client.getOrgBreakdown(filters, selectedOrgId)
        setOrganizations(response.organizations)
      } finally {
        setLoading(false)
      }
    }
    fetchBreakdown()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>組織別消化状況</CardTitle>
        <p className="text-sm text-muted-foreground">
          各組織の予算消化状況を比較します
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">組織</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">予算</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">実績</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-48">消化率</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">差異</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">前年比</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr
                  key={org.organizationId}
                  className={cn("border-b border-border/50", org.isSummary && "bg-muted/50")}
                >
                  <td className={cn("py-3 px-4 text-foreground", org.isSummary && "font-bold")}>
                    {org.organizationName}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-foreground">
                    ¥{org.budget.toLocaleString()}M
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-foreground">
                    ¥{org.actual.toLocaleString()}M
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Progress value={org.consumptionRate} className="h-2 flex-1" />
                      <span className="text-sm font-semibold text-foreground w-14 text-right">
                        {org.consumptionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td
                    className={cn(
                      "py-3 px-4 text-right text-sm font-semibold",
                      org.variance >= 0 ? "text-positive" : "text-negative"
                    )}
                  >
                    {org.variance >= 0 ? "+" : ""}¥{org.variance.toLocaleString()}M
                    <span className="text-muted-foreground font-normal ml-1">
                      ({org.varianceRate.toFixed(1)}%)
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-3 px-4 text-right text-sm font-semibold",
                      org.priorYearVariance >= 0 ? "text-positive" : "text-negative"
                    )}
                  >
                    {org.priorYearVariance >= 0 ? "+" : ""}¥{org.priorYearVariance.toLocaleString()}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

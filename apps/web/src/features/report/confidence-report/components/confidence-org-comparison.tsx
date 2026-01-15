"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { cn } from "@/lib/utils"
import { useBffClient } from "../lib/bff-client-provider"
import type { OrgNode } from "./organization-tree-view"
import type {
  BffConfidenceReportFilters,
  BffConfidenceOrgData,
  BffConfidenceLevelInfo,
} from "@epm/contracts/bff/confidence-report"

interface ConfidenceOrgComparisonProps {
  filters: BffConfidenceReportFilters
  selectedOrgNode: OrgNode | null
}

export function ConfidenceOrgComparison({ filters, selectedOrgNode }: ConfidenceOrgComparisonProps) {
  const client = useBffClient()
  const [organizations, setOrganizations] = useState<BffConfidenceOrgData[]>([])
  const [confidenceLevels, setConfidenceLevels] = useState<BffConfidenceLevelInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrgComparison() {
      if (!selectedOrgNode) return
      setLoading(true)
      try {
        const response = await client.getOrgComparison(filters, selectedOrgNode.id)
        setOrganizations(response.organizations)
        setConfidenceLevels(response.confidenceLevels)
      } finally {
        setLoading(false)
      }
    }
    fetchOrgComparison()
  }, [client, filters, selectedOrgNode])

  if (!selectedOrgNode) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            左側のツリーから組織を選択してください
          </p>
        </CardContent>
      </Card>
    )
  }

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

  // 確度レベルの色
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
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            分析対象:{" "}
            <span className="font-semibold text-foreground">{selectedOrgNode.name}</span>{" "}
            の合計と直下組織
          </p>
        </CardContent>
      </Card>

      {/* 組織別確度分布テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>組織別確度分布比較</CardTitle>
          <p className="text-sm text-muted-foreground">
            各組織の確度構成を横並びで比較し、営業力を可視化
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">組織</th>
                  {confidenceLevels.map((level) => (
                    <th key={level.code} className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-4 w-4 rounded ${getColorClass(level.code)}`} />
                        <span>{level.nameShort}</span>
                      </div>
                    </th>
                  ))}
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">総見込額</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">期待値</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">達成率</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr
                    key={org.organizationId}
                    className={cn("border-b border-border/50", org.isSummary && "bg-muted/50")}
                  >
                    <td className={cn("py-4 text-foreground", org.isSummary && "font-bold")}>
                      {org.organizationName}
                    </td>
                    {confidenceLevels.map((level) => {
                      const data = org.confidence[level.code]
                      return (
                        <td key={level.code} className="py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-semibold text-foreground">{data?.amount ?? 0}M</span>
                            <span className="text-xs text-muted-foreground">{data?.percentage ?? 0}%</span>
                            <span className="text-xs text-muted-foreground">({data?.count ?? 0}件)</span>
                          </div>
                        </td>
                      )
                    })}
                    <td className="py-4 text-right text-sm font-bold text-foreground">{org.total}M</td>
                    <td className="py-4 text-right text-sm font-bold text-primary">{org.expectedValue}M</td>
                    <td className="py-4 text-right">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          org.achievementRate >= 60 ? "text-positive" : "text-negative"
                        )}
                      >
                        {org.achievementRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 視覚的な比較バー */}
      <Card>
        <CardHeader>
          <CardTitle>確度分布の視覚比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.organizationId}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn("text-foreground", org.isSummary && "font-bold")}>
                    {org.organizationName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    期待値: <span className="font-bold text-primary">{org.expectedValue}M</span>
                  </span>
                </div>
                <div className="flex h-8 w-full overflow-hidden rounded-lg">
                  {confidenceLevels.map((level) => {
                    const data = org.confidence[level.code]
                    const percentage = data?.percentage ?? 0
                    return (
                      <div
                        key={level.code}
                        className={cn(
                          "flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80",
                          getColorClass(level.code)
                        )}
                        style={{ width: `${percentage}%` }}
                        title={`${level.name}: ${data?.amount ?? 0}M (${data?.count ?? 0}件)`}
                      >
                        {percentage > 8 && `${percentage}%`}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

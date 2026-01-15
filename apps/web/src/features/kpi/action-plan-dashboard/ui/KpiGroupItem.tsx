"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/shared/ui/components/card"
import { Button } from "@/shared/ui/components/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { PlanSummaryCard } from "./PlanSummaryCard"
import { KpiDetailPanel } from "./KpiDetailPanel"
import type { BffKpiGroup } from "../types"
import type { BffClient } from "../api/BffClient"

interface KpiGroupItemProps {
  group: BffKpiGroup
  bffClient: BffClient
}

export function KpiGroupItem({ group, bffClient }: KpiGroupItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return `¥${value.toLocaleString("ja-JP")}`
  }

  const formatPercentage = (value: number | null) => {
    if (value === null) return "-"
    return `${value.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h3 className="font-semibold text-lg">
                {group.kpiCode} - {group.kpiName}
              </h3>
            </div>
            {group.organizationName && (
              <p className="text-sm text-muted-foreground mt-1 ml-8">{group.organizationName}</p>
            )}
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <div className="text-xs text-muted-foreground">予算</div>
              <div className="font-semibold">{formatCurrency(group.budgetAmount)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">実績</div>
              <div className="font-semibold">{formatCurrency(group.actualAmount)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">達成率</div>
              <div className="font-semibold">{formatPercentage(group.achievementRate)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDetail(!showDetail)}>
              {showDetail ? "閉じる" : "予実詳細"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showDetail && (
        <div className="px-6 pb-4">
          <KpiDetailPanel kpiId={group.kpiId} bffClient={bffClient} />
        </div>
      )}

      {isExpanded && (
        <CardContent className="pt-0">
          {group.plans.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center border-t">
              アクションプランが登録されていません
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 border-t pt-4">
              {group.plans.map((plan) => (
                <PlanSummaryCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

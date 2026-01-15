"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/shared/ui"
import Link from "next/link"
import { BffClientProvider } from "../lib/bff-client-provider"
import { OrganizationTreeView, type OrgNode } from "./organization-tree-view"
import { VarianceFilters } from "./variance-filters"
import { VarianceWaterfallChart } from "./variance-waterfall-chart"
import { VarianceDetailTable } from "./variance-detail-table"
import type {
  BffVarianceReportFilters,
  VarianceComparisonMode,
  VariancePeriodType,
} from "@epm/contracts/bff/variance-report"

function VarianceAnalysisDashboardContent() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [filters, setFilters] = useState<BffVarianceReportFilters>({
    comparisonMode: "budget_actual" as VarianceComparisonMode,
    periodType: "cumulative" as VariancePeriodType,
    selectedMonth: "2025-01",
  })

  const updateFilter = <K extends keyof BffVarianceReportFilters>(
    key: K,
    value: BffVarianceReportFilters[K]
  ) => {
    setFilters((prev: BffVarianceReportFilters) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Organization Tree */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/report">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ChevronLeft className="mr-2 h-4 w-4" />
              レポート一覧に戻る
            </Button>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <OrganizationTreeView selectedNode={selectedNode} onSelectNode={setSelectedNode} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            差異分析（ウォーターフォール）
          </h1>
          <VarianceFilters
            filters={filters}
            onComparisonModeChange={(v) => updateFilter("comparisonMode", v)}
            onPeriodTypeChange={(v) => updateFilter("periodType", v)}
            onMonthChange={(v) => updateFilter("selectedMonth", v)}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Waterfall Chart */}
          <VarianceWaterfallChart filters={filters} selectedOrgId={selectedNode?.id ?? "corp"} />

          {/* Detail Table */}
          <VarianceDetailTable filters={filters} selectedOrgId={selectedNode?.id ?? "corp"} />
        </div>
      </div>
    </div>
  )
}

export function VarianceAnalysisDashboard() {
  return (
    <BffClientProvider>
      <VarianceAnalysisDashboardContent />
    </BffClientProvider>
  )
}

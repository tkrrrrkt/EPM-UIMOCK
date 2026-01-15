"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui"
import { BffClientProvider } from "../lib/bff-client-provider"
import { BudgetTrendFilters, type FilterState } from "./budget-trend-filters"
import { BudgetTrendSummary } from "./budget-trend-summary"
import { BudgetConsumptionChart } from "./budget-consumption-chart"
import { BudgetYearComparison } from "./budget-year-comparison"
import { BudgetOrgBreakdown } from "./budget-org-breakdown"
import { OrganizationTreeView, type OrgNode } from "./organization-tree-view"
import type { BffBudgetTrendFilters } from "@epm/contracts/bff/budget-trend-report"

export function BudgetTrendDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    fiscalYear: "2024",
    accountType: "revenue",
    comparisonYear: "2023",
  })
  const [selectedOrgNode, setSelectedOrgNode] = useState<OrgNode | null>(null)
  const [activeTab, setActiveTab] = useState("consumption")

  const bffFilters: BffBudgetTrendFilters = {
    fiscalYear: filters.fiscalYear,
    accountType: filters.accountType as "revenue" | "gross_profit" | "operating_profit" | "all",
    comparisonYear: filters.comparisonYear,
  }

  return (
    <BffClientProvider>
      <div className="h-full flex flex-col bg-background">
        {/* ヘッダー */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">予算消化推移レポート</h1>
              <p className="text-sm text-muted-foreground">
                予算消化率の推移と着地予測を分析します
              </p>
            </div>
            <BudgetTrendFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左サイドバー: 組織ツリー */}
          <aside className="w-64 border-r border-border bg-card overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">組織選択</h2>
              <OrganizationTreeView
                selectedNode={selectedOrgNode}
                onSelectNode={setSelectedOrgNode}
              />
            </div>
          </aside>

          {/* 右側: レポートコンテンツ */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* サマリーカード */}
              <BudgetTrendSummary
                filters={bffFilters}
                selectedOrgId={selectedOrgNode?.id ?? "all"}
              />

              {/* タブコンテンツ */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                  <TabsTrigger value="consumption">消化率推移</TabsTrigger>
                  <TabsTrigger value="comparison">前年比較</TabsTrigger>
                  <TabsTrigger value="breakdown">組織別内訳</TabsTrigger>
                </TabsList>

                <TabsContent value="consumption" className="mt-6">
                  <BudgetConsumptionChart
                    filters={bffFilters}
                    selectedOrgId={selectedOrgNode?.id ?? "all"}
                  />
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <BudgetYearComparison
                    filters={bffFilters}
                    selectedOrgId={selectedOrgNode?.id ?? "all"}
                  />
                </TabsContent>

                <TabsContent value="breakdown" className="mt-6">
                  <BudgetOrgBreakdown
                    filters={bffFilters}
                    selectedOrgId={selectedOrgNode?.id ?? "all"}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </BffClientProvider>
  )
}

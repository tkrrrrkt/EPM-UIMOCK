"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui"
import { BffClientProvider } from "../lib/bff-client-provider"
import { ConfidenceFilters, type FilterState } from "./confidence-filters"
import { ConfidenceSummary } from "./confidence-summary"
import { ConfidenceStackView } from "./confidence-stack-view"
import { ConfidenceTrendChart } from "./confidence-trend-chart"
import { ConfidenceOrgComparison } from "./confidence-org-comparison"
import { OrganizationTreeView, type OrgNode } from "./organization-tree-view"
import type { BffConfidenceReportFilters } from "@epm/contracts/bff/confidence-report"

export function ConfidenceReportDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    period: "FY2025",
    organization: "all",
    accountType: "revenue",
    owner: "all",
  })
  const [selectedOrgNode, setSelectedOrgNode] = useState<OrgNode | null>(null)
  const [activeTab, setActiveTab] = useState("stack")

  const bffFilters: BffConfidenceReportFilters = {
    period: filters.period,
    organizationId: filters.organization,
    accountType: filters.accountType as "revenue" | "gross_profit",
    ownerId: filters.owner === "all" ? undefined : filters.owner,
  }

  return (
    <BffClientProvider>
      <div className="h-full flex flex-col bg-background">
        {/* ヘッダー */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">確度別売上見込レポート</h1>
              <p className="text-sm text-muted-foreground">
                確度ランク別の売上見込を分析し、期待値を把握します
              </p>
            </div>
            <ConfidenceFilters filters={filters} onFiltersChange={setFilters} />
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
              <ConfidenceSummary
                filters={bffFilters}
                selectedOrgId={selectedOrgNode?.id ?? "all"}
              />

              {/* タブコンテンツ */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                  <TabsTrigger value="stack">確度別積み上げ</TabsTrigger>
                  <TabsTrigger value="trend">推移分析</TabsTrigger>
                  <TabsTrigger value="comparison">組織別比較</TabsTrigger>
                </TabsList>

                <TabsContent value="stack" className="mt-6">
                  <ConfidenceStackView
                    filters={bffFilters}
                    selectedOrgId={selectedOrgNode?.id ?? "all"}
                  />
                </TabsContent>

                <TabsContent value="trend" className="mt-6">
                  <ConfidenceTrendChart
                    filters={bffFilters}
                    selectedOrgId={selectedOrgNode?.id ?? "all"}
                  />
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <ConfidenceOrgComparison
                    filters={bffFilters}
                    selectedOrgNode={selectedOrgNode}
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

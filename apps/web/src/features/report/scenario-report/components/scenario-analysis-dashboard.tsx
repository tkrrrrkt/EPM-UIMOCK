"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui"
import { BffClientProvider } from "../lib/bff-client-provider"
import { OrganizationTreeView, type OrgNode } from "./organization-tree-view"
import { ScenarioFilters } from "./scenario-filters"
import { ScenarioSummary } from "./scenario-summary"
import { ScenarioComparison } from "./scenario-comparison"
import { ScenarioDetailTable } from "./scenario-detail-table"
import type { BffScenarioReportFilters } from "@epm/contracts/bff/scenario-report"

function ScenarioAnalysisDashboardContent() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [activeTab, setActiveTab] = useState("comparison")
  const [filters, setFilters] = useState<BffScenarioReportFilters>({
    fiscalYear: "2024",
    accountType: "revenue",
  })

  const updateFilter = <K extends keyof BffScenarioReportFilters>(
    key: K,
    value: BffScenarioReportFilters[K]
  ) => {
    setFilters((prev: BffScenarioReportFilters) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/report">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                レポート一覧に戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">シナリオ分析レポート</h1>
              <p className="text-sm text-muted-foreground">W/N/Bシナリオ比較とブレ幅分析</p>
            </div>
          </div>
        </div>

        <ScenarioFilters
          filters={filters}
          onFiscalYearChange={(v) => updateFilter("fiscalYear", v)}
          onAccountTypeChange={(v) => updateFilter("accountType", v)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Organization Tree */}
        <div className="w-64 border-r bg-card overflow-auto p-4">
          <OrganizationTreeView selectedNode={selectedNode} onSelectNode={setSelectedNode} />
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <ScenarioSummary filters={filters} selectedOrgId={selectedNode?.id ?? "corp"} />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="comparison">3シナリオ比較</TabsTrigger>
                <TabsTrigger value="detail">詳細テーブル</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-6">
                <ScenarioComparison filters={filters} selectedOrgId={selectedNode?.id ?? "corp"} />
              </TabsContent>

              <TabsContent value="detail" className="space-y-6">
                <ScenarioDetailTable filters={filters} selectedOrgId={selectedNode?.id ?? "corp"} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ScenarioAnalysisDashboard() {
  return (
    <BffClientProvider>
      <ScenarioAnalysisDashboardContent />
    </BffClientProvider>
  )
}

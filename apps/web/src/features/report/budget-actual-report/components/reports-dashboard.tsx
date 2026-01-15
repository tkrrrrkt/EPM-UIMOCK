"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs"
import { ReportHeader, type ComparisonMode } from "./report-header"
import { OrganizationTreeView } from "./organization-tree-view"
import { MatrixView } from "./matrix-view"

export function ReportsDashboard() {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("budget")
  const [activeTab, setActiveTab] = useState("organization")

  return (
    <div className="h-full flex flex-col bg-background">
      <ReportHeader
        comparisonMode={comparisonMode}
        onComparisonModeChange={setComparisonMode}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-6 pt-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-10">
            <TabsTrigger value="organization" className="text-sm">
              組織別レポート
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-sm">
              マトリックス分析
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="organization" className="flex-1 mt-0 min-h-0">
          <OrganizationTreeView comparisonMode={comparisonMode} />
        </TabsContent>

        <TabsContent value="matrix" className="flex-1 mt-0 min-h-0">
          <MatrixView comparisonMode={comparisonMode} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

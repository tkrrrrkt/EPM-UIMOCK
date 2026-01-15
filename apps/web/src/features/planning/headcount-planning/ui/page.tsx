"use client"

import { useState, useCallback } from "react"
import { FileDown } from "lucide-react"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui"
import { BffClientProvider } from "../lib/bff-client-provider"
import { SearchPanel, type SearchParams } from "./SearchPanel"
import { ResourcePlanList } from "./ResourcePlanList"
import { IndividualAllocationList } from "./IndividualAllocationList"
import { ResourcePlanDialog } from "./ResourcePlanDialog"
import { AllocationDialog } from "./AllocationDialog"
import { IndividualDialog } from "./IndividualDialog"
import { ApplyBudgetDialog } from "./ApplyBudgetDialog"
import type {
  BffResourcePlanSummary,
  BffIndividualAllocationSummary,
  BffDepartmentRef,
} from "@epm/contracts/bff/headcount-planning"

// Default company ID (in production, this would come from auth context)
const DEFAULT_COMPANY_ID = "company-001"

export default function HeadcountPlanningPage() {
  // Search context
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [departments, setDepartments] = useState<BffDepartmentRef[]>([])

  // Refresh keys for lists
  const [resourcePlanRefreshKey, setResourcePlanRefreshKey] = useState(0)
  const [individualRefreshKey, setIndividualRefreshKey] = useState(0)

  // Dialog states - Resource Plan
  const [resourcePlanDialogOpen, setResourcePlanDialogOpen] = useState(false)
  const [editingResourcePlan, setEditingResourcePlan] = useState<BffResourcePlanSummary | null>(
    null
  )

  // Dialog states - Allocation (full mode)
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)
  const [allocationTargetPlan, setAllocationTargetPlan] = useState<BffResourcePlanSummary | null>(
    null
  )

  // Dialog states - Monthly Allocation (single month mode)
  const [monthlyAllocationDialogOpen, setMonthlyAllocationDialogOpen] = useState(false)
  const [monthlyAllocationTargetPlan, setMonthlyAllocationTargetPlan] =
    useState<BffResourcePlanSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  // Dialog states - Individual
  const [individualDialogOpen, setIndividualDialogOpen] = useState(false)
  const [editingIndividual, setEditingIndividual] = useState<BffIndividualAllocationSummary | null>(
    null
  )

  // Dialog states - Apply Budget
  const [applyBudgetDialogOpen, setApplyBudgetDialogOpen] = useState(false)

  // Handle search context change - capture departments for dialogs
  const handleSearchChange = useCallback(
    (params: SearchParams) => {
      setSearchParams(params)
    },
    []
  )

  // Resource Plan handlers
  const handleCreateResourcePlan = () => {
    setEditingResourcePlan(null)
    setResourcePlanDialogOpen(true)
  }

  const handleEditResourcePlan = (plan: BffResourcePlanSummary) => {
    setEditingResourcePlan(plan)
    setResourcePlanDialogOpen(true)
  }

  const handleOpenAllocation = (plan: BffResourcePlanSummary) => {
    setAllocationTargetPlan(plan)
    setAllocationDialogOpen(true)
  }

  const handleOpenMonthAllocation = (plan: BffResourcePlanSummary, month: number) => {
    setMonthlyAllocationTargetPlan(plan)
    setSelectedMonth(month)
    setMonthlyAllocationDialogOpen(true)
  }

  const handleDeleteResourcePlan = async (_planId: string) => {
    // The delete is handled by the list component via BffClient
    // Just refresh the list after deletion
    setResourcePlanRefreshKey((k) => k + 1)
  }

  const handleMonthsChange = (
    _planId: string,
    _months: { periodMonth: number; headcount: string }[]
  ) => {
    // TODO: Implement updateResourcePlanMonths call
    // This would save the month changes to the backend
    setResourcePlanRefreshKey((k) => k + 1)
  }

  const handleResourcePlanSuccess = () => {
    setResourcePlanRefreshKey((k) => k + 1)
  }

  const handleAllocationSuccess = () => {
    setResourcePlanRefreshKey((k) => k + 1)
  }

  const handleMonthlyAllocationSuccess = () => {
    setResourcePlanRefreshKey((k) => k + 1)
  }

  // Individual handlers
  const handleCreateIndividual = () => {
    setEditingIndividual(null)
    setIndividualDialogOpen(true)
  }

  const handleEditIndividual = (individual: BffIndividualAllocationSummary) => {
    setEditingIndividual(individual)
    setIndividualDialogOpen(true)
  }

  const handleDeleteIndividual = async (_individualKey: string) => {
    // The delete is handled by the list component via BffClient
    setIndividualRefreshKey((k) => k + 1)
  }

  const handleIndividualSuccess = () => {
    setIndividualRefreshKey((k) => k + 1)
  }

  // Apply budget handlers
  const handleApplyBudget = () => {
    setApplyBudgetDialogOpen(true)
  }

  const handleApplyBudgetSuccess = () => {
    // Optionally refresh lists after budget apply
    setResourcePlanRefreshKey((k) => k + 1)
    setIndividualRefreshKey((k) => k + 1)
  }

  // Store departments from context (via SearchPanel)
  const handleDepartmentsLoaded = useCallback((depts: BffDepartmentRef[]) => {
    setDepartments(depts)
  }, [])

  return (
    <BffClientProvider>
      <div className="w-full px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">人員計画登録</h1>
            <p className="text-muted-foreground">
              部門別の人員計画と配賦設定を管理します
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!searchParams}>
              <FileDown className="mr-2 h-4 w-4" />
              エクスポート
            </Button>
            <Button onClick={handleApplyBudget} disabled={!searchParams}>
              予算に反映
            </Button>
          </div>
        </div>

        {/* Search Panel */}
        <SearchPanel
          companyId={DEFAULT_COMPANY_ID}
          onSearchChange={handleSearchChange}
          onDepartmentsLoaded={handleDepartmentsLoaded}
        />

        {/* Tabs for Layer 1 and Layer 2 */}
        {searchParams && (
          <Tabs defaultValue="bulk" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bulk">一括管理（職種×等級）</TabsTrigger>
              <TabsTrigger value="individual">個人別管理（役員・兼務者）</TabsTrigger>
            </TabsList>

            {/* Layer 1: Bulk Management */}
            <TabsContent value="bulk" className="space-y-4">
              <ResourcePlanList
                key={resourcePlanRefreshKey}
                searchParams={searchParams}
                onCreateNew={handleCreateResourcePlan}
                onEdit={handleEditResourcePlan}
                onAllocation={handleOpenAllocation}
                onMonthAllocation={handleOpenMonthAllocation}
                onDelete={handleDeleteResourcePlan}
                onMonthsChange={handleMonthsChange}
              />
            </TabsContent>

            {/* Layer 2: Individual Management */}
            <TabsContent value="individual" className="space-y-4">
              <IndividualAllocationList
                key={individualRefreshKey}
                searchParams={searchParams}
                onCreateNew={handleCreateIndividual}
                onEdit={handleEditIndividual}
                onDelete={handleDeleteIndividual}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Dialogs */}
        <ResourcePlanDialog
          open={resourcePlanDialogOpen}
          onOpenChange={setResourcePlanDialogOpen}
          editPlan={editingResourcePlan}
          searchParams={searchParams}
          onSuccess={handleResourcePlanSuccess}
        />

        <AllocationDialog
          open={allocationDialogOpen}
          onOpenChange={setAllocationDialogOpen}
          plan={allocationTargetPlan}
          departments={departments}
          onSuccess={handleAllocationSuccess}
        />

        {/* Monthly Allocation Dialog (single month mode) */}
        <AllocationDialog
          open={monthlyAllocationDialogOpen}
          onOpenChange={setMonthlyAllocationDialogOpen}
          plan={monthlyAllocationTargetPlan}
          departments={departments}
          month={selectedMonth}
          onSuccess={handleMonthlyAllocationSuccess}
        />

        <IndividualDialog
          open={individualDialogOpen}
          onOpenChange={setIndividualDialogOpen}
          editIndividual={editingIndividual}
          searchParams={searchParams}
          departments={departments}
          onSuccess={handleIndividualSuccess}
        />

        <ApplyBudgetDialog
          open={applyBudgetDialogOpen}
          onOpenChange={setApplyBudgetDialogOpen}
          searchParams={searchParams}
          onSuccess={handleApplyBudgetSuccess}
        />
      </div>
    </BffClientProvider>
  )
}

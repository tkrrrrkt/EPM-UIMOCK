"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/components/pagination"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { Plus, AlertCircle, Loader2 } from "lucide-react"
import { ActionPlanSearchPanel } from "./ActionPlanSearchPanel"
import { ActionPlanTable } from "./ActionPlanTable"
import { ActionPlanDetailPanel } from "./ActionPlanDetailPanel"
import { ActionPlanCreateDialog } from "./ActionPlanCreateDialog"
import { ActionPlanEditDialog } from "./ActionPlanEditDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { createBffClient } from "../api"
import type {
  BffActionPlanSummary,
  BffActionPlanDetail,
  BffListPlansRequest,
  BffCreatePlanRequest,
  BffUpdatePlanRequest,
  BffKpiSubject,
  ActionPlanStatus,
  ActionPlanPriority,
} from "../types"

const bffClient = createBffClient()

export function ActionPlanListPage() {
  const [plans, setPlans] = useState<BffActionPlanSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState<BffListPlansRequest["sortBy"]>("planCode")
  const [sortOrder, setSortOrder] = useState<BffListPlansRequest["sortOrder"]>("asc")
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<ActionPlanPriority | undefined>()

  const [kpiSubjects, setKpiSubjects] = useState<BffKpiSubject[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<BffActionPlanDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const [permissions] = useState({
    canCreate: true,
    canEdit: true,
    canDelete: true,
  })

  useEffect(() => {
    loadKpiSubjects()
  }, [])

  useEffect(() => {
    loadPlans()
  }, [page, sortBy, sortOrder])

  const loadKpiSubjects = async () => {
    try {
      const response = await bffClient.getKpiSubjects()
      setKpiSubjects(response.subjects)
    } catch (err) {
      console.error("[action-plan-core] Failed to load KPI subjects:", err)
    }
  }

  const loadPlans = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await bffClient.listPlans({
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword || undefined,
        status: statusFilter,
        priority: priorityFilter,
      })

      setPlans(response.plans)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError("アクションプラン一覧の取得に失敗しました")
      console.error("[action-plan-core] Failed to load plans:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlanDetail = async (planId: string) => {
    setIsDetailLoading(true)
    try {
      const response = await bffClient.getPlanDetail(planId)
      setSelectedPlanDetail(response.plan)
    } catch (err) {
      setError("詳細情報の取得に失敗しました")
      console.error("[action-plan-core] Failed to load plan detail:", err)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadPlans()
  }

  const handleClear = () => {
    setKeyword("")
    setStatusFilter(undefined)
    setPriorityFilter(undefined)
    setPage(1)
    setTimeout(loadPlans, 0)
  }

  const handleSort = (field: NonNullable<BffListPlansRequest["sortBy"]>) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleRowClick = async (plan: BffActionPlanSummary) => {
    setSelectedPlanId(plan.id)
    await loadPlanDetail(plan.id)
  }

  const handleCloseDetail = () => {
    setSelectedPlanId(null)
    setSelectedPlanDetail(null)
  }

  const handleCreate = async (data: BffCreatePlanRequest) => {
    await bffClient.createPlan(data)
    await loadPlans()
  }

  const handleEdit = async (id: string, data: BffUpdatePlanRequest) => {
    const response = await bffClient.updatePlan(id, data)
    setSelectedPlanDetail(response.plan)
    await loadPlans()
  }

  const handleDelete = async (id: string) => {
    await bffClient.deletePlan(id)
    handleCloseDetail()
    await loadPlans()
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">アクションプラン管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              KPI目標達成のための施策を管理します
            </p>
          </div>
          {permissions.canCreate && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Fixed Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Panel (70%) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Panel */}
          <div className="flex-shrink-0 mb-4">
            <ActionPlanSearchPanel
              keyword={keyword}
              status={statusFilter}
              priority={priorityFilter}
              onKeywordChange={setKeyword}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onSearch={handleSearch}
              onClear={handleClear}
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-lg bg-card">
            {isLoading ? (
              <div className="flex h-full min-h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ActionPlanTable
                plans={plans}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onRowClick={handleRowClick}
                selectedId={selectedPlanId}
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex-shrink-0 mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                全{totalCount}件中 {(page - 1) * pageSize + 1}〜{Math.min(page * pageSize, totalCount)}件
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Detail Panel (30% fixed) */}
        <div className="w-[380px] flex-shrink-0 border-l bg-card">
          <ActionPlanDetailPanel
            plan={selectedPlanDetail}
            loading={isDetailLoading}
            onClose={handleCloseDetail}
            onEdit={() => setIsEditOpen(true)}
            onDelete={() => setIsDeleteOpen(true)}
            canEdit={permissions.canEdit}
            canDelete={permissions.canDelete}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ActionPlanCreateDialog
        open={isCreateOpen}
        kpiSubjects={kpiSubjects}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ActionPlanEditDialog
        open={isEditOpen}
        plan={selectedPlanDetail}
        kpiSubjects={kpiSubjects}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        plan={selectedPlanDetail}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { BffClientProvider } from "./lib/bff-client-provider"
import { SearchPanel } from "./components/SearchPanel"
import { LaborCostRateList } from "./components/LaborCostRateList"
import { DetailDialog } from "./components/DetailDialog"
import { FormDialog } from "./components/FormDialog"
import type { BffListLaborCostRatesRequest } from "./types/bff-contracts"

export default function LaborCostRatePage() {
  const [searchParams, setSearchParams] = useState<BffListLaborCostRatesRequest>({
    isActive: true,
    asOfDate: new Date().toISOString().split("T")[0],
  })

  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleViewDetail(id: string) {
    setSelectedRateId(id)
    setDetailDialogOpen(true)
  }

  function handleEdit(id: string) {
    setDetailDialogOpen(false)
    setSelectedRateId(id)
    setFormDialogOpen(true)
  }

  function handleCreateNew() {
    setSelectedRateId(null)
    setFormDialogOpen(true)
  }

  async function handleDeactivate(id: string) {
    // This will be handled by the list component
    setDetailDialogOpen(false)
    setRefreshKey((k) => k + 1)
  }

  async function handleReactivate(id: string) {
    // This will be handled by the list component
    setDetailDialogOpen(false)
    setRefreshKey((k) => k + 1)
  }

  function handleFormSuccess() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <BffClientProvider>
      <div className="w-full px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">労務費予算単価マスタ</h1>
          <p className="text-muted-foreground">職種・等級・雇用区分別の計画用単価を管理</p>
        </div>

        <SearchPanel onSearch={setSearchParams} />

        <LaborCostRateList
          key={refreshKey}
          searchParams={searchParams}
          onViewDetail={handleViewDetail}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
          onCreateNew={handleCreateNew}
        />

        <DetailDialog
          rateId={selectedRateId}
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />

        <FormDialog
          rateId={selectedRateId}
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSuccess={handleFormSuccess}
        />
      </div>
    </BffClientProvider>
  )
}

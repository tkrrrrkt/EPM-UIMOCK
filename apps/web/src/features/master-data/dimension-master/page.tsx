'use client'

import { useState, useEffect } from 'react'
import type {
  BffDimensionSummary,
  BffDimensionDetailResponse,
  BffListDimensionsRequest,
  BffCreateDimensionRequest,
  BffUpdateDimensionRequest,
} from '@epm/contracts/bff/dimension-master'
import { DimensionList } from './components/DimensionList'
import { DimensionFilters } from './components/DimensionFilters'
import { DimensionDetailDialog } from './components/DimensionDetailDialog'
import { CreateDimensionDialog } from './components/CreateDimensionDialog'
import { bffClient } from './api/client'
import { getErrorMessage } from './ui/error-messages'

export function DimensionMasterPage() {
  const [dimensions, setDimensions] = useState<BffDimensionSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<BffListDimensionsRequest>({ page: 1, pageSize: 50 })
  const [selectedDimension, setSelectedDimension] = useState<BffDimensionDetailResponse | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadDimensions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bffClient.listDimensions(filters)
      setDimensions(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDimensions()
  }, [filters])

  const handleSelectDimension = async (dimension: BffDimensionSummary) => {
    try {
      const detail = await bffClient.getDimensionDetail(dimension.id)
      setSelectedDimension(detail)
      setDetailDialogOpen(true)
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleManageValues = (dimension: BffDimensionSummary) => {
    // Navigate to dimension values page
    window.location.href = `/master-data/dimension-master/${dimension.id}/values`
  }

  const handleDeactivate = async (id: string) => {
    try {
      await bffClient.deactivateDimension(id)
      loadDimensions()
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await bffClient.reactivateDimension(id)
      loadDimensions()
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleCreate = async (data: BffCreateDimensionRequest) => {
    await bffClient.createDimension(data)
    loadDimensions()
  }

  const handleUpdate = async (id: string, data: BffUpdateDimensionRequest) => {
    const updated = await bffClient.updateDimension(id, data)
    setSelectedDimension(updated)
    loadDimensions()
  }

  const handleKeywordChange = (keyword: string) => {
    setFilters({ ...filters, keyword: keyword || undefined, page: 1 })
  }

  const handleDimensionTypeChange = (dimensionType: string) => {
    setFilters({ ...filters, dimensionType: dimensionType || undefined, page: 1 })
  }

  const handleIsActiveChange = (isActive: string) => {
    setFilters({
      ...filters,
      isActive: isActive === '' ? undefined : isActive === 'true',
      page: 1,
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ディメンションマスタ</h1>
          <p className="text-muted-foreground mt-1">集計軸を統一的に管理します</p>
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          新規作成
        </button>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <DimensionFilters
        keyword={filters.keyword || ''}
        dimensionType={filters.dimensionType || ''}
        isActive={filters.isActive === undefined ? '' : String(filters.isActive)}
        onKeywordChange={handleKeywordChange}
        onDimensionTypeChange={handleDimensionTypeChange}
        onIsActiveChange={handleIsActiveChange}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">読み込み中...</div>
        </div>
      ) : (
        <>
          <DimensionList
            dimensions={dimensions}
            onSelectDimension={handleSelectDimension}
            onManageValues={handleManageValues}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
          <div className="text-sm text-muted-foreground">
            全 {totalCount} 件中 {dimensions.length} 件を表示
          </div>
        </>
      )}

      <DimensionDetailDialog
        dimension={selectedDimension}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onUpdate={handleUpdate}
      />

      <CreateDimensionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}

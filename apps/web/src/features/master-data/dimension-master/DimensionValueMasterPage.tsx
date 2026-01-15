'use client'

import { useState, useEffect } from 'react'
import type {
  BffDimensionValueSummary,
  BffDimensionValueDetailResponse,
  BffListDimensionValuesRequest,
  BffDimensionDetailResponse,
  BffCreateDimensionValueRequest,
  BffUpdateDimensionValueRequest,
} from '@epm/contracts/bff/dimension-master'
import { DimensionValueList } from './components/DimensionValueList'
import { DimensionValueFilters } from './components/DimensionValueFilters'
import { DimensionValueDetailDialog } from './components/DimensionValueDetailDialog'
import { CreateDimensionValueDialog } from './components/CreateDimensionValueDialog'
import { bffClient } from './api/client'
import { getErrorMessage } from './ui/error-messages'

interface DimensionValueMasterPageProps {
  dimensionId: string
}

export function DimensionValueMasterPage({ dimensionId }: DimensionValueMasterPageProps) {
  const [parentDimension, setParentDimension] = useState<BffDimensionDetailResponse | null>(null)
  const [values, setValues] = useState<BffDimensionValueSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<BffListDimensionValuesRequest>({ page: 1, pageSize: 50 })
  const [selectedValue, setSelectedValue] = useState<BffDimensionValueDetailResponse | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadParentDimension = async () => {
    try {
      const dimension = await bffClient.getDimensionDetail(dimensionId)
      setParentDimension(dimension)
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const loadValues = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bffClient.listDimensionValues(dimensionId, filters)
      setValues(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParentDimension()
  }, [dimensionId])

  useEffect(() => {
    if (parentDimension) {
      loadValues()
    }
  }, [filters, parentDimension])

  const handleSelectValue = async (value: BffDimensionValueSummary) => {
    try {
      const detail = await bffClient.getDimensionValueDetail(dimensionId, value.id)
      setSelectedValue(detail)
      setDetailDialogOpen(true)
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await bffClient.deactivateDimensionValue(dimensionId, id)
      loadValues()
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await bffClient.reactivateDimensionValue(dimensionId, id)
      loadValues()
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err.message : 'UNKNOWN_ERROR'))
    }
  }

  const handleCreate = async (data: BffCreateDimensionValueRequest) => {
    await bffClient.createDimensionValue(dimensionId, data)
    loadValues()
  }

  const handleUpdate = async (id: string, data: BffUpdateDimensionValueRequest) => {
    const updated = await bffClient.updateDimensionValue(dimensionId, id, data)
    setSelectedValue(updated)
    loadValues()
  }

  const handleBackToDimensions = () => {
    window.location.href = '/master-data/dimension-master'
  }

  const handleKeywordChange = (keyword: string) => {
    setFilters({ ...filters, keyword: keyword || undefined, page: 1 })
  }

  const handleScopeTypeChange = (scopeType: string) => {
    setFilters({
      ...filters,
      scopeType: scopeType === '' ? undefined : (scopeType as 'tenant' | 'company'),
      page: 1,
    })
  }

  const handleIsActiveChange = (isActive: string) => {
    setFilters({
      ...filters,
      isActive: isActive === '' ? undefined : isActive === 'true',
      page: 1,
    })
  }

  if (!parentDimension) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackToDimensions}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ディメンション一覧に戻る
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ディメンション値管理</h1>
          <p className="text-muted-foreground mt-1">ディメンションに属する値を管理します</p>
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          新規作成
        </button>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <DimensionValueFilters
        keyword={filters.keyword || ''}
        scopeType={filters.scopeType || ''}
        isActive={filters.isActive === undefined ? '' : String(filters.isActive)}
        onKeywordChange={handleKeywordChange}
        onScopeTypeChange={handleScopeTypeChange}
        onIsActiveChange={handleIsActiveChange}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">読み込み中...</div>
        </div>
      ) : (
        <>
          <DimensionValueList
            parentDimension={parentDimension}
            values={values}
            onSelectValue={handleSelectValue}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
          <div className="text-sm text-muted-foreground">
            全 {totalCount} 件中 {values.length} 件を表示
          </div>
        </>
      )}

      <DimensionValueDetailDialog
        value={selectedValue}
        availableParents={values}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onUpdate={handleUpdate}
      />

      <CreateDimensionValueDialog
        open={createDialogOpen}
        dimensionId={dimensionId}
        availableParents={values}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}

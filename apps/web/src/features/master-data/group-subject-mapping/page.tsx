'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui'
import { MappingStatsBar } from './components/MappingStatsBar'
import { MappingFilterPanel } from './components/MappingFilterPanel'
import { MappingList } from './components/MappingList'
import { MappingDetailPanel } from './components/MappingDetailPanel'
import { BulkMappingDialog } from './components/BulkMappingDialog'
import { MockBffClient } from './api/MockBffClient'
import { Layers } from 'lucide-react'
import type {
  BffMappingListResponse,
  BffMappingListItem,
  BffMappingListRequest,
} from '@epm/contracts/bff/group-subject-mapping'

export default function GroupSubjectMappingPage() {
  const [bffClient] = useState(() => new MockBffClient())
  const [data, setData] = useState<BffMappingListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter states
  const [keyword, setKeyword] = useState('')
  const [subjectType, setSubjectType] = useState('all')
  const [subjectClass, setSubjectClass] = useState('all')
  const [mappingStatus, setMappingStatus] = useState('all')
  const [isActive, setIsActive] = useState('all')

  // Sort state
  const [sortBy, setSortBy] = useState<BffMappingListRequest['sortBy']>('subjectCode')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Selection and detail panel
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<BffMappingListItem | null>(null)
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [keyword, subjectType, subjectClass, mappingStatus, isActive, sortBy, sortOrder])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const params: BffMappingListRequest = {
        page: 1,
        pageSize: 50,
        sortBy,
        sortOrder,
      }

      if (keyword) params.keyword = keyword
      if (subjectType !== 'all') params.subjectType = subjectType as 'FIN' | 'KPI'
      if (subjectClass !== 'all') params.subjectClass = subjectClass as 'BASE' | 'AGGREGATE'
      if (mappingStatus !== 'all') params.mappingStatus = mappingStatus as 'mapped' | 'unmapped'
      if (isActive !== 'all') params.isActive = isActive === 'true'

      const response = await bffClient.getMappingList(params)
      setData(response)
    } catch (error) {
      console.error('Failed to load mapping list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetFilters = () => {
    setKeyword('')
    setSubjectType('all')
    setSubjectClass('all')
    setMappingStatus('all')
    setIsActive('all')
  }

  const handleSort = (field: BffMappingListRequest['sortBy']) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleBulkMapping = () => {
    setShowBulkDialog(true)
  }

  const selectedSubjects =
    data?.items.filter((item) => selectedIds.includes(item.companySubjectId)) || []

  return (
    <div className="h-full bg-background p-4">
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">連結科目マッピング</h1>
              <p className="text-sm text-muted-foreground">会社科目と連結科目のマッピング管理</p>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <Button onClick={handleBulkMapping}>
              <Layers className="h-4 w-4 mr-2" />
              一括マッピング（{selectedIds.length}件）
            </Button>
          )}
        </div>

        {/* Statistics */}
        {data && (
          <MappingStatsBar
            mappedCount={data.statistics.mappedCount}
            unmappedCount={data.statistics.unmappedCount}
            totalCount={data.statistics.totalCount}
          />
        )}

        {/* Filters */}
        <MappingFilterPanel
          keyword={keyword}
          subjectType={subjectType}
          subjectClass={subjectClass}
          mappingStatus={mappingStatus}
          isActive={isActive}
          onKeywordChange={setKeyword}
          onSubjectTypeChange={setSubjectType}
          onSubjectClassChange={setSubjectClass}
          onMappingStatusChange={setMappingStatus}
          onIsActiveChange={setIsActive}
          onReset={handleResetFilters}
        />

        {/* Main Content */}
        <div className="flex gap-6">
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                読み込み中...
              </div>
            ) : data ? (
              <MappingList
                items={data.items}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={setSelectedItem}
                onSort={handleSort}
                currentSort={{ sortBy: sortBy || '', sortOrder }}
              />
            ) : null}
          </div>

          {selectedItem && (
            <MappingDetailPanel
              item={selectedItem}
              bffClient={bffClient}
              onClose={() => setSelectedItem(null)}
              onRefresh={() => {
                loadData()
                setSelectedIds([])
              }}
            />
          )}
        </div>
      </div>

      <BulkMappingDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        selectedSubjects={selectedSubjects}
        bffClient={bffClient}
        onSuccess={() => {
          loadData()
          setSelectedIds([])
        }}
      />
    </div>
  )
}

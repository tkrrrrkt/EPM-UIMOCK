'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button, Card } from '@/shared/ui'
import { ApprovalSearchPanel } from './components/ApprovalSearchPanel'
import { ApprovalList } from './components/ApprovalList'
import { ApprovalDetailPanel } from './components/ApprovalDetailPanel'
import { bffClient } from './api'
import type {
  BffApprovalSummary,
  BffApprovalDetailResponse,
  BffApprovalActionRequest,
  BffApprovalHistoryItem,
  ScenarioType,
} from '@epm/contracts/bff/approval'

export default function ApprovalListPage() {
  // List state
  const [listLoading, setListLoading] = useState(false)
  const [approvals, setApprovals] = useState<BffApprovalSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [scenarioType, setScenarioType] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [sortBy, setSortBy] = useState('submittedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Detail state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BffApprovalDetailResponse | null>(null)
  const [history, setHistory] = useState<BffApprovalHistoryItem[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Load list
  const loadApprovals = useCallback(async () => {
    setListLoading(true)
    try {
      const response = await bffClient.listApprovals({
        page,
        pageSize,
        sortBy: sortBy as 'departmentName' | 'submittedAt' | 'eventName',
        sortOrder,
        keyword: keyword || undefined,
        scenarioType: scenarioType === 'all' ? undefined : (scenarioType as ScenarioType),
      })
      setApprovals(response.items)
      setTotalCount(response.totalCount)
    } finally {
      setListLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder, keyword, scenarioType])

  // Load detail and history
  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const [detailResponse, historyResponse] = await Promise.all([
        bffClient.getApprovalDetail(id),
        bffClient.getApprovalHistory(id),
      ])
      setDetail(detailResponse)
      setHistory(historyResponse.items)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Initial load and reload on filter changes
  useEffect(() => {
    loadApprovals()
  }, [loadApprovals])

  // Load detail when selection changes
  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId)
    } else {
      setDetail(null)
      setHistory([])
    }
  }, [selectedId, loadDetail])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleScenarioTypeChange = (value: string) => {
    setScenarioType(value)
    setPage(1)
  }

  const handleSelect = (approval: BffApprovalSummary) => {
    setSelectedId(approval.id)
  }

  // Action handlers
  const handleSubmit = async (id: string, request: BffApprovalActionRequest) => {
    await bffClient.submitApproval(id, request)
    await loadApprovals()
    await loadDetail(id)
  }

  const handleApprove = async (id: string, request: BffApprovalActionRequest) => {
    await bffClient.approveApproval(id, request)
    await loadApprovals()
    await loadDetail(id)
  }

  const handleReject = async (id: string, request: BffApprovalActionRequest) => {
    await bffClient.rejectApproval(id, request)
    await loadApprovals()
    await loadDetail(id)
  }

  const handleWithdraw = async (id: string, request: BffApprovalActionRequest) => {
    await bffClient.withdrawApproval(id, request)
    await loadApprovals()
    await loadDetail(id)
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">承認ワークフロー</h1>
          <p className="text-muted-foreground mt-1">予算・見込の承認申請と承認処理</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadApprovals} disabled={listLoading}>
          <RefreshCw className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search Panel */}
      <Card className="p-4">
        <ApprovalSearchPanel
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          scenarioType={scenarioType}
          onScenarioTypeChange={handleScenarioTypeChange}
        />
      </Card>

      {/* Split View - 詳細パネルを広めに */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - List */}
        <div>
          <Card className="p-4">
            <ApprovalList
              approvals={approvals}
              selectedId={selectedId}
              onSelect={handleSelect}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </Card>
        </div>

        {/* Right Pane - Detail */}
        <div>
          <ApprovalDetailPanel
            detail={detail}
            history={history}
            loading={detailLoading}
            onSubmit={handleSubmit}
            onApprove={handleApprove}
            onReject={handleReject}
            onWithdraw={handleWithdraw}
          />
        </div>
      </div>
    </div>
  )
}

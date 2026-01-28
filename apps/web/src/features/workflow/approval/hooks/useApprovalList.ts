'use client'

import { useState, useEffect, useCallback } from 'react'
import { bffClient } from '../api'
import type {
  BffApprovalSummary,
  BffApprovalListRequest,
  ScenarioType,
} from '@epm/contracts/bff/approval'

interface UseApprovalListOptions {
  initialPage?: number
  initialPageSize?: number
  initialSortBy?: 'departmentName' | 'submittedAt' | 'eventName'
  initialSortOrder?: 'asc' | 'desc'
}

interface UseApprovalListReturn {
  approvals: BffApprovalSummary[]
  totalCount: number
  loading: boolean
  error: Error | null
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  keyword: string
  scenarioType: ScenarioType | undefined
  setPage: (page: number) => void
  setKeyword: (keyword: string) => void
  setScenarioType: (type: ScenarioType | undefined) => void
  handleSort: (column: string) => void
  refetch: () => Promise<void>
}

export function useApprovalList(options: UseApprovalListOptions = {}): UseApprovalListReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialSortBy = 'submittedAt',
    initialSortOrder = 'desc',
  } = options

  const [approvals, setApprovals] = useState<BffApprovalSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(initialPageSize)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)
  const [keyword, setKeyword] = useState('')
  const [scenarioType, setScenarioType] = useState<ScenarioType | undefined>(undefined)

  const fetchApprovals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const request: BffApprovalListRequest = {
        page,
        pageSize,
        sortBy: sortBy as 'departmentName' | 'submittedAt' | 'eventName',
        sortOrder,
        keyword: keyword || undefined,
        scenarioType,
      }
      const response = await bffClient.listApprovals(request)
      setApprovals(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch approvals'))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder, keyword, scenarioType])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const handleSort = useCallback((column: string) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortOrder('asc')
      return column as 'departmentName' | 'submittedAt' | 'eventName'
    })
    setPage(1)
  }, [])

  const handleSetKeyword = useCallback((value: string) => {
    setKeyword(value)
    setPage(1)
  }, [])

  const handleSetScenarioType = useCallback((type: ScenarioType | undefined) => {
    setScenarioType(type)
    setPage(1)
  }, [])

  return {
    approvals,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword,
    scenarioType,
    setPage,
    setKeyword: handleSetKeyword,
    setScenarioType: handleSetScenarioType,
    handleSort,
    refetch: fetchApprovals,
  }
}

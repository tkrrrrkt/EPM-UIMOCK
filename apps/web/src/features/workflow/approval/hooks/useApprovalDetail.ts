'use client'

import { useState, useEffect, useCallback } from 'react'
import { bffClient } from '../api'
import type {
  BffApprovalDetailResponse,
  BffApprovalActionRequest,
  BffApprovalActionResponse,
} from '@epm/contracts/bff/approval'

interface UseApprovalDetailReturn {
  detail: BffApprovalDetailResponse | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  submitApproval: (request?: BffApprovalActionRequest) => Promise<BffApprovalActionResponse | null>
  approveApproval: (request?: BffApprovalActionRequest) => Promise<BffApprovalActionResponse | null>
  rejectApproval: (request?: BffApprovalActionRequest) => Promise<BffApprovalActionResponse | null>
  withdrawApproval: (request?: BffApprovalActionRequest) => Promise<BffApprovalActionResponse | null>
  actionLoading: boolean
  actionError: Error | null
}

export function useApprovalDetail(id: string | null): UseApprovalDetailReturn {
  const [detail, setDetail] = useState<BffApprovalDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setDetail(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.getApprovalDetail(id)
      setDetail(response)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch approval detail'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const executeAction = useCallback(
    async (
      action: (id: string, request: BffApprovalActionRequest) => Promise<BffApprovalActionResponse>,
      request: BffApprovalActionRequest = {}
    ): Promise<BffApprovalActionResponse | null> => {
      if (!id) return null

      setActionLoading(true)
      setActionError(null)
      try {
        const response = await action(id, request)
        // Refetch detail after action
        await fetchDetail()
        return response
      } catch (err) {
        setActionError(err instanceof Error ? err : new Error('Action failed'))
        return null
      } finally {
        setActionLoading(false)
      }
    },
    [id, fetchDetail]
  )

  const submitApproval = useCallback(
    (request?: BffApprovalActionRequest) =>
      executeAction(bffClient.submitApproval.bind(bffClient), request),
    [executeAction]
  )

  const approveApproval = useCallback(
    (request?: BffApprovalActionRequest) =>
      executeAction(bffClient.approveApproval.bind(bffClient), request),
    [executeAction]
  )

  const rejectApproval = useCallback(
    (request?: BffApprovalActionRequest) =>
      executeAction(bffClient.rejectApproval.bind(bffClient), request),
    [executeAction]
  )

  const withdrawApproval = useCallback(
    (request?: BffApprovalActionRequest) =>
      executeAction(bffClient.withdrawApproval.bind(bffClient), request),
    [executeAction]
  )

  return {
    detail,
    loading,
    error,
    refetch: fetchDetail,
    submitApproval,
    approveApproval,
    rejectApproval,
    withdrawApproval,
    actionLoading,
    actionError,
  }
}

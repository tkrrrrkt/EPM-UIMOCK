'use client'

import { useState, useEffect, useCallback } from 'react'
import { bffClient } from '../api'

interface UseApprovalCountReturn {
  count: number
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseApprovalCountOptions {
  refreshInterval?: number
}

export function useApprovalCount(options: UseApprovalCountOptions = {}): UseApprovalCountReturn {
  const { refreshInterval = 60000 } = options

  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCount = useCallback(async () => {
    setError(null)
    try {
      const response = await bffClient.getApprovalCount()
      setCount(response.count)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch approval count'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchCount, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchCount, refreshInterval])

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}

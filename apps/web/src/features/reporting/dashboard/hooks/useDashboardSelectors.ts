/**
 * useDashboardSelectors Hook
 *
 * Purpose:
 * - Fetch selectors (fiscal years, plan events, versions, departments)
 * - Manage loading/error states
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 4)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { bffClient } from '../api/client';
import type { BffDashboardSelectorsResponseDto, BffDashboardSelectorsRequestDto } from '@epm/contracts/bff/dashboard';

interface UseDashboardSelectorsReturn {
  selectors: BffDashboardSelectorsResponseDto | null;
  loading: boolean;
  error: Error | null;
  refetch: (query?: BffDashboardSelectorsRequestDto) => Promise<void>;
}

/**
 * Custom hook for fetching dashboard selectors
 */
export function useDashboardSelectors(
  initialQuery?: BffDashboardSelectorsRequestDto
): UseDashboardSelectorsReturn {
  const [selectors, setSelectors] = useState<BffDashboardSelectorsResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<BffDashboardSelectorsRequestDto | undefined>(initialQuery);

  const fetchSelectors = useCallback(async (newQuery?: BffDashboardSelectorsRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bffClient.getSelectors(newQuery || query);
      setSelectors(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch selectors'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSelectors();
  }, [fetchSelectors]);

  return {
    selectors,
    loading,
    error,
    refetch: fetchSelectors,
  };
}

/**
 * useDashboard Hook
 *
 * Purpose:
 * - Fetch single dashboard detail with widgets
 * - Manage loading/error states
 * - Provide refetch functionality
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 2)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { bffClient } from '../api/client';
import type { BffDashboardDetailDto } from '@epm/contracts/bff/dashboard';

interface UseDashboardReturn {
  dashboard: BffDashboardDetailDto | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching single dashboard detail
 */
export function useDashboard(dashboardId: string): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<BffDashboardDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!dashboardId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await bffClient.getDashboard(dashboardId);
      setDashboard(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard'));
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

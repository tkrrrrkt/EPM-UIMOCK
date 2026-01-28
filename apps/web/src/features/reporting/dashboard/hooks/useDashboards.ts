/**
 * useDashboards Hook
 *
 * Purpose:
 * - Fetch dashboard list with pagination, sorting, and search
 * - Manage loading/error states
 * - Provide refetch functionality
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 1)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { bffClient } from '../api/client';
import type { BffDashboardDto } from '@epm/contracts/bff/dashboard';
import type { GetDashboardsQuery } from '../api/BffClient';

interface UseDashboardsOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

interface UseDashboardsReturn {
  dashboards: BffDashboardDto[];
  total: number;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  keyword: string;
  setPage: (page: number) => void;
  setKeyword: (keyword: string) => void;
  handleSort: (column: string) => void;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing dashboard list
 */
export function useDashboards(options: UseDashboardsOptions = {}): UseDashboardsReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialSortBy = 'sortOrder',
    initialSortOrder = 'asc',
  } = options;

  const [dashboards, setDashboards] = useState<BffDashboardDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [keyword, setKeyword] = useState('');

  const fetchDashboards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetDashboardsQuery = {
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword || undefined,
      };
      const response = await bffClient.getDashboards(query);
      setDashboards(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboards'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, keyword]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  const handleSort = useCallback((column: string) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return column;
    });
    setPage(1);
  }, []);

  const handleSetKeyword = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  return {
    dashboards,
    total,
    loading,
    error,
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword,
    setPage,
    setKeyword: handleSetKeyword,
    handleSort,
    refetch: fetchDashboards,
  };
}

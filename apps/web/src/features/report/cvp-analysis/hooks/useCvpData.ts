'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBffClient } from '../api';
import type { BffCvpDataRequest, BffCvpDataResponse, CvpFilterState } from '../types';

const bffClient = createBffClient();

function createDataRequest(companyId: string, filters: CvpFilterState): BffCvpDataRequest | null {
  if (
    !filters.fiscalYear ||
    !filters.primaryType ||
    !filters.departmentStableId ||
    !filters.granularity
  ) {
    return null;
  }

  return {
    companyId,
    fiscalYear: filters.fiscalYear,
    primaryType: filters.primaryType,
    primaryEventId: filters.primaryEventId ?? undefined,
    primaryVersionId: filters.primaryVersionId ?? undefined,
    compareEnabled: filters.compareEnabled,
    compareFiscalYear: filters.compareFiscalYear ?? undefined,
    compareType: filters.compareType ?? undefined,
    compareEventId: filters.compareEventId ?? undefined,
    compareVersionId: filters.compareVersionId ?? undefined,
    periodFrom: filters.periodFrom,
    periodTo: filters.periodTo,
    granularity: filters.granularity,
    departmentStableId: filters.departmentStableId,
    includeSubDepartments: filters.includeSubDepartments,
  };
}

export function useCvpData(companyId: string, filters: CvpFilterState) {
  const [data, setData] = useState<BffCvpDataResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const prevRequestRef = useRef<string | null>(null);
  const request = createDataRequest(companyId, filters);
  const requestKey = request ? JSON.stringify(request) : null;

  const fetchData = useCallback(async () => {
    if (!request) {
      setData(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bffClient.getData(request);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    // Only fetch if request has changed
    if (requestKey !== prevRequestRef.current) {
      prevRequestRef.current = requestKey;
      fetchData();
    }
  }, [requestKey, fetchData]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchData,
    isReady: !!request,
  };
}

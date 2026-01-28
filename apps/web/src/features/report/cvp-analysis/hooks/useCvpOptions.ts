'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBffClient } from '../api';
import type { BffCvpOptionsResponse } from '../types';

const bffClient = createBffClient();

export function useCvpOptions(companyId: string) {
  const [options, setOptions] = useState<BffCvpOptionsResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await bffClient.getOptions({ companyId });
      setOptions(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch options'));
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    isLoading,
    error,
    mutate: fetchOptions,
  };
}

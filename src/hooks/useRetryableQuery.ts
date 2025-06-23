
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

interface RetryableQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  manualRetry: () => void;
}

export function useRetryableQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T, Error>> & { maxRetries?: number }
): RetryableQueryResult<T> {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options?.maxRetries || 3;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKey, retryCount],
    queryFn,
    retry: maxRetries,
    staleTime: options?.staleTime || 0,
    enabled: options?.enabled !== false,
  });

  const manualRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    manualRetry
  };
}

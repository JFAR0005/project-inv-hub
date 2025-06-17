
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

interface RetryableQueryOptions<T> extends Omit<UseQueryOptions<T>, 'retry'> {
  maxRetries?: number;
  retryDelay?: number;
}

export const useRetryableQuery = <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: RetryableQueryOptions<T> = {}
) => {
  const [retryCount, setRetryCount] = useState(0);
  const { maxRetries = 3, retryDelay = 1000, ...queryOptions } = options;

  const query = useQuery({
    ...queryOptions,
    queryKey: [...queryKey, retryCount],
    queryFn,
    retry: (failureCount, error) => {
      console.log(`Query failed ${failureCount} times:`, error);
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => Math.min(retryDelay * Math.pow(2, attemptIndex), 30000),
  });

  const manualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    ...query,
    manualRetry,
    retryCount,
  };
};

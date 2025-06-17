
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

interface UseRetryableQueryOptions<T> extends UseQueryOptions<T> {
  maxRetries?: number;
}

export const useRetryableQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: UseRetryableQueryOptions<T> = {}
) => {
  const [retryCount, setRetryCount] = useState(0);
  const { maxRetries = 3, ...queryOptions } = options;

  const query = useQuery({
    queryKey,
    queryFn,
    retry: (failureCount) => {
      console.log(`Query failed, attempt ${failureCount + 1}/${maxRetries + 1}`);
      return failureCount < maxRetries;
    },
    ...queryOptions,
  });

  const manualRetry = () => {
    console.log('Manual retry triggered');
    setRetryCount(prev => prev + 1);
    query.refetch();
  };

  return {
    ...query,
    manualRetry,
    retryCount,
  };
};

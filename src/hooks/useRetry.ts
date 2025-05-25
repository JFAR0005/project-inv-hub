
import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (fn: () => Promise<any>) => {
    setIsRetrying(true);
    let lastError: Error;

    for (let i = 0; i <= maxAttempts; i++) {
      try {
        setAttempt(i);
        const result = await fn();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxAttempts) {
          const waitTime = backoff ? delay * Math.pow(2, i) : delay;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    setIsRetrying(false);
    setAttempt(0);
    throw lastError!;
  }, [maxAttempts, delay, backoff]);

  const reset = useCallback(() => {
    setAttempt(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    attempt,
    isRetrying,
    hasReachedMaxAttempts: attempt >= maxAttempts
  };
};

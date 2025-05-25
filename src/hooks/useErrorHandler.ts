
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    let errorMessage = fallbackMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message || fallbackMessage;
    }

    if (logError) {
      console.error('Error handled:', error);
    }

    if (showToast) {
      toast.error(errorMessage);
    }

    return errorMessage;
  }, []);

  const handleSupabaseError = useCallback((error: any) => {
    let message = 'Database operation failed';

    if (error?.code === 'PGRST116') {
      message = 'No data found';
    } else if (error?.code === '23505') {
      message = 'This record already exists';
    } else if (error?.code === '23503') {
      message = 'Cannot delete this record as it is referenced by other data';
    } else if (error?.message) {
      message = error.message;
    }

    return handleError(new Error(message));
  }, [handleError]);

  return {
    handleError,
    handleSupabaseError
  };
};

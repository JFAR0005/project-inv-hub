
import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ children }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load data</p>
              <Button onClick={reset} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default QueryErrorBoundary;

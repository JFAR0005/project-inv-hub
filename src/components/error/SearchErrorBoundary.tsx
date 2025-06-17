
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SearchErrorBoundaryProps {
  error: Error;
  onRetry?: () => void;
}

const SearchErrorBoundary: React.FC<SearchErrorBoundaryProps> = ({ error, onRetry }) => {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Search Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            {error.message || 'An error occurred while searching. Please try again.'}
          </p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Search
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SearchErrorBoundary;

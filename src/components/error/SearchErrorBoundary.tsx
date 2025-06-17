
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SearchErrorBoundaryProps {
  error: Error;
  onRetry: () => void;
  context?: string;
}

const SearchErrorBoundary: React.FC<SearchErrorBoundaryProps> = ({
  error,
  onRetry,
  context = 'search'
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-red-600">Search Error</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Something went wrong while performing {context}.
        </p>
        <p className="text-sm text-gray-500">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchErrorBoundary;

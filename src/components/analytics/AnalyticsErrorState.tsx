
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

interface AnalyticsErrorStateProps {
  error: Error;
  onRetry: () => void;
  context?: string;
}

const AnalyticsErrorState: React.FC<AnalyticsErrorStateProps> = ({
  error,
  onRetry,
  context = 'analytics'
}) => {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <AlertTriangle className="h-6 w-6 text-red-500 absolute -top-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-red-600">Analytics Error</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Unable to load {context} data at this time.
        </p>
        <details className="text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Error details
          </summary>
          <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
            {error.message || 'An unexpected error occurred'}
          </pre>
        </details>
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Loading
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsErrorState;

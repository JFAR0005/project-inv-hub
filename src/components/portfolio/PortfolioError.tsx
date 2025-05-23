
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PortfolioErrorProps {
  error: Error | null;
  onRetry: () => void;
}

const PortfolioError: React.FC<PortfolioErrorProps> = ({ error, onRetry }) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">Failed to Load Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {error?.message || 'An unexpected error occurred while loading your portfolio companies.'}
        </p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default PortfolioError;

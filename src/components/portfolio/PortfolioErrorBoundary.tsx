
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface PortfolioErrorBoundaryProps {
  children: React.ReactNode;
}

const PortfolioErrorBoundary: React.FC<PortfolioErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Portfolio Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading your portfolio data. This could be due to a temporary network issue or invalid data.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>What you can try:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Refresh the page</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default PortfolioErrorBoundary;

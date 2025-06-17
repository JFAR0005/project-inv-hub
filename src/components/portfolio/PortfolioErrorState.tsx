
import React from 'react';
import { AlertTriangle, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioErrorStateProps {
  onRetry?: () => void;
  onCreateCompany?: () => void;
  error?: string;
}

const PortfolioErrorState: React.FC<PortfolioErrorStateProps> = ({
  onRetry,
  onCreateCompany,
  error
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your portfolio companies
          </p>
        </div>
        {onCreateCompany && (
          <Button onClick={onCreateCompany}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Unable to load portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error || 'There was an error loading your portfolio companies. This might be because the database tables haven\'t been set up yet.'}
          </p>
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                Try Again
              </Button>
            )}
            {onCreateCompany && (
              <Button variant="outline" size="sm" onClick={onCreateCompany}>
                <Building2 className="w-4 h-4 mr-2" />
                Add First Company
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioErrorState;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyErrorStateProps {
  error: Error;
  onRetry?: () => void;
  companyName?: string;
}

const CompanyErrorState: React.FC<CompanyErrorStateProps> = ({
  error,
  onRetry,
  companyName
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-600">
            {companyName ? `Error Loading ${companyName}` : 'Company Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We encountered an issue while loading the company data.
          </p>
          <details className="text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Technical details
            </summary>
            <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
              {error.message || 'An unexpected error occurred'}
            </pre>
          </details>
          <div className="flex flex-col space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/portfolio')} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyErrorState;

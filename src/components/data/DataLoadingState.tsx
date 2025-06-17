
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface DataLoadingStateProps {
  message?: string;
  rows?: number;
  showCards?: boolean;
}

const DataLoadingState: React.FC<DataLoadingStateProps> = ({ 
  message = "Loading...", 
  rows = 3,
  showCards = true 
}) => {
  if (showCards) {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default DataLoadingState;


import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PortfolioSkeletonProps {
  viewMode: 'grid' | 'table' | 'overview';
  count?: number;
}

const PortfolioSkeleton: React.FC<PortfolioSkeletonProps> = ({ 
  viewMode, 
  count = 6 
}) => {
  if (viewMode === 'table') {
    return (
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-4 mb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4 py-3 border-t first:border-t-0">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'overview') {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="lg:col-span-1">
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-40 mx-auto mb-4" />
                <div className="h-60">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div>
                <Skeleton className="h-3 w-14 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioSkeleton;

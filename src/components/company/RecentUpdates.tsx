
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type FounderUpdate = Database['public']['Tables']['founder_updates']['Row'];

interface RecentUpdatesProps {
  updates: FounderUpdate[];
  isLoading: boolean;
  error: string | null;
}

const RecentUpdates: React.FC<RecentUpdatesProps> = ({ updates, isLoading, error }) => {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRaiseStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    
    if (status.toLowerCase().includes('raising')) {
      variant = 'default';
    } else if (status.toLowerCase().includes('not')) {
      variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getUpdateAge = (updateDate: string) => {
    const today = new Date();
    const submitted = new Date(updateDate);
    const diffTime = Math.abs(today.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Updates Found</h3>
          <p className="text-muted-foreground mb-4">
            This company hasn't submitted any updates yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(update.submitted_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {getUpdateAge(update.submitted_at) > 30 ? (
                    <Badge variant="destructive">
                      {getUpdateAge(update.submitted_at)} days old
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {getUpdateAge(update.submitted_at)} days old
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {getRaiseStatusBadge(update.raise_status)}
                  
                  {update.arr && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        ARR: {formatCurrency(update.arr)}
                      </span>
                    </div>
                  )}
                </div>
                
                {update.comments && (
                  <div>
                    <div className="text-sm font-medium mb-1">Commentary</div>
                    <p className="text-sm line-clamp-2">{update.comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentUpdates;
